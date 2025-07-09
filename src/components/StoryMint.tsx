import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [storyMetadata, setStoryMetadata] = useState<any>(null);
  const [comicUrl, setComicUrl] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [step, setStep] = useState<'input'|'generating'|'preview'|'minting'|'success'>('input');
  const [error, setError] = useState<string|null>(null);
  const [aiModel, setAiModel] = useState<'auto' | 'openai' | 'gemini' | 'openrouter' | 'koboldai' | 'huggingface-spaces'>('auto');
  const [useComicStyle, setUseComicStyle] = useState(true);
  const [characterDialogue, setCharacterDialogue] = useState(false);

  const { pinataApiKey, pinataSecretKey, hasCredentials } = usePinataConfig();
  const { mintNFT, isLoading, isUploading, isPending, isSuccess, hash } = useNFTMinting({
    imageUrl: comicUrl,
    prompt: prompts.join(' | '),
    pinataApiKey,
    pinataSecretKey,
    nftName,
    nftDescription,
    onConfigRequired: () => {}, // Add a handler or modal trigger here if needed
    extraMetadata: { 
      story, 
      type: 'ComicNFT',
      aiModel: storyMetadata?.model,
      generatedAt: storyMetadata?.generatedAt,
      style: storyMetadata?.style,
      useComicStyle,
      characterDialogue
    },
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
      
      // 2. Generate story with enhanced options
      const storyResult = await aiStoryService.generateStory({ 
        prompts,
        model: aiModel,
        useComicStyle,
        characterDialogue
      });
      setStory(storyResult.story);
      setStoryMetadata(storyResult.metadata);
      
      // 3. Compose comic
      const layout = await createComicLayout({ 
        imageUrls: urls, 
        layout: 'horizontal', 
        width: 512, 
        height: 512 
      });
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 StoryMint: Enhanced AI Comic NFT Creator
            {storyMetadata && (
              <Badge variant="secondary">
                {storyMetadata.model} {storyMetadata.style}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          {step === 'input' && (
            <div className="space-y-6">
              {/* AI Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🧠 AI Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI Model</label>
                      <Select value={aiModel} onValueChange={(value) => setAiModel(value as typeof aiModel)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🎯 Auto (Best Available)</SelectItem>
                          <SelectItem value="openrouter">🔥 OpenRouter (Free GPT-style)</SelectItem>
                          <SelectItem value="huggingface-spaces">🤗 HuggingFace (Free)</SelectItem>
                          <SelectItem value="koboldai">⚔️ KoboldAI (Community)</SelectItem>
                          <SelectItem value="openai">💎 OpenAI (Premium)</SelectItem>
                          <SelectItem value="gemini">🌟 Google Gemini (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="comic-style" 
                          checked={useComicStyle} 
                          onCheckedChange={(checked) => setUseComicStyle(checked === true)}
                        />
                        <label htmlFor="comic-style" className="text-sm font-medium">
                          📖 Comic Book Style
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="dialogue" 
                          checked={characterDialogue} 
                          onCheckedChange={(checked) => setCharacterDialogue(checked === true)}
                        />
                        <label htmlFor="dialogue" className="text-sm font-medium">
                          💬 Character Dialogue
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {aiModel === 'auto' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                      ✨ Auto mode will try free services first (OpenRouter, HuggingFace, KoboldAI) before using premium APIs.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Story Prompts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">📝 Story Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prompts.map((prompt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </div>
                        <Input
                          value={prompt}
                          onChange={e => handlePromptChange(idx, e.target.value)}
                          placeholder={`Panel ${idx + 1} - Describe the scene or action`}
                          className="flex-1"
                        />
                        {prompts.length > MIN_PROMPTS && (
                          <Button variant="ghost" onClick={() => removePrompt(idx)} className="text-red-500">
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {prompts.length < MAX_PROMPTS && (
                      <Button variant="outline" onClick={addPrompt} className="w-full">
                        ➕ Add Panel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerate} 
                disabled={prompts.some(p => !p.trim())} 
                className="w-full h-12 text-lg"
              >
                🎨 Generate Enhanced Comic Story
              </Button>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg font-medium">Generating images and story...</div>
              <div className="text-sm text-gray-600 mt-2">
                Using {aiModel === 'auto' ? 'best available AI' : aiModel} to create your comic
              </div>
            </div>
          )}

          {step === 'preview' && comicUrl && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🖼️ Generated Comic</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={comicUrl} alt="Comic Preview" className="w-full rounded-lg border shadow-md" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📖 Generated Story
                    {storyMetadata && (
                      <Badge variant="outline" className="ml-auto">
                        {storyMetadata.model} • {storyMetadata.style}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-line leading-relaxed">
                    {story}
                  </div>
                  {storyMetadata?.generatedAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Generated at: {new Date(storyMetadata.generatedAt).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <NFTMetadataForm
                nftName={nftName}
                nftDescription={nftDescription}
                onNameChange={setNftName}
                onDescriptionChange={setNftDescription}
              />
              
              <Button 
                onClick={() => { setStep('minting'); mintNFT(); }} 
                disabled={isLoading || !hasCredentials} 
                className="w-full h-12 text-lg"
              >
                {isLoading ? '⏳ Minting...' : '🚀 Mint Comic NFT'}
              </Button>
            </div>
          )}

          {step === 'minting' && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <div className="text-lg font-medium">Minting your NFT...</div>
              <div className="text-sm text-gray-600 mt-2">
                This may take a few moments
              </div>
            </div>
          )}

          {hash && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">✅ Transaction Successful!</div>
              <div className="text-sm text-green-600 mt-1 break-all">
                Transaction Hash: {hash}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryMint;
