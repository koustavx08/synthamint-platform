
import { Card } from '@/components/ui/card';

const SetupInstructions = () => {
  return (
    <Card className="p-6 bg-yellow-500/10 border-yellow-500/30 mb-6">
      <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Setup Required</h3>
      <div className="text-yellow-200 text-sm space-y-2">
        <p><strong>1. Deploy your NFT contract</strong> on Avalanche Fuji testnet</p>
        <div className="ml-4 text-xs text-yellow-300">
          • Navigate to <code className="bg-slate-700 px-1 rounded">contracts/</code> folder
          • Run <code className="bg-slate-700 px-1 rounded">npm install && npm run deploy:fuji</code>
          • See <code className="bg-slate-700 px-1 rounded">contracts/README.md</code> for detailed steps
        </div>
        <p><strong>2. Update contract address</strong> in <code className="bg-slate-700 px-1 rounded">src/config/contract.ts</code></p>
        <p><strong>3. Add Replicate API key</strong> for AI image generation</p>
        <p><strong>4. Set up IPFS storage</strong> (Pinata, NFT.Storage, or similar)</p>
        <p><strong>5. Get AVAX testnet tokens</strong> from <a href="https://faucet.avax.network/" target="_blank" className="text-blue-400 hover:underline">Avalanche faucet</a></p>
      </div>
    </Card>
  );
};

export default SetupInstructions;
