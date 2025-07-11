import { useState, useEffect } from 'react';
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

type AIModel = 'auto' | 'custom';

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
  const [aiModel, setAiModel] = useState<AIModel>('auto');
  const [customModelId, setCustomModelId] = useState('');
  const [useComicStyle, setUseComicStyle] = useState(true);
  const [characterDialogue, setCharacterDialogue] = useState(false);
  const [maxLength, setMaxLength] = useState(800);
  const [temperature, setTemperature] = useState(0.8);
  const [availableModels, setAvailableModels] = useState<{story: string[], comic: string[]}>({story: [], comic: []});

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
      modelId: storyMetadata?.modelId,
      generatedAt: storyMetadata?.generatedAt,
      style: storyMetadata?.style,
      useComicStyle,
      characterDialogue,
      maxLength,
      temperature,
      processingTime: storyMetadata?.processingTime
    },
  });

  // Load available models on component mount
  useEffect(() => {
    const models = aiStoryService.getAvailableModels();
    setAvailableModels(models);
  }, []);

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
        customModelId: aiModel === 'custom' ? customModelId : undefined,
        useComicStyle,
        characterDialogue,
        maxLength,
        temperature
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
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-6 text-center bg-gray-800/50 rounded-lg border border-gray-600">
          <h2 className="text-2xl font-bold mb-4 text-white">Comic NFT Minted!</h2>
          {hash && (
            <div className="text-green-400 break-all font-mono text-sm">
              Transaction: {hash}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #374151;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #374151;
        }
      `}</style>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-600 rounded-full px-6 py-3 mb-6 backdrop-blur-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">Powered by Hugging Face AI Models</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Story Mint Studio
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform your creative ideas into visual comic stories and mint them as unique NFTs. 
              Powered by Hugging Face's advanced language models with support for custom fine-tuned models.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">🤗</div>
                <div className="text-white font-semibold text-sm">Hugging Face Models</div>
                <div className="text-gray-400 text-xs">GPT-Neo, DialoGPT, BlenderBot</div>
              </div>
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">🎛️</div>
                <div className="text-white font-semibold text-sm">Custom Models</div>
                <div className="text-gray-400 text-xs">Your fine-tuned models</div>
              </div>
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-white font-semibold text-sm">Comic Style</div>
                <div className="text-gray-400 text-xs">Panel-based Layout</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {step === 'input' && (
            <Card className="bg-gray-800/80 border border-gray-600 shadow-2xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      📖
                    </div>
                    Create Your Comic Story
                  </CardTitle>
                  <p className="text-orange-100 mt-2 text-sm">
                    Generate panel-based stories with AI and mint them as NFTs
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Story prompts */}
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-white">
                    Story Prompts ({prompts.length}/{MAX_PROMPTS})
                  </label>
                  {prompts.map((prompt, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Input
                        placeholder={`Panel ${idx + 1}: Describe this scene...`}
                        value={prompt}
                        onChange={(e) => handlePromptChange(idx, e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      {prompts.length > MIN_PROMPTS && (
                        <Button
                          onClick={() => removePrompt(idx)}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {prompts.length < MAX_PROMPTS && (
                    <Button
                      onClick={addPrompt}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      Add Panel
                    </Button>
                  )}
                </div>

                {/* AI Model Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-white">Hugging Face Model Selection</label>
                  <Select value={aiModel} onValueChange={(value: string) => setAiModel(value as AIModel)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="auto">🔀 Auto (Best Available Model)</SelectItem>
                      <SelectItem value="custom">🎛️ Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {aiModel === 'custom' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Custom Model ID</label>
                      <Input
                        placeholder="e.g., your-username/your-fine-tuned-model"
                        value={customModelId}
                        onChange={(e) => setCustomModelId(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      <div className="text-xs text-gray-400">
                        Enter the full Hugging Face model ID for your custom fine-tuned model
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-blue-400 font-semibold mb-1">🤗 Available Models</div>
                      <div className="text-blue-300">
                        Story: {availableModels.story.slice(0, 3).join(', ')}...
                      </div>
                      <div className="text-blue-300">
                        Comic: {availableModels.comic.slice(0, 3).join(', ')}...
                      </div>
                    </div>
                  </div>
                  
                  {aiStoryService.isConfigured() ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-green-400 font-semibold mb-1">✅ API Key Configured</div>
                      <div className="text-green-300 text-xs">Higher rate limits and model access enabled</div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <div className="text-yellow-400 font-semibold mb-1">⚠️ No API Key</div>
                      <div className="text-yellow-300 text-xs">Using free tier with rate limits. Add VITE_HUGGINGFACE_API_KEY for better performance.</div>
                    </div>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-white">Generation Settings</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Max Length: {maxLength} tokens
                      </label>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="50"
                        value={maxLength}
                        onChange={(e) => setMaxLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Temperature: {temperature}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-xs text-gray-400">Lower = more focused, Higher = more creative</div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comic-style"
                      checked={useComicStyle}
                      onCheckedChange={(checked) => setUseComicStyle(checked === true)}
                      className="w-5 h-5"
                    />
                    <label htmlFor="comic-style" className="text-white font-medium cursor-pointer">
                      🎨 Comic Style
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dialogue" 
                      checked={characterDialogue} 
                      onCheckedChange={(checked) => setCharacterDialogue(checked === true)}
                      className="w-5 h-5"
                    />
                    <label htmlFor="dialogue" className="text-white font-medium cursor-pointer">
                      💬 Character Dialogue
                    </label>
                  </div>
                </div>
                
                {aiModel === 'auto' && (
                  <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🤗</span>
                      <div>
                        <div className="font-semibold mb-1">Smart Model Selection</div>
                        <div className="text-sm">Auto mode will select the best Hugging Face model based on your style preferences (comic vs narrative).</div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={prompts.some(p => !p.trim()) || (aiModel === 'custom' && !customModelId.trim())} 
                  size="lg"
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    🤗 Generate Hugging Face Comic Story
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {aiModel === 'custom' ? 'Custom Model' : 'Auto-Select'}
                    </Badge>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'generating' && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">Generating images and story...</div>
              <div className="text-lg text-gray-300">
                Using {aiModel === 'custom' ? `custom model: ${customModelId}` : 'best available Hugging Face model'} to create your comic ✨
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Settings: {maxLength} tokens, temperature {temperature}
              </div>
            </div>
          )}

          {step === 'preview' && comicUrl && (
            <div className="space-y-8">
              <Card className="bg-gray-800/50 border border-gray-600 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      🖼️
                    </div>
                    Generated Comic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <img 
                      src={comicUrl} 
                      alt="Comic Preview" 
                      className="relative w-full rounded-2xl border-2 border-gray-600 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border border-gray-600 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        📖
                      </div>
                      Generated Story
                    </div>
                    {storyMetadata && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm px-3 py-1 border-gray-600 text-gray-300">
                          {storyMetadata.modelId || storyMetadata.model}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-2 py-1 border-gray-600 text-gray-300">
                          {storyMetadata.style}
                        </Badge>
                        {storyMetadata.processingTime && (
                          <Badge variant="outline" className="text-xs px-2 py-1 border-gray-600 text-gray-400">
                            {Math.round(storyMetadata.processingTime)}ms
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gray-700/30 rounded-2xl border border-gray-600 text-base whitespace-pre-line leading-relaxed backdrop-blur-sm text-gray-200">
                    {story}
                  </div>
                  {storyMetadata?.generatedAt && (
                    <div className="text-sm text-gray-400 mt-3 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Generated: {new Date(storyMetadata.generatedAt).toLocaleString()}
                      </div>
                      {storyMetadata.tokenCount && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Tokens: {storyMetadata.tokenCount}
                        </div>
                      )}
                      {storyMetadata.temperature && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Temp: {storyMetadata.temperature}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-2 border border-gray-600">
                <NFTMetadataForm
                  nftName={nftName}
                  nftDescription={nftDescription}
                  onNameChange={setNftName}
                  onDescriptionChange={setNftDescription}
                />
              </div>
              
              <Button 
                onClick={() => { setStep('minting'); mintNFT(); }} 
                disabled={isLoading || !hasCredentials} 
                size="lg"
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {isLoading ? '⏳ Minting...' : '🚀 Mint Comic NFT'}
              </Button>
            </div>
          )}

          {step === 'minting' && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">Minting your NFT...</div>
              <div className="text-lg text-gray-300">
                This may take a few moments 🎯
              </div>
            </div>
          )}

          {hash && (
            <div className="mt-6 p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">✓</span>
                </div>
                <div className="font-bold text-emerald-300 text-lg">Transaction Successful!</div>
              </div>
              <div className="text-emerald-400 break-all font-mono text-sm bg-emerald-500/5 p-3 rounded-lg">
                Transaction Hash: {hash}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryMint;
