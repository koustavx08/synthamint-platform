import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { metaMask, coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from environment variables
// To use WalletConnect, get a free project ID from https://cloud.walletconnect.com
// and add VITE_WALLETCONNECT_PROJECT_ID=your_project_id to your .env file
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    metaMask(),
    injected(),
    coinbaseWallet({ appName: 'DreamMint' }),
    // Only include WalletConnect if we have a valid project ID
    ...(walletConnectProjectId && walletConnectProjectId !== 'demo-project-id' 
      ? [walletConnect({ projectId: walletConnectProjectId })] 
      : []
    ),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});
