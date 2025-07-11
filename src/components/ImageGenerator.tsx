
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAccount } from 'wagmi';
import { Loader, Plus, Sparkles, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NFTMinter from './NFTMinter';
import { aiImageService } from '@/services/aiImageService';

interface ImageGeneratorProps {
  generatedImage: string | null;
  setGeneratedImage: (image: string | null) => void;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
}

const ImageGenerator = ({ generatedImage, setGeneratedImage, imagePrompt, setImagePrompt }: ImageGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('auto');
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const availableServices = aiImageService.getAvailableServices();

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for your AI image",
        variant: "destructive",
      });
      return;
    }

    // Validate prompt
    const validation = aiImageService.validatePrompt(imagePrompt);
    if (!validation.isValid) {
      toast({
        title: "Invalid Prompt",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Check if any AI services are available
    if (availableServices.length === 0) {
      toast({
        title: "Configuration Error",
        description: "No AI image generation services are configured. Please add API keys for OpenAI or Stability AI.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log('Generating image with prompt:', imagePrompt);

    try {
      const result = await aiImageService.generateImage({
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });
      
      setGeneratedImage(result.url);
      
      toast({
        title: "Success!",
        description: `AI image generated successfully${result.revisedPrompt ? ' (prompt was enhanced by AI)' : ''}`,
      });

      // Show revised prompt if available
      if (result.revisedPrompt) {
        console.log('AI revised prompt:', result.revisedPrompt);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Image Generation Card */}
      <Card className="overflow-hidden border border-gray-600 shadow-2xl bg-gray-800/50 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">AI Art Generator</h3>
              <p className="text-purple-100 text-lg">Create unique artwork with artificial intelligence</p>
            </div>
            {availableServices.length > 0 && (
              <div className="flex items-center gap-3 bg-green-500/20 text-green-100 px-4 py-2 rounded-full border border-green-400/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-medium">{availableServices.join(', ')} Ready</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          {availableServices.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-400 font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-amber-300 font-bold mb-2">Configuration Required</h4>
                  <p className="text-amber-200 mb-3">
                    Add your AI service API keys to enable image generation:
                  </p>
                  <ul className="text-amber-300 space-y-2">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <code className="bg-amber-400/20 px-2 py-1 rounded font-mono text-sm">VITE_OPENAI_API_KEY</code> 
                      <span>for DALL-E</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <code className="bg-amber-400/20 px-2 py-1 rounded font-mono text-sm">VITE_STABILITY_AI_API_KEY</code> 
                      <span>for Stable Diffusion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <label className="block text-lg font-bold text-white">
              Describe your artwork
            </label>
            <Input
              placeholder="A majestic dragon soaring through a starlit sky with ethereal clouds..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="h-14 text-base border-2 border-gray-600 bg-gray-700/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 text-white placeholder-gray-400"
              disabled={isGenerating}
            />
            <p className="text-gray-300">
              Be descriptive and creative - the more detail, the better your AI artwork will be! ✨
            </p>
          </div>
          
          <Button
            onClick={generateImage}
            disabled={isGenerating || !imagePrompt.trim() || availableServices.length === 0}
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            {isGenerating ? (
              <>
                <Loader className="w-6 h-6 mr-3 animate-spin" />
                Creating your masterpiece...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Generate AI Artwork
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Image Display */}
      {generatedImage && (
        <Card className="overflow-hidden border border-gray-600 shadow-2xl bg-gray-800/50 backdrop-blur-sm animate-float">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
            <h3 className="text-3xl font-bold text-white mb-2">Your AI Masterpiece</h3>
            <p className="text-emerald-100 text-lg">Ready to mint as a unique NFT</p>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex justify-center">
              <div className="relative group max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300 animate-glow"></div>
                <img
                  src={generatedImage}
                  alt="Generated AI artwork"
                  className="relative w-full rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] border-2 border-gray-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            {isConnected ? (
              <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-2 border border-gray-600">
                <NFTMinter 
                  imageUrl={generatedImage}
                  prompt={imagePrompt}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700/50 rounded-2xl border border-gray-600 backdrop-blur-sm">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Users className="w-10 h-10 text-purple-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h4>
                  <p className="text-gray-300 text-lg">
                    Connect your crypto wallet to mint this artwork as an NFT and add it to your collection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;
