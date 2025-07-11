import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import WalletConnection from '../components/WalletConnection';
import CollabMode from '../components/CollabMode';
import { Users, Sparkles, Globe, Zap } from 'lucide-react';

const queryClient = new QueryClient();

const CollabCreate = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-900 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500" />
          </div>
          
          {/* Hero Section */}
          <section className="relative z-10 pt-24 pb-16">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-cyan-400 animate-bounce" />
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Collab Create
                  </h1>
                </div>
                
                <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                  Team up with artists worldwide to create collaborative masterpieces. Share ideas, build together, and mint as one.
                </p>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {[
                    { icon: Users, text: "Real-time Collaboration", color: "bg-green-500/20 text-green-400 border-green-500/30" },
                    { icon: Globe, text: "Global Community", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                    { icon: Zap, text: "Instant Sync", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
                    { icon: Sparkles, text: "Shared Creation", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
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
          <main className="relative z-10 container mx-auto px-6 pb-20">
            <div className="max-w-6xl mx-auto">
              {/* Wallet Connection */}
              <div className="mb-12">
                <WalletConnection />
              </div>
              
              {/* Collaboration Mode */}
              <div className="mt-8">
                <CollabMode />
              </div>
            </div>
          </main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default CollabCreate;
