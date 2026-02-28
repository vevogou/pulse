import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'PLACEHOLDER';
const rpcUrl = import.meta.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com';

export const config = getDefaultConfig({
  appName: 'PULSE',
  projectId,
  chains: [polygon],
  transports: {
    [polygon.id]: http(rpcUrl),
  },
  ssr: false,
});
