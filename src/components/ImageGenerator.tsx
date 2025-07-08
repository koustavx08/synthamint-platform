
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAccount } from 'wagmi';
import { Loader, Plus, Sparkles } from 'lucide-react';
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
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Generate AI Art</h3>
          {availableServices.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Sparkles className="w-4 h-4" />
              <span>{availableServices.join(', ')} Ready</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {availableServices.length === 0 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ No AI services configured. Add your API keys to .env.local:
              </p>
              <ul className="text-yellow-200 text-xs mt-1 ml-4">
                <li>• VITE_OPENAI_API_KEY for DALL-E</li>
                <li>• VITE_STABILITY_AI_API_KEY for Stable Diffusion</li>
              </ul>
            </div>
          )}
          
          <div>
            <Input
              placeholder="Enter your creative prompt (e.g., 'A futuristic cityscape at sunset')"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
              disabled={isGenerating}
            />
          </div>
          
          <Button
            onClick={generateImage}
            disabled={isGenerating || !imagePrompt.trim() || availableServices.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Image
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedImage && (
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Generated Image</h3>
          
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={generatedImage}
                alt="Generated AI art"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {isConnected && (
              <NFTMinter 
                imageUrl={generatedImage}
                prompt={imagePrompt}
              />
            )}
            
            {!isConnected && (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-2">Connect your wallet to mint this image as an NFT</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;
