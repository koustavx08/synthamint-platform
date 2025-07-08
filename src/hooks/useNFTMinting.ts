import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '@/config/contract';
import { avalancheFuji } from 'viem/chains';
import { uploadToIPFS } from '@/utils/ipfsUtils';

interface UseNFTMintingProps {
  imageUrl: string;
  prompt: string;
  pinataApiKey: string;
  pinataSecretKey: string;
  nftName: string;
  nftDescription: string;
  onConfigRequired: () => void;
}

export const useNFTMinting = ({
  imageUrl,
  prompt,
  pinataApiKey,
  pinataSecretKey,
  nftName,
  nftDescription,
  onConfigRequired,
}: UseNFTMintingProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const { address } = useAccount();
  const { toast } = useToast();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const uploadToIPFSReal = async () => {
    if (!pinataApiKey || !pinataSecretKey) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Pinata API credentials first.",
        variant: "destructive",
      });
      onConfigRequired();
      throw new Error('API credentials not configured');
    }

    setIsUploading(true);
    console.log('Uploading to IPFS via Pinata...');

    try {
      const metadata = {
        name: nftName || 'AI Generated NFT',
        description: nftDescription || `AI generated image from prompt: "${prompt}"`,
        attributes: [
          {
            trait_type: 'Generation Method',
            value: 'AI Generated'
          },
          {
            trait_type: 'Prompt',
            value: prompt
          }
        ]
      };

      const { metadataHash } = await uploadToIPFS(imageUrl, metadata, pinataApiKey, pinataSecretKey);
      
      toast({
        title: "Success!",
        description: "Image and metadata uploaded to IPFS",
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

  const mintNFT = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const tokenURI = await uploadToIPFSReal();
      
      writeContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintNFT',
        args: [address, prompt, tokenURI],
        value: parseEther('0.01'),
        chain: avalancheFuji,
        account: address,
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      if (error instanceof Error && !error.message.includes('API credentials')) {
        toast({
          title: "Error",
          description: "Failed to mint NFT",
          variant: "destructive",
        });
      }
    }
  };

  const isLoading = isPending || isConfirming || isUploading;

  return {
    mintNFT,
    isLoading,
    isUploading,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
};
