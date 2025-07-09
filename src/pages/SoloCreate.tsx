import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import WalletConnection from '../components/WalletConnection';
import ImageGenerator from '../components/ImageGenerator';
import { useState } from 'react';
import { Palette, Sparkles, Brush, Zap } from 'lucide-react';

const queryClient = new QueryClient();

const SoloCreate = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-16">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            
            <div className="relative container mx-auto px-6">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Brush className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce" />
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    Solo Create
                  </h1>
                </div>
                
                <p className="text-lg lg:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                  Unleash your creativity with AI-powered art generation. Create stunning, unique NFTs with just a few words.
                </p>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {[
                    { icon: Zap, text: "AI-Powered", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400" },
                    { icon: Sparkles, text: "Instant Creation", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400" },
                    { icon: Palette, text: "High Quality", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400" }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${feature.color} transition-all hover:scale-105`}
                    >
                      <feature.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <main className="container mx-auto px-6 pb-20">
            <div className="max-w-6xl mx-auto">
              {/* Wallet Connection */}
              <div className="mb-12">
                <WalletConnection />
              </div>
              
              {/* Image Generator */}
              <div className="mt-8">
                <ImageGenerator 
                  generatedImage={generatedImage}
                  setGeneratedImage={setGeneratedImage}
                  imagePrompt={imagePrompt}
                  setImagePrompt={setImagePrompt}
                />
              </div>
            </div>
          </main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default SoloCreate;
