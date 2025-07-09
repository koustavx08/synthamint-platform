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
        // Get total supply
        const totalSupply: bigint = await client.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'totalSupply',
        });
        // Get all tokenIds using tokenByIndex
        const tokenIds = await Promise.all(
          Array.from({ length: Number(totalSupply) }, async (_, i) => {
            const tokenId: bigint = await client.readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: NFT_CONTRACT_ABI,
              functionName: 'tokenByIndex',
              args: [BigInt(i)],
            });
            return tokenId;
          })
        );
        // Fetch tokenURIs and metadata
        const comicsData = await Promise.all(
          tokenIds.map(async (tokenId) => {
            try {
              const tokenURI: string = await client.readContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: NFT_CONTRACT_ABI,
                functionName: 'tokenURI',
                args: [tokenId],
              });
              const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              const res = await fetch(url);
              const meta = await res.json();
              if (
                meta.type === 'ComicNFT' ||
                (meta.attributes && meta.attributes.some((a: any) => a.trait_type === 'Type' && a.value === 'ComicNFT'))
              ) {
                return {
                  tokenId: tokenId.toString(),
                  name: meta.name,
                  description: meta.description,
                  image: meta.image?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                  story: meta.story,
                  ...meta,
                };
              }
              return null;
            } catch {
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
