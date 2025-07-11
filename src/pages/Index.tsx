
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-600 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 text-sm font-medium">SynthaMint Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Synthesize Ideas{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Mint the Moment
                    </span>
                    <div className="absolute -top-2 -right-8 w-12 h-8">
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transform rotate-12 opacity-80"></div>
                    </div>
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  Transform creative ideas into unique digital assets with AI-powered NFT generation on Avalanche
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/solo-create" className="flex items-center gap-2">
                    Create AI Art
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg font-medium rounded-xl"
                >
                  <Link to="/collab-create" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Collaborate
                  </Link>
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="text-white font-semibold text-sm">AI-Powered</div>
                  <div className="text-gray-400 text-xs">Multiple AI providers</div>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-white font-semibold text-sm">Fast & Cheap</div>
                  <div className="text-gray-400 text-xs">Avalanche network</div>
                </div>
                <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-white font-semibold text-sm">Decentralized</div>
                  <div className="text-gray-400 text-xs">IPFS storage</div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-20 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-8 h-8 border-2 border-cyan-400 rounded-lg rotate-45 animate-spin-slow"></div>
            </div>

            {/* Right Content - Character Card */}
            <div className="relative flex justify-center lg:justify-end">
              <Card className="relative bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-sm">
                {/* Character Image Placeholder */}
                <div className="relative mb-6">
                  <div className="w-full h-80 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-gray-600">
                    {/* 3D Character representation */}
                    <div className="relative">
                      {/* Head */}
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full relative mx-auto mb-4">
                        {/* VR Goggles */}
                        <div className="absolute inset-x-2 top-6 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg border-2 border-orange-300">
                          <div className="absolute left-2 top-2 w-6 h-8 bg-white/20 rounded"></div>
                          <div className="absolute right-2 top-2 w-6 h-8 bg-white/20 rounded"></div>
                        </div>
                        {/* Hair */}
                        <div className="absolute -top-2 left-4 right-4 h-8 bg-gradient-to-r from-amber-700 to-amber-800 rounded-t-full"></div>
                      </div>
                      
                      {/* Body */}
                      <div className="w-20 h-32 bg-gradient-to-br from-orange-400 to-blue-500 rounded-t-full mx-auto relative">
                        {/* Arms */}
                        <div className="absolute -left-6 top-4 w-12 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform -rotate-12"></div>
                        <div className="absolute -right-6 top-4 w-12 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform rotate-12"></div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Card at bottom */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">S</span>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">SynthaMint AI</div>
                        <div className="text-cyan-400 text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          0.01 AVAX
                        </div>
                      </div>
                      <Button size="sm" className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded-md">
                        Mint
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-center space-y-2 pt-8">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">0.01 AVAX</span>
                  </div>
                  <div className="text-gray-400 text-sm">Affordable NFT minting on Avalanche</div>
                  <div className="text-gray-400 text-sm">
                    Create by{" "}
                    <span className="text-cyan-400 font-medium">SynthaMint AI</span>
                  </div>
                </div>

                {/* Decorative dots */}
                <div className="absolute top-8 right-8 w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="absolute bottom-32 right-12 w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1/3 left-8 w-2 h-2 bg-purple-400 rounded-full"></div>
              </Card>

              {/* Floating cursor */}
              <div className="absolute top-20 right-20 flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M3 3L10.5 12L7 19L9 21L15.5 12L21 21L3 3Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
