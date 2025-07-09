import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiImageService } from '@/services/aiImageService';
import { aiStoryService } from '@/services/aiStoryService';
import { createComicLayout } from '@/services/comicLayoutService';
import { uploadToIPFS } from '@/utils/ipfsUtils';
import { usePinataConfig } from '@/hooks/usePinataConfig';
import { useNFTMinting } from '@/hooks/useNFTMinting';
import NFTMetadataForm from './NFTMetadataForm';

const MIN_PROMPTS = 3;
const MAX_PROMPTS = 6;

const StoryMint = () => {
  const [prompts, setPrompts] = useState<string[]>(['', '', '']);
  const [images, setImages] = useState<string[]>([]);
  const [story, setStory] = useState('');
  const [comicUrl, setComicUrl] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [step, setStep] = useState<'input'|'generating'|'preview'|'minting'|'success'>('input');
  const [error, setError] = useState<string|null>(null);

  const { pinataApiKey, pinataSecretKey, hasCredentials } = usePinataConfig();
  const { mintNFT, isLoading, isUploading, isPending, isSuccess, hash } = useNFTMinting({
    imageUrl: comicUrl,
    prompt: prompts.join(' | '),
    pinataApiKey,
    pinataSecretKey,
    nftName,
    nftDescription,
    onConfigRequired: () => {}, // Add a handler or modal trigger here if needed
    extraMetadata: { story, type: 'ComicNFT' },
  });

  const handlePromptChange = (idx: number, value: string) => {
    setPrompts((prev) => prev.map((p, i) => (i === idx ? value : p)));
  };

  const addPrompt = () => {
    if (prompts.length < MAX_PROMPTS) setPrompts([...prompts, '']);
  };
  const removePrompt = (idx: number) => {
    if (prompts.length > MIN_PROMPTS) setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    setError(null);
    setStep('generating');
    try {
      // 1. Generate images for each prompt
      const imageResults = await Promise.all(
        prompts.map((prompt) => aiImageService.generateImage({ prompt }))
      );
      const urls = imageResults.map((r) => r.url);
      setImages(urls);
      // 2. Generate story
      const storyResult = await aiStoryService.generateStory({ prompts });
      setStory(storyResult.story);
      // 3. Compose comic
      const layout = await createComicLayout({ imageUrls: urls, layout: 'horizontal', width: 512, height: 512 });
      setComicUrl(layout.comicUrl);
      setStep('preview');
    } catch (e: any) {
      setError(e.message || 'Failed to generate comic');
      setStep('input');
    }
  };

  if (step === 'success' || isSuccess) {
    return <div className="p-6 text-center"><h2 className="text-2xl font-bold mb-4">Comic NFT Minted!</h2></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">StoryMint: Create a Comic NFT</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {step === 'input' && (
        <>
          <div className="space-y-3 mb-4">
            {prompts.map((prompt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={prompt}
                  onChange={e => handlePromptChange(idx, e.target.value)}
                  placeholder={`Prompt ${idx + 1}`}
                  className="flex-1"
                />
                {prompts.length > MIN_PROMPTS && (
                  <Button variant="ghost" onClick={() => removePrompt(idx)}>-</Button>
                )}
              </div>
            ))}
            {prompts.length < MAX_PROMPTS && (
              <Button variant="outline" onClick={addPrompt}>+ Add Prompt</Button>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={prompts.some(p => !p.trim())} className="w-full">Generate Comic</Button>
        </>
      )}
      {step === 'generating' && (
        <div className="text-center py-10">Generating images and story...</div>
      )}
      {step === 'preview' && comicUrl && (
        <>
          <div className="mb-4">
            <img src={comicUrl} alt="Comic Preview" className="w-full rounded border" />
          </div>
          <div className="mb-4 p-3 bg-gray-50 rounded border text-sm whitespace-pre-line">{story}</div>
          <NFTMetadataForm
            nftName={nftName}
            nftDescription={nftDescription}
            onNameChange={setNftName}
            onDescriptionChange={setNftDescription}
          />
          <Button onClick={() => { setStep('minting'); mintNFT(); }} disabled={isLoading || !hasCredentials} className="w-full mt-4">
            {isLoading ? 'Minting...' : 'Mint Comic NFT'}
          </Button>
        </>
      )}
      {step === 'minting' && (
        <div className="text-center py-10">Minting NFT...</div>
      )}
      {hash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">Transaction: {hash}</div>
      )}
    </div>
  );
};

export default StoryMint;
