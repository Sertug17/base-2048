'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { LEADERBOARD_ADDRESS, LEADERBOARD_ABI } from './contract';

const SIZE = 4;

const TILES: Record<number, { label: string; bg: string; fg: string }> = {
  2:    { label: 'BASE',   bg: '#0052FF', fg: '#FFFFFF' },
  4:    { label: 'ETH',    bg: '#627EEA', fg: '#FFFFFF' },
  8:    { label: 'USDC',   bg: '#2775CA', fg: '#FFFFFF' },
  16:   { label: 'OP',     bg: '#FF0420', fg: '#FFFFFF' },
  32:   { label: 'ARB',    bg: '#28A0F0', fg: '#FFFFFF' },
  64:   { label: 'MATIC',  bg: '#8247E5', fg: '#FFFFFF' },
  128:  { label: 'SOL',    bg: '#14F195', fg: '#0F2027' },
  256:  { label: 'BTC',    bg: '#F7931A', fg: '#FFFFFF' },
  512:  { label: 'DIAM',   bg: '#B9F2FF', fg: '#0F2027' },
  1024: { label: 'KING',   bg: '#FFD700', fg: '#3A2A00' },
  2048: { label: 'MASTER', bg: '#0F2027', fg: '#FFD700' },
  4096: { label: 'GOD',    bg: '#000000', fg: '#FFD700' },
};

