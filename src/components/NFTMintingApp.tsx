
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import WalletConnection from './WalletConnection';
import ImageGenerator from './ImageGenerator';
import CollabMode from './CollabMode';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
          {/* Header Section */}
          <header className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5" />
            <div className="relative container mx-auto px-6 py-16">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SynthaMint
                  </h1>
                </div>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Transform your ideas into unique NFTs with AI-powered creativity
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                  <span className="px-3 py-1 bg-white/60 rounded-full border border-slate-200">AI-Powered</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full border border-slate-200">Instant Minting</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full border border-slate-200">Avalanche Network</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full border border-slate-200">IPFS Storage</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 pb-16">
            <div className="max-w-5xl mx-auto">
              {/* Wallet Connection Section */}
              <div className="mb-8">
                <WalletConnection />
              </div>
              
              {/* Mode Selector */}
              <div className="mb-12">
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setActiveMode('solo')}
                      variant={activeMode === 'solo' ? 'default' : 'ghost'}
                      className={activeMode === 'solo' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Solo Create
                    </Button>
                    <Button
                      onClick={() => setActiveMode('collab')}
                      variant={activeMode === 'collab' ? 'default' : 'ghost'}
                      className={activeMode === 'collab' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Collaborate
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
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
          </main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default NFTMintingApp;
