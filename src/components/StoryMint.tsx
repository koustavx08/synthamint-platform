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
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              StoryMint
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create immersive comic NFTs with AI-powered storytelling and stunning visuals
          </p>
        </div>

        <Card className="overflow-hidden border shadow-2xl bg-card/50 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-primary via-primary to-accent p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary-foreground mb-2">Enhanced AI Comic NFT Creator</h2>
                <p className="text-primary-foreground/80">Transform your ideas into professional comic narratives</p>
              </div>
              {storyMetadata && (
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-background/20 text-primary-foreground border-primary-foreground/20">
                  {storyMetadata.model} • {storyMetadata.style}
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center">
                    <span className="text-destructive font-bold">!</span>
                  </div>
                  {error}
                </div>
              </div>
            )}
            
            {step === 'input' && (
              <div className="space-y-8">
                {/* AI Configuration */}
                <Card className="border-2 border-border/50 bg-accent/20 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                        🧠
                      </div>
                      AI Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-lg font-semibold text-foreground">AI Model</label>
                        <Select value={aiModel} onValueChange={(value) => setAiModel(value as typeof aiModel)}>
                          <SelectTrigger className="h-12 text-base bg-background/50 border-2">
                            <SelectValue placeholder="Select AI model" />
                          </SelectTrigger>
                          <SelectContent className="bg-card/95 backdrop-blur-md border-2">
                            <SelectItem value="auto">🎯 Auto (Best Available)</SelectItem>
                            <SelectItem value="openrouter">🔥 OpenRouter (Free GPT-style)</SelectItem>
                            <SelectItem value="huggingface-spaces">🤗 HuggingFace (Free)</SelectItem>
                            <SelectItem value="koboldai">⚔️ KoboldAI (Community)</SelectItem>
                            <SelectItem value="openai">💎 OpenAI (Premium)</SelectItem>
                            <SelectItem value="gemini">🌟 Google Gemini (Premium)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/30 border">
                          <Checkbox 
                            id="comic-style" 
                            checked={useComicStyle} 
                            onCheckedChange={(checked) => setUseComicStyle(checked === true)}
                            className="w-5 h-5"
                          />
                          <label htmlFor="comic-style" className="text-base font-medium cursor-pointer">
                            📖 Comic Book Style
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-background/30 border">
                          <Checkbox 
                            id="dialogue" 
                            checked={characterDialogue} 
                            onCheckedChange={(checked) => setCharacterDialogue(checked === true)}
                            className="w-5 h-5"
                          />
                          <label htmlFor="dialogue" className="text-base font-medium cursor-pointer">
                            💬 Character Dialogue
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {aiModel === 'auto' && (
                      <div className="p-4 bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 rounded-xl text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✨</span>
                          <span>Auto mode will try free services first (OpenRouter, HuggingFace, KoboldAI) before using premium APIs.</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Story Prompts */}
                <Card className="border-2 border-border/50 bg-accent/20 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                        📝
                      </div>
                      Story Prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {prompts.map((prompt, idx) => (
                        <div key={idx} className="flex gap-4 items-center group">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                            {idx + 1}
                          </div>
                          <Input
                            value={prompt}
                            onChange={e => handlePromptChange(idx, e.target.value)}
                            placeholder={`Panel ${idx + 1} - Describe the scene or action`}
                            className="flex-1 h-12 text-base bg-background/50 border-2 focus:border-primary transition-all duration-200"
                          />
                          {prompts.length > MIN_PROMPTS && (
                            <Button 
                              variant="ghost" 
                              onClick={() => removePrompt(idx)} 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-10 h-10 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {prompts.length < MAX_PROMPTS && (
                        <Button 
                          variant="outline" 
                          onClick={addPrompt} 
                          className="w-full h-12 text-base border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                          ➕ Add Panel ({prompts.length}/{MAX_PROMPTS})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleGenerate} 
                  disabled={prompts.some(p => !p.trim())} 
                  size="lg"
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  🎨 Generate Enhanced Comic Story
                </Button>
              </div>
            )}

            {step === 'generating' && (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">Generating images and story...</div>
                <div className="text-lg text-muted-foreground">
                  Using {aiModel === 'auto' ? 'best available AI' : aiModel} to create your comic ✨
                </div>
              </div>
            )}

            {step === 'preview' && comicUrl && (
              <div className="space-y-8">
                <Card className="border-2 border-border/50 bg-accent/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                        🖼️
                      </div>
                      Generated Comic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                      <img 
                        src={comicUrl} 
                        alt="Comic Preview" 
                        className="relative w-full rounded-2xl border-2 border-border shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-border/50 bg-accent/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                          📖
                        </div>
                        Generated Story
                      </div>
                      {storyMetadata && (
                        <Badge variant="outline" className="text-base px-3 py-1">
                          {storyMetadata.model} • {storyMetadata.style}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-background/30 rounded-2xl border text-base whitespace-pre-line leading-relaxed backdrop-blur-sm">
                      {story}
                    </div>
                    {storyMetadata?.generatedAt && (
                      <div className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Generated at: {new Date(storyMetadata.generatedAt).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="bg-accent/30 backdrop-blur-sm rounded-2xl p-2 border">
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
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
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
                <div className="text-2xl font-bold text-foreground mb-2">Minting your NFT...</div>
                <div className="text-lg text-muted-foreground">
                  This may take a few moments 🎯
                </div>
              </div>
            )}

            {hash && (
              <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  </div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Transaction Successful!</div>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 break-all font-mono text-sm bg-emerald-500/5 p-3 rounded-lg">
                  Transaction Hash: {hash}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryMint;
