// app/contract.ts
// Base 2048 Leaderboard — Base Mainnet (8453)
export const LEADERBOARD_ADDRESS = '0x4C7b13f683B397B5D89cC8EbCF294dc22BBe64E4' as const;
export const BASE_MAINNET_CHAIN_ID = 8453;

export const LEADERBOARD_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'score', type: 'uint256' }],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'highScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getStats',
    outputs: [
      { internalType: 'uint256', name: 'high', type: 'uint256' },
      { internalType: 'uint256', name: 'count', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalPlayers',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getScoreCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'score', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'newHighScore', type: 'bool' },
    ],
    name: 'ScoreSubmitted',
    type: 'event',
  },
] as const;
