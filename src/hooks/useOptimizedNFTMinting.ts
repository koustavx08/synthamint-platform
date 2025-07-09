import { useState, useCallback, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from '@/hooks/use-toast';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '@/config/contract';

interface MintingState {
  isLoading: boolean;
  isMinting: boolean;
  isUploading: boolean;
  error: string | null;
  txHash: string | null;
  tokenId: string | null;
}

interface MintingOptions {
  imageUrl: string;
  prompt: string;
  name?: string;
  description?: string;
  collaborators?: string[];
}

export function useOptimizedNFTMinting() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [state, setState] = useState<MintingState>({
    isLoading: false,
    isMinting: false,
    isUploading: false,
    error: null,
    txHash: null,
    tokenId: null,
  });

  // Memoized contract config
  const contractConfig = useMemo(() => ({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
  }), []);

  const uploadToIPFS = useCallback(async (metadata: any): Promise<string> => {
    setState(prev => ({ ...prev, isUploading: true, error: null }));
    
    try {
      // Simulate IPFS upload (replace with actual implementation)
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload metadata');
      }
      
      const { ipfsHash } = await response.json();
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      // Fallback to a mock IPFS URL for demo
      return `ipfs://QmDemo${Date.now()}`;
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }, []);

  const mintNFT = useCallback(async (options: MintingOptions) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, isMinting: true, error: null }));

    try {
      // Prepare metadata
      const metadata = {
        name: options.name || `AI Generated Art #${Date.now()}`,
        description: options.description || `Created with prompt: "${options.prompt}"`,
        image: options.imageUrl,
        attributes: [
          { trait_type: "Generated", value: "AI" },
          { trait_type: "Prompt", value: options.prompt },
          ...(options.collaborators ? [{ trait_type: "Collaborators", value: options.collaborators.length }] : []),
        ],
        prompt: options.prompt,
        collaborators: options.collaborators || [],
        created_at: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata);

      // Mint the NFT
      writeContract({
        ...contractConfig,
        functionName: 'mintNFT',
        args: [address, options.prompt, metadataURI],
        value: parseEther('0.01'), // Mint fee
      });

      setState(prev => ({ ...prev, txHash: hash || null }));
      
      toast({
        title: "Minting Started",
        description: "Your NFT is being minted. Please wait for confirmation.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false, isMinting: false }));
    }
  }, [isConnected, address, contractConfig, writeContract, hash, uploadToIPFS]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    ...state,
    mintNFT,
    isConfirming,
    isSuccess,
    isPending,
    isConnected,
  }), [state, mintNFT, isConfirming, isSuccess, isPending, isConnected]);

  return returnValue;
}
