
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Palette, Sparkles, Zap, ArrowRight, BookOpen, ImageIcon } from 'lucide-react';

const queryClient = new QueryClient();

const NFTMintingApp = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            
            <div className="relative container mx-auto px-6">
              <div className="text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Palette className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce" />
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    SynthaMint
                  </h1>
                </div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                  Transform your wildest ideas into extraordinary NFTs with cutting-edge AI creativity
                </p>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                  {[
                    { icon: Zap, text: "AI-Powered", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400" },
                    { icon: Sparkles, text: "Instant Minting", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400" },
                    { icon: Users, text: "Collaborative", color: "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400" },
                    { icon: Palette, text: "IPFS Storage", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400" }
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
              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Solo Create",
                    description: "Create amazing AI art on your own",
                    icon: Palette,
                    link: "/solo-create",
                    color: "from-blue-500 to-purple-600"
                  },
                  {
                    title: "Collab Create", 
                    description: "Team up with other artists",
                    icon: Users,
                    link: "/collab-create",
                    color: "from-green-500 to-teal-600"
                  },
                  {
                    title: "Story Mint",
                    description: "Transform stories into visual NFTs",
                    icon: BookOpen,
                    link: "/storymint",
                    color: "from-orange-500 to-red-600"
                  },
                  {
                    title: "Gallery",
                    description: "Explore community creations",
                    icon: ImageIcon,
                    link: "/gallery", 
                    color: "from-purple-500 to-pink-600"
                  }
                ].map((item, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-6">{item.description}</p>
                      <Button asChild className="w-full">
                        <Link to={item.link}>
                          Get Started <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default NFTMintingApp;
