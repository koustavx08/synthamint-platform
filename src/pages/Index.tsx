
import { Link } from 'react-router-dom';
import { Palette, Sparkles, Users, BookOpen, ImageIcon, ArrowRight, Zap, Globe, Brush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const features = [
    {
      icon: Brush,
      title: "Solo Create",
      description: "Unleash your individual creativity with AI-powered art generation",
      link: "/solo-create",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20"
    },
    {
      icon: Users,
      title: "Collab Create",
      description: "Team up with artists worldwide for collaborative masterpieces",
      link: "/collab-create",
      color: "from-green-500 to-teal-600",
      bgColor: "bg-green-500/10 hover:bg-green-500/20"
    },
    {
      icon: BookOpen,
      title: "Story Mint",
      description: "Transform narratives into visual stories and mint them as NFTs",
      link: "/storymint",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20"
    },
    {
      icon: ImageIcon,
      title: "Gallery",
      description: "Explore and discover amazing NFT creations from our community",
      link: "/gallery",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20"
    }
  ];

  return (
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
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Palette className="w-10 h-10 text-primary-foreground" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce" />
              </div>
              <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                SynthaMint
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your wildest ideas into extraordinary NFTs with cutting-edge AI creativity and collaborative innovation
            </p>
            
            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {[
                { icon: Zap, text: "AI-Powered", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400" },
                { icon: Sparkles, text: "Instant Minting", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400" },
                { icon: Users, text: "Collaborative", color: "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400" },
                { icon: Globe, text: "Decentralized", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400" }
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link to="/solo-create">
                  Start Creating <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                <Link to="/gallery">
                  Explore Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Choose Your Creative Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From solo artistry to collaborative innovation, SynthaMint offers multiple paths to create and mint your unique NFTs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${feature.bgColor}`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="mb-6 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.link}>
                      Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-primary">10K+</div>
              <div className="text-lg text-muted-foreground">NFTs Created</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-primary">5K+</div>
              <div className="text-lg text-muted-foreground">Active Artists</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-primary">1M+</div>
              <div className="text-lg text-muted-foreground">AI Generations</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
