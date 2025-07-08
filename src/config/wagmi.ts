
import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId: 'demo-project-id', // You should replace this with a real project ID from walletconnect.com
    }),
    coinbaseWallet({ appName: 'SynthaMint' }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});
