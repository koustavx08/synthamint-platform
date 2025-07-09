import { useEffect, useState } from 'react';
import { useStoryMint } from '@/hooks/useStoryMint';

const ComicGallery = () => {
  const { comics, isLoading, error } = useStoryMint();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">StoryMint Comic Gallery</h2>
      {isLoading && <div>Loading comics...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.map((comic, idx) => (
          <div key={comic.tokenId || idx} className="bg-white rounded-lg shadow p-4 flex flex-col">
            <img src={comic.image} alt="Comic NFT" className="rounded mb-3 border" />
            <div className="font-semibold mb-2">{comic.name}</div>
            <div className="text-xs text-gray-500 mb-2">Token ID: {comic.tokenId}</div>
            <div className="text-sm bg-gray-50 rounded p-2 mb-2 whitespace-pre-line max-h-32 overflow-auto">{comic.story}</div>
            <div className="text-xs text-gray-400">{comic.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicGallery;
