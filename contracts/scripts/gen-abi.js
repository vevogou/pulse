const fs = require('fs');

const names = ['PulseVault','StreamEngine','WorkerRegistry','PulseScore','MerchantCashout'];
const abis = {};
names.forEach(n => {
  const art = JSON.parse(fs.readFileSync('artifacts/src/'+n+'.sol/'+n+'.json','utf8'));
  abis[n] = art.abi;
});

const keyMap = {
  PulseVault: 'PULSE_VAULT_ABI',
  StreamEngine: 'STREAM_ENGINE_ABI',
  WorkerRegistry: 'WORKER_REGISTRY_ABI',
  PulseScore: 'PULSE_SCORE_ABI',
  MerchantCashout: 'MERCHANT_CASHOUT_ABI',
};

let out = `import { type Address } from 'viem';

// ── Contract Addresses ──
export const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359') as Address;
export const AAVE_POOL_ADDRESS = (import.meta.env.VITE_AAVE_POOL || '0x794a61358D6845594F94dc1DB02A252b5b4814aD') as Address;
export const PULSE_VAULT_ADDRESS = (import.meta.env.VITE_PULSE_VAULT_ADDRESS || '') as Address;
export const STREAM_ENGINE_ADDRESS = (import.meta.env.VITE_STREAM_ENGINE_ADDRESS || '') as Address;
export const WORKER_REGISTRY_ADDRESS = (import.meta.env.VITE_WORKER_REGISTRY_ADDRESS || '') as Address;
export const PULSE_SCORE_ADDRESS = (import.meta.env.VITE_PULSE_SCORE_ADDRESS || '') as Address;
export const MERCHANT_CASHOUT_ADDRESS = (import.meta.env.VITE_MERCHANT_CASHOUT_ADDRESS || '') as Address;

// ── USDC ABI (ERC-20 subset) ──
export const USDC_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
] as const;

`;

for (const [name, key] of Object.entries(keyMap)) {
  out += `// ── ${name} ABI (auto-generated from compiled artifacts) ──\n`;
  out += `export const ${key} = ${JSON.stringify(abis[name], null, 2)} as const;\n\n`;
}

out += `// ── Chain Config ──
export const POLYGON_CHAIN_ID = 137;
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || 'https://polygonscan.com';
`;

fs.writeFileSync('../web/src/config/contracts.ts', out);
console.log('Generated contracts.ts with', Object.keys(abis).length, 'real ABIs');
