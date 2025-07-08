
import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    metaMask(),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});
