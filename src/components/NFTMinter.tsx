
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
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-white">Mint as NFT</h4>
              <p className="text-sm text-gray-300">Create a unique token on the blockchain</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfigModal(true)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              {hasCredentials ? 'Update' : 'Setup'} IPFS
            </Button>
          </div>
          
          {!hasCredentials && (
            <div className="mt-4 bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-amber-300 text-sm font-medium">IPFS Configuration Required</p>
                  <p className="text-amber-200 text-xs mt-1">
                    Configure your Pinata API credentials to store your artwork on IPFS
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NFT Metadata Form */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              NFT Details
            </label>
            <div className="space-y-3">
              <Input
                placeholder="Enter NFT name (optional)"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
              <Input
                placeholder="Enter NFT description (optional)"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
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
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
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
