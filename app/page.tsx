'use client';

import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import Game2048 from './Game2048';

export default function Page() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #EFF6FF, #FFFFFF)',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Wallet>
            <ConnectWallet />
          </Wallet>
        </div>

        <Game2048 />

        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7280',
        }}>
          Built on Base · by @SerhatDolmac
        </div>
      </div>
    </div>
  );
}