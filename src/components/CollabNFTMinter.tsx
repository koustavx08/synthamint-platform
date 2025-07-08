
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Loader, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '../config/contract';
import { avalancheFuji } from 'viem/chains';
import { uploadToIPFS } from '../utils/ipfsUtils';

interface CollabNFTMinterProps {
  imageUrl: string;
  hostPrompt: string;
  guestPrompt: string;
  hostAddress: string;
  guestAddress: string;
}

const CollabNFTMinter = ({ 
  imageUrl, 
  hostPrompt, 
  guestPrompt, 
  hostAddress, 
  guestAddress 
}: CollabNFTMinterProps) => {
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pinataApiKey, setPinataApiKey] = useState('');
  const [pinataSecretKey, setPinataSecretKey] = useState('');
  
  const { address } = useAccount();
  const { toast } = useToast();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedApiKey = localStorage.getItem('pinata_api_key');
    const savedSecretKey = localStorage.getItem('pinata_secret_key');
    if (savedApiKey) setPinataApiKey(savedApiKey);
    if (savedSecretKey) setPinataSecretKey(savedSecretKey);
  }, []);

  const uploadCollabMetadata = async () => {
    if (!pinataApiKey || !pinataSecretKey) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Pinata API credentials first.",
        variant: "destructive",
      });
      throw new Error('API credentials not configured');
    }

    setIsUploading(true);
    console.log('Uploading collaborative NFT to IPFS...');

    try {
      const metadata = {
        name: nftName || 'Collaborative AI NFT',
        description: nftDescription || `Collaborative AI generated artwork created by two artists`,
        attributes: [
          {
            trait_type: 'Generation Method',
            value: 'Collaborative AI'
          },
          {
            trait_type: 'Host Prompt',
            value: hostPrompt
          },
          {
            trait_type: 'Guest Prompt',
            value: guestPrompt
          },
          {
            trait_type: 'Host Artist',
            value: hostAddress
          },
          {
            trait_type: 'Guest Artist',
            value: guestAddress
          },
          {
            trait_type: 'Collaboration Type',
            value: 'Dual Ownership'
          }
        ]
      };

      const { metadataHash } = await uploadToIPFS(imageUrl, metadata, pinataApiKey, pinataSecretKey);
      
      toast({
        title: "Success!",
        description: "Collaborative NFT metadata uploaded to IPFS",
      });

      return `ipfs://${metadataHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload to IPFS",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const mintCollabNFT = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const tokenURI = await uploadCollabMetadata();
      
      // Call the mintCollaborativeNFT function with both addresses and prompts
      writeContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintCollaborativeNFT',
        args: [hostAddress as `0x${string}`, guestAddress as `0x${string}`, hostPrompt, guestPrompt, tokenURI],
        value: parseEther('0.02'), // Double price for collaborative NFT
        chain: avalancheFuji,
        account: address,
      });
    } catch (error) {
      console.error('Error minting collaborative NFT:', error);
      if (error instanceof Error && !error.message.includes('API credentials')) {
        toast({
          title: "Error",
          description: "Failed to mint collaborative NFT",
          variant: "destructive",
        });
      }
    }
  };

  const isLoading = isPending || isConfirming || isUploading;
  const hasCredentials = pinataApiKey && pinataSecretKey;

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-green-400 font-semibold">Collaborative NFT Minted! 🎉</h4>
          <p className="text-green-300 text-sm mt-1">
            Your collaborative artwork has been minted with dual ownership
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          Create Another Collab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Mint Collaborative NFT</h3>
      </div>

      {!hasCredentials && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">
            ⚠️ Configure your Pinata API credentials in the main NFT section first
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Input
          placeholder="Collaborative NFT Name (optional)"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
        />
        <Input
          placeholder="Collaborative NFT Description (optional)"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
        />
      </div>

      <div className="bg-slate-700/30 p-3 rounded text-sm">
        <p className="text-gray-300 mb-2"><strong>Collaboration Details:</strong></p>
        <p className="text-gray-400">Host: {hostAddress.slice(0, 6)}...{hostAddress.slice(-4)}</p>
        <p className="text-gray-400">Guest: {guestAddress.slice(0, 6)}...{guestAddress.slice(-4)}</p>
        <p className="text-gray-400 mt-2">Both artists will be credited in the NFT metadata</p>
      </div>

      <Button
        onClick={mintCollabNFT}
        disabled={isLoading || !hasCredentials}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            {isUploading ? 'Uploading to IPFS...' : isPending ? 'Confirming...' : 'Minting...'}
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Mint Collaborative NFT (0.02 AVAX)
          </>
        )}
      </Button>

      {hash && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Transaction Hash: 
            <a 
              href={`https://testnet.snowtrace.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default CollabNFTMinter;
