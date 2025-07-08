
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
      <Card className="overflow-hidden border-0 shadow-xl bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">AI Art Generator</h3>
              <p className="text-blue-100 mt-1">Create unique artwork with artificial intelligence</p>
            </div>
            {availableServices.length > 0 && (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-100 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{availableServices.join(', ')} Ready</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {availableServices.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-semibold">!</span>
                </div>
                <div>
                  <h4 className="text-amber-800 font-semibold text-sm mb-1">Configuration Required</h4>
                  <p className="text-amber-700 text-sm mb-2">
                    Add your AI service API keys to enable image generation:
                  </p>
                  <ul className="text-amber-600 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                      <code className="bg-amber-100 px-1 rounded">VITE_OPENAI_API_KEY</code> for DALL-E
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                      <code className="bg-amber-100 px-1 rounded">VITE_STABILITY_AI_API_KEY</code> for Stable Diffusion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Describe your artwork
            </label>
            <Input
              placeholder="A majestic dragon soaring through a starlit sky with ethereal clouds..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <p className="text-sm text-gray-500">
              Be descriptive and creative - the more detail, the better your AI artwork will be!
            </p>
          </div>
          
          <Button
            onClick={generateImage}
            disabled={isGenerating || !imagePrompt.trim() || availableServices.length === 0}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                Creating your masterpiece...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate AI Artwork
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Image Display */}
      {generatedImage && (
        <Card className="overflow-hidden border-0 shadow-xl bg-white">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <h3 className="text-2xl font-bold text-white">Your AI Masterpiece</h3>
            <p className="text-emerald-100 mt-1">Ready to mint as a unique NFT</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="relative group max-w-lg">
                <img
                  src={generatedImage}
                  alt="Generated AI artwork"
                  className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            {isConnected ? (
              <div className="bg-gray-50 rounded-xl p-1">
                <NFTMinter 
                  imageUrl={generatedImage}
                  prompt={imagePrompt}
                />
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Connect Your Wallet</h4>
                  <p className="text-gray-600">
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
