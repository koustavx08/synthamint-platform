
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Loader } from 'lucide-react';
import { usePinataConfig } from '@/hooks/usePinataConfig';
import { useNFTMinting } from '@/hooks/useNFTMinting';
import IPFSConfigModal from './IPFSConfigModal';
import MintSuccessDisplay from './MintSuccessDisplay';
import TransactionHash from './TransactionHash';

interface NFTMinterProps {
  imageUrl: string;
  prompt: string;
}

const NFTMinter = ({ imageUrl, prompt }: NFTMinterProps) => {
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const { pinataApiKey, pinataSecretKey, hasCredentials, saveConfig } = usePinataConfig();
  
  const {
    mintNFT,
    isLoading,
    isUploading,
    isPending,
    isSuccess,
    hash,
  } = useNFTMinting({
    imageUrl,
    prompt,
    pinataApiKey,
    pinataSecretKey,
    nftName,
    nftDescription,
    onConfigRequired: () => setShowConfigModal(true),
  });

  if (isSuccess) {
    return <MintSuccessDisplay />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* IPFS Configuration Header */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Mint as NFT</h4>
              <p className="text-sm text-gray-600">Create a unique token on the blockchain</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfigModal(true)}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              {hasCredentials ? 'Update' : 'Setup'} IPFS
            </Button>
          </div>
          
          {!hasCredentials && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-amber-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-amber-800 text-sm font-medium">IPFS Configuration Required</p>
                  <p className="text-amber-700 text-xs mt-1">
                    Configure your Pinata API credentials to store your artwork on IPFS
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NFT Metadata Form */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NFT Details
            </label>
            <div className="space-y-3">
              <Input
                placeholder="Enter NFT name (optional)"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                placeholder="Enter NFT description (optional)"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            onClick={mintNFT}
            disabled={isLoading}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                {isUploading ? 'Uploading to IPFS...' : isPending ? 'Confirming Transaction...' : 'Processing...'}
              </>
            ) : (
              'Mint NFT (0.01 AVAX)'
            )}
          </Button>
          
          {hash && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TransactionHash hash={hash} />
            </div>
          )}
        </div>
      </div>

      <IPFSConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={saveConfig}
        initialApiKey={pinataApiKey}
        initialSecretKey={pinataSecretKey}
      />
    </>
  );
};

export default NFTMinter;
