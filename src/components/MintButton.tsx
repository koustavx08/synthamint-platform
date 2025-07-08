import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface MintButtonProps {
  onMint: () => void;
  isLoading: boolean;
  isUploading: boolean;
  isPending: boolean;
  disabled?: boolean;
}

const MintButton = ({
  onMint,
  isLoading,
  isUploading,
  isPending,
  disabled = false,
}: MintButtonProps) => {
  const getLoadingText = () => {
    if (isUploading) return 'Uploading to IPFS...';
    if (isPending) return 'Confirming...';
    return 'Minting...';
  };

  return (
    <Button
      onClick={onMint}
      disabled={isLoading || disabled}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          {getLoadingText()}
        </>
      ) : (
        'Mint NFT (0.01 AVAX)'
      )}
    </Button>
  );
};

export default MintButton;
