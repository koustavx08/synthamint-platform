import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';

const MintSuccessDisplay = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-white" />
          <h3 className="text-2xl font-bold text-white">NFT Minted Successfully!</h3>
          <p className="text-green-100 mt-1">Your artwork is now on the blockchain</p>
        </div>
      </div>
      
      <div className="p-6 text-center space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="text-green-800 font-semibold text-lg mb-2">🎉 Congratulations!</h4>
          <p className="text-green-700 text-sm">
            Your AI-generated artwork has been successfully minted as an NFT and added to your wallet.
          </p>
        </div>
        
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 mr-3" />
          Create Another Masterpiece
        </Button>
      </div>
    </Card>
  );
};

export default MintSuccessDisplay;
