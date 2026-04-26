// app/contract.ts
// Base 2048 Leaderboard — Base Sepolia (84532)

export const LEADERBOARD_ADDRESS = '0x58137217816557bA97cF47e522eB9D45c4233e91' as const;

export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const LEADERBOARD_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_score', type: 'uint256' }],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'bestScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_player', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { internalType: 'uint256', name: 'best', type: 'uint256' },
      { internalType: 'uint256', name: 'plays', type: 'uint256' },
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
    name: 'totalSubmissions',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;