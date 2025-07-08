import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface NFTMinterHeaderProps {
  hasCredentials: boolean;
  onConfigClick: () => void;
}

const NFTMinterHeader = ({ hasCredentials, onConfigClick }: NFTMinterHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-white">Mint NFT</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={onConfigClick}
        className="border-slate-600 text-gray-300 hover:text-white"
      >
        <Settings className="w-4 h-4 mr-2" />
        {hasCredentials ? 'Update' : 'Configure'} IPFS
      </Button>
    </div>
  );
};

export default NFTMinterHeader;
