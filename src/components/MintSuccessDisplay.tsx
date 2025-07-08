import { Button } from '@/components/ui/button';

const MintSuccessDisplay = () => {
  return (
    <div className="text-center py-6">
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
        <h4 className="text-green-400 font-semibold">NFT Minted Successfully! 🎉</h4>
        <p className="text-green-300 text-sm mt-1">
          Your AI-generated NFT has been minted to your wallet
        </p>
      </div>
      <Button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        Create Another NFT
      </Button>
    </div>
  );
};

export default MintSuccessDisplay;
