
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import WalletConnection from './WalletConnection';
import ImageGenerator from './ImageGenerator';
import CollabMode from './CollabMode';
import SetupInstructions from './SetupInstructions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Palette } from 'lucide-react';

const queryClient = new QueryClient();

const NFTMintingApp = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'solo' | 'collab'>('solo');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎨 SynthaMint
            </h1>
            <p className="text-gray-300 text-lg">
              Synthesize ideas. Mint the moment.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SetupInstructions />
            <WalletConnection />
            
            {/* Mode Selector */}
            <div className="mt-8 mb-6">
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setActiveMode('solo')}
                  variant={activeMode === 'solo' ? 'default' : 'outline'}
                  className={activeMode === 'solo' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'border-slate-600 text-gray-300 hover:text-white'
                  }
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Solo Mode
                </Button>
                <Button
                  onClick={() => setActiveMode('collab')}
                  variant={activeMode === 'collab' ? 'default' : 'outline'}
                  className={activeMode === 'collab' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'border-slate-600 text-gray-300 hover:text-white'
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  Collab Mode
                </Button>
              </div>
            </div>

            <div className="mt-8">
              {activeMode === 'solo' ? (
                <ImageGenerator 
                  generatedImage={generatedImage}
                  setGeneratedImage={setGeneratedImage}
                  imagePrompt={imagePrompt}
                  setImagePrompt={setImagePrompt}
                />
              ) : (
                <CollabMode />
              )}
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default NFTMintingApp;
