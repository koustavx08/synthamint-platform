import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '@/config/contract';

export function useStoryMint() {
  const [comics, setComics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    async function fetchComics() {
      setIsLoading(true);
      setError(null);
      try {
        const client = createPublicClient({
          chain: avalancheFuji,
          transport: http(),
        });
        
        // Get total supply using the now-available function
        const totalSupply: bigint = await client.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'totalSupply',
        });

        if (Number(totalSupply) === 0) {
          setComics([]);
          return;
        }

        // Get all tokenIds using tokenByIndex
        const tokenIds = await Promise.all(
          Array.from({ length: Number(totalSupply) }, async (_, i) => {
            try {
              const tokenId: bigint = await client.readContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: NFT_CONTRACT_ABI,
                functionName: 'tokenByIndex',
                args: [BigInt(i)],
              });
              return tokenId;
            } catch (error) {
              console.warn(`Failed to get token at index ${i}:`, error);
              return null;
            }
          })
        );

        const validTokenIds = tokenIds.filter((id): id is bigint => id !== null);

        // Fetch tokenURIs and metadata
        const comicsData = await Promise.all(
          validTokenIds.map(async (tokenId) => {
            try {
              const tokenURI: string = await client.readContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: NFT_CONTRACT_ABI,
                functionName: 'tokenURI',
                args: [tokenId],
              });
              
              const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              const res = await fetch(url);
              
              if (!res.ok) {
                throw new Error(`Failed to fetch metadata for token ${tokenId}: ${res.statusText}`);
              }
              
              const meta = await res.json();
              
              // Check if this is a comic NFT
              if (
                meta.type === 'ComicNFT' ||
                (meta.attributes && meta.attributes.some((a: any) => a.trait_type === 'Type' && a.value === 'ComicNFT'))
              ) {
                return {
                  tokenId: tokenId.toString(),
                  name: meta.name || `Comic NFT #${tokenId.toString()}`,
                  description: meta.description || 'AI-generated comic NFT',
                  image: meta.image?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                  story: meta.story || 'No story available',
                  ...meta,
                };
              }
              return null;
            } catch (error) {
              console.warn(`Failed to fetch metadata for token ${tokenId}:`, error);
              return null;
            }
          })
        );

        setComics(comicsData.filter(Boolean));
      } catch (e: any) {
        setError(e.message || 'Failed to load comics');
      } finally {
        setIsLoading(false);
      }
    }
    fetchComics();
  }, []);

  return { comics, isLoading, error };
}