type Direction = 'up' | 'down' | 'left' | 'right';
type Board = number[][];

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function spawn(b: Board): Board {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (b[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return b;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = b.map((row) => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideRowLeft(row: number[]): { row: number[]; gained: number } {
  const filtered = row.filter((v) => v !== 0);
  let gained = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      gained += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < SIZE) filtered.push(0);
  return { row: filtered, gained };
}

function rotate(b: Board): Board {
  const out = emptyBoard();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) out[c][SIZE - 1 - r] = b[r][c];
  return out;
}

function move(b: Board, dir: Direction): { board: Board; gained: number; changed: boolean } {
  let working = b.map((r) => [...r]);
  let rotations = 0;
  if (dir === 'up') rotations = 3;
  if (dir === 'right') rotations = 2;
  if (dir === 'down') rotations = 1;
  for (let i = 0; i < rotations; i++) working = rotate(working);

  let totalGained = 0;
  let changed = false;
  const newRows = working.map((row) => {
    const before = row.join(',');
    const { row: newRow, gained } = slideRowLeft(row);
    totalGained += gained;
    if (before !== newRow.join(',')) changed = true;
    return newRow;
  });

  let result = newRows;
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotate(result);
  return { board: result, gained: totalGained, changed };
}

function hasMoves(b: Board): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r][c] === 0) return true;
    if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return true;
    if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return true;
  }
  return false;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '440px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' },
  title: { fontSize: '28px', fontWeight: 500, color: '#0052FF' },
  subtitle: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  scoreBoxes: { display: 'flex', gap: '8px' },
  scoreBox: { background: '#0052FF', color: '#FFFFFF', padding: '8px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '70px' },
  bestBox: { background: '#E5E7EB', color: '#1F2937', padding: '8px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '70px' },
  scoreLabel: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85 },
  scoreValue: { fontSize: '18px', fontWeight: 500 },
  board: { width: '100%', aspectRatio: '1 / 1', background: '#BBDEFB', borderRadius: '12px', padding: '10px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: '10px', userSelect: 'none', touchAction: 'none', position: 'relative' },
  cellEmpty: { background: 'rgba(255,255,255,0.4)', borderRadius: '6px' },
  cellTile: { borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 500, transition: 'transform 0.1s ease' },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0, 82, 255, 0.92)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 10, padding: '20px', textAlign: 'center' },
  overlayTitle: { fontSize: '32px', fontWeight: 500, marginBottom: '8px' },
  overlayScore: { fontSize: '16px', opacity: 0.9, marginBottom: '20px' },
  overlayBtn: { background: '#FFFFFF', color: '#0052FF', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', marginTop: '8px' },
  controls: { display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  newGameBtn: { background: '#0052FF', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer' },
  submitBtn: { background: '#10B981', color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer' },
  submitBtnDisabled: { background: '#9CA3AF', color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'not-allowed' },
  hint: { fontSize: '12px', color: '#6B7280' },
  onchainBox: { width: '100%', marginTop: '20px', padding: '14px', background: '#F0F9FF', border: '1px solid #BFDBFE', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  onchainTitle: { fontSize: '13px', fontWeight: 500, color: '#1E40AF' },
  onchainBest: { fontSize: '12px', color: '#3B82F6' },
  txStatus: { fontSize: '11px', color: '#059669', wordBreak: 'break-all' },
};

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => {
    let b = emptyBoard();
    b = spawn(b);
    b = spawn(b);
    return b;
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Onchain hooks
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Onchain best score okuma
  const { data: onchainBest, refetch: refetchBest } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: 'highScore',
    chainId: 8453,
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    const saved = localStorage.getItem('base2048Best');
    if (saved) setBest(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem('base2048Best', String(score));
    }
  }, [score, best]);

  useEffect(() => {
    if (isConfirmed) refetchBest();
  }, [isConfirmed, refetchBest]);

  const doMove = useCallback((dir: Direction) => {
    if (gameOver) return;
    setBoard((prev) => {
      const result = move(prev, dir);
      if (!result.changed) return prev;
      const after = spawn(result.board);
      setScore((s) => s + result.gained);
      if (!won && after.flat().includes(2048)) setWon(true);
      if (!hasMoves(after)) setGameOver(true);
      return after;
    });
  }, [gameOver, won]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.code]) { e.preventDefault(); doMove(map[e.code]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doMove]);

  useEffect(() => {
    let startX = 0, startY = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absX = Math.abs(dx), absY = Math.abs(dy);
      if (Math.max(absX, absY) < 25) return;
      if (absX > absY) doMove(dx > 0 ? 'right' : 'left');
      else doMove(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [doMove]);

  const reset = () => {
    let b = emptyBoard();
    b = spawn(b);
    b = spawn(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const submitOnchain = () => {
    if (!isConnected || score === 0) return;
    writeContract({
      address: LEADERBOARD_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'submitScore',
      chainId: 8453,
      args: [BigInt(score)],
    });
  };

  const onchainBestStr = onchainBest ? onchainBest.toString() : '0';
  const canSubmit = isConnected && score > 0 && !isPending && !isConfirming;

  let submitText = 'Skoru onchain kaydet';
  if (isPending) submitText = 'Cüzdan onayı bekleniyor...';
  else if (isConfirming) submitText = 'Zincire yazılıyor...';
  else if (isConfirmed) submitText = '✓ Zincire yazıldı!';

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Base 2048</div>
          <div style={styles.subtitle}>Birleştir, kazan, onchain ol</div>
        </div>
        <div style={styles.scoreBoxes}>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>Skor</div>
            <div style={styles.scoreValue}>{score}</div>
          </div>
          <div style={styles.bestBox}>
            <div style={styles.scoreLabel}>En iyi</div>
            <div style={styles.scoreValue}>{best}</div>
          </div>
        </div>
      </div>

      <div style={styles.board}>
        {board.flat().map((value, idx) => {
          if (value === 0) return <div key={idx} style={styles.cellEmpty} />;
          const data = TILES[value] || { label: String(value), bg: '#000', fg: '#FFF' };
          return (
            <div key={idx} style={{ ...styles.cellTile, background: data.bg, color: data.fg }}>
              <div style={{ fontSize: data.label.length > 4 ? '10px' : '12px', letterSpacing: '0.5px', opacity: 0.95 }}>{data.label}</div>
              <div style={{ fontSize: value < 100 ? '24px' : value < 1000 ? '20px' : '16px', lineHeight: 1, marginTop: '2px' }}>{value}</div>
            </div>
          );
        })}

        {gameOver && (
          <div style={styles.overlay}>
            <div style={styles.overlayTitle}>Game over</div>
            <div style={styles.overlayScore}>Skor: {score}</div>
            {isConnected && score > 0 && (
              <button onClick={submitOnchain} disabled={!canSubmit} style={canSubmit ? styles.submitBtn : styles.submitBtnDisabled}>
                {submitText}
              </button>
            )}
            <button onClick={reset} style={styles.overlayBtn}>Tekrar oyna</button>
          </div>
        )}

        {won && !gameOver && (
          <div style={styles.overlay}>
            <div style={styles.overlayTitle}>Master oldun! 🏆</div>
            <div style={styles.overlayScore}>Skor: {score}</div>
            <button onClick={() => setWon(false)} style={styles.overlayBtn}>Devam et</button>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button onClick={reset} style={styles.newGameBtn}>Yeni oyun</button>
        <span style={styles.hint}>Ok tuşları veya swipe ile oyna</span>
      </div>

      {isConnected && (
        <div style={styles.onchainBox}>
          <div style={styles.onchainTitle}>🔗 Onchain (Base Mainnet)</div>
          <div style={styles.onchainBest}>
            Zincirdeki en yüksek skorun: <strong>{onchainBestStr}</strong>
          </div>
          <button
            onClick={submitOnchain}
            disabled={!canSubmit}
            style={canSubmit ? styles.submitBtn : styles.submitBtnDisabled}
          >
            {submitText}
          </button>
          {txHash && (
            <div style={styles.txStatus}>
              TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
          )}
          {writeError && (
            <div style={{ ...styles.txStatus, color: '#DC2626' }}>
              Hata: {writeError.message.slice(0, 80)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}