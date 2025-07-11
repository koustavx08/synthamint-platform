
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAccount } from 'wagmi';
import { Copy, Users, Loader, Check, X, Palette, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { collabSocket, CollabSession } from '../services/collabSocket';
import { aiImageService } from '@/services/aiImageService';
import CollabNFTMinter from './CollabNFTMinter';

const CollabMode = () => {
  const [mode, setMode] = useState<'menu' | 'host' | 'guest'>('menu');
  const [session, setSession] = useState<CollabSession | null>(null);
  const [sessionLink, setSessionLink] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [myPrompt, setMyPrompt] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Enhanced collaboration options
  const [blendingStrategy, setBlendingStrategy] = useState<'merge' | 'fusion' | 'style-transfer' | 'weighted'>('fusion');
  const [promptWeight, setPromptWeight] = useState([50]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const { address } = useAccount();
  const { toast } = useToast();
  const { actualTheme } = useTheme();

  useEffect(() => {
    if (address) {
      initializeSocket();
    }
    
    // Check for collaboration session ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const collabId = urlParams.get('collab');
    if (collabId && collabId.trim() !== '') {
      setJoinSessionId(collabId);
      // Auto-join after socket initializes
      setTimeout(() => {
        if (address && collabId) {
          joinSession(collabId);
        }
      }, 1000);
    }
    
    return () => {
      collabSocket.disconnect();
    };
  }, [address]);

  useEffect(() => {
    collabSocket.onSessionUpdate((updatedSession) => {
      setSession(updatedSession);
      
      if (updatedSession.status === 'generating') {
        generateCollabImage(updatedSession);
      }
      
      // Sync blending options from other user
      if (updatedSession.blendingStrategy && updatedSession.blendingStrategy !== blendingStrategy) {
        setBlendingStrategy(updatedSession.blendingStrategy);
      }
      if (updatedSession.promptWeights && JSON.stringify(updatedSession.promptWeights) !== JSON.stringify(promptWeight)) {
        setPromptWeight([updatedSession.promptWeights[0] * 100]);
      }
    });
  }, []);

  const initializeSocket = async () => {
    // Check if socket URL is configured using the same logic as collabSocket service
    const socketUrlProd = import.meta.env.VITE_SOCKET_URL_PRODUCTION;
    const socketUrlDev = import.meta.env.VITE_SOCKET_URL_DEVELOPMENT;
    const nodeEnv = import.meta.env.NODE_ENV || import.meta.env.MODE;
    const socketUrl = nodeEnv === 'production' ? socketUrlProd : socketUrlDev || import.meta.env.VITE_SOCKET_URL || '';
    
    if (!socketUrl || socketUrl.trim() === '' || socketUrl.includes('your-socket') || socketUrl.includes('your-production')) {
      // Socket not configured - collaboration is disabled
      setSocketError('Collaboration server not configured');
      return;
    }

    try {
      setIsConnecting(true);
      setSocketError(null);
      setIsDemoMode(false);
      
      console.log('Initializing socket connection...');
      await collabSocket.connect();
      
      toast({
        title: "Connected",
        description: "Ready for real-time collaboration!",
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      
      // Check if it's a configuration issue
      if (error?.message?.includes('not configured')) {
        setSocketError('Collaboration server not configured');
        setIsDemoMode(false);
      } else {
        // It's a connection issue - the service will fall back to mock mode
        setSocketError(`Connection failed: ${error?.message || 'Unknown error'}`);
        setIsDemoMode(true);
        toast({
          title: "Connection Failed",
          description: "Cannot connect to collaboration server. Please check if the server is running.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const createSession = async () => {
    if (!address) return;
    
    try {
      setIsConnecting(true);
      const sessionId = await collabSocket.createSession(address);
      const link = `${window.location.origin}?collab=${sessionId}`;
      setSessionLink(link);
      setMode('host');
      setSession({
        id: sessionId,
        host: address,
        status: 'waiting'
      });
      
      toast({
        title: "Session Created!",
        description: "Share the link with your collaborator",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const joinSession = async (sessionId?: string) => {
    const targetSessionId = sessionId || joinSessionId.trim();
    if (!address || !targetSessionId) return;
    
    try {
      setIsConnecting(true);
      const sessionData = await collabSocket.joinSession(targetSessionId, address);
      setSession(sessionData);
      setMode('guest');
      
      toast({
        title: "Joined Session!",
        description: "Connected with your collaborator",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const updatePrompt = (prompt: string) => {
    setMyPrompt(prompt);
    if (session) {
      collabSocket.updatePrompt(session.id, prompt, mode === 'host');
    }
  };

  const updateBlendingOptions = (strategy: string, weights?: number[]) => {
    setBlendingStrategy(strategy as any);
    if (weights) setPromptWeight(weights);
    if (session) {
      collabSocket.updateBlendingStrategy(session.id, strategy, weights);
    }
  };

  const generateCollabImage = async (sessionData: CollabSession) => {
    if (!sessionData.hostPrompt || !sessionData.guestPrompt) return;
    
    setIsGenerating(true);
    
    try {
      // Calculate weights based on slider (convert 0-100 to weights that sum to 1)
      const hostWeight = promptWeight[0] / 100;
      const guestWeight = 1 - hostWeight;
      
      // Use enhanced collaborative image generation
      const result = await aiImageService.generateCollaborativeImage(
        sessionData.hostPrompt,
        sessionData.guestPrompt,
        {
          blendingStrategy,
          weights: [hostWeight, guestWeight],
          style: "vivid",
          quality: "hd",
          size: "1024x1024"
        }
      );
      
      // Update session with generated image
      const updatedSession = {
        ...sessionData,
        generatedImage: result.url,
        status: 'approving' as const
      };
      setSession(updatedSession);
      
      toast({
        title: "Collaborative Masterpiece Created! ✨",
        description: `Prompts blended using ${blendingStrategy} strategy with ${Math.round(hostWeight * 100)}%/${Math.round(guestWeight * 100)}% weighting`,
      });
    } catch (error) {
      console.error('Error generating collaborative image:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate collaborative image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproval = (approved: boolean) => {
    if (!session) return;
    
    collabSocket.updateApproval(session.id, approved, mode === 'host');
    
    const updatedSession = {
      ...session,
      [mode === 'host' ? 'hostApproved' : 'guestApproved']: approved
    };
    setSession(updatedSession);
  };

  const copySessionLink = () => {
    navigator.clipboard.writeText(sessionLink);
    toast({
      title: "Copied!",
      description: "Session link copied to clipboard",
    });
  };

  const isHost = mode === 'host';
  const canGenerate = session?.hostPrompt && session?.guestPrompt && 
                     session.status === 'prompting';
  const bothApproved = session?.hostApproved && session?.guestApproved;

  if (!address) {
    return (
      <Card className="overflow-hidden border-0 shadow-xl bg-card">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 p-6">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-2xl font-bold text-white">Collaborative Art</h3>
            <p className="text-purple-100 dark:text-purple-200 mt-1">Create NFTs together with friends</p>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h4>
            <p className="text-muted-foreground">
              Connect your wallet to start creating collaborative artwork with other artists.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (mode === 'menu') {
    return (
      <Card className="overflow-hidden border-0 shadow-xl bg-card">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 p-6">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-2xl font-bold text-white">Collaborative Art</h3>
            <p className="text-purple-100 dark:text-purple-200 mt-1">Create NFTs together with other artists</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Demo mode indicator */}
          {isDemoMode && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">ℹ</span>
                </div>
                <div>
                  <h4 className="text-blue-800 dark:text-blue-200 font-semibold text-sm mb-1">Demo Mode Active</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    You're using a demo version of collaboration features. Real-time sync is simulated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-join indicator */}
          {joinSessionId && joinSessionId.trim() !== '' && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-blue-800 dark:text-blue-200 font-semibold text-sm mb-1">Joining Collaboration</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Connecting to session: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-xs">{joinSessionId}</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {socketError && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">!</span>
                </div>
                <div>
                  <h4 className="text-amber-800 dark:text-amber-200 font-semibold text-sm mb-1">Collaboration Unavailable</h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                    Real-time collaboration features require a socket server configuration.
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs">
                    Add <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">VITE_SOCKET_URL</code> to your environment variables to enable collaboration.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={createSession}
            disabled={isConnecting || !!socketError}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                Connecting...
              </>
            ) : socketError ? (
              <>
                <Users className="w-5 h-5 mr-3" />
                Collaboration Unavailable
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-3" />
                {isDemoMode ? 'Start Demo Collaboration' : 'Start New Collaboration'}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">Or join existing</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Session ID
            </label>
            <Input
              placeholder="Enter session ID to join collaboration"
              value={joinSessionId}
              onChange={(e) => setJoinSessionId(e.target.value)}
              className="border-border focus:border-ring focus:ring-ring"
              disabled={!!socketError}
            />
            <Button
              onClick={() => joinSession()}
              disabled={isConnecting || !joinSessionId.trim() || !!socketError}
              variant="outline"
              size="lg"
              className="w-full h-12 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-800 dark:hover:text-purple-200 font-semibold disabled:opacity-50"
            >
              Join Collaboration
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Dynamic theme classes
  const themeBg = actualTheme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-white via-gray-100 to-gray-200';
  const cardShadow = actualTheme === 'dark' ? 'shadow-2xl' : 'shadow-lg';
  const cardBg = actualTheme === 'dark' ? 'bg-card' : 'bg-white';

  return (
    <div className={`space-y-8 ${themeBg} transition-colors duration-300`}>
      {/* Session Info */}
      <Card className={`overflow-hidden border-0 ${cardShadow} ${cardBg}`}>
        <div className={`bg-gradient-to-r ${actualTheme === 'dark' ? 'from-emerald-600 to-teal-700' : 'from-emerald-500 to-teal-600'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-lg">
                {isHost ? 'Hosting Collaboration' : 'Joined Collaboration'}
              </h4>
              <p className="text-emerald-100 dark:text-emerald-200 text-sm">
                Session ID: {session?.id}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                session?.guest ? 'bg-green-300 dark:bg-green-400' : 'bg-yellow-300 dark:bg-yellow-400'
              }`} />
              <span className="text-emerald-100 dark:text-emerald-200 text-sm font-medium">
                {session?.guest ? '2/2 Connected' : '1/2 Waiting'}
              </span>
            </div>
          </div>
        </div>
        
        {isHost && sessionLink && (
          <div className="p-4 bg-muted/50">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Share this link with your collaborator
            </label>
            <div className="flex items-center space-x-2">
              <Input
                value={sessionLink}
                readOnly
                className="border-border text-foreground bg-background text-sm"
              />
              <Button
                onClick={copySessionLink}
                size="sm"
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Prompting Phase */}
      {session?.status === 'waiting' || session?.status === 'prompting' ? (
      <Card className={`overflow-hidden border-0 ${cardShadow} ${cardBg}`}>
        <div className={`bg-gradient-to-r ${actualTheme === 'dark' ? 'from-blue-600 to-purple-700' : 'from-blue-500 to-purple-600'} p-6`}>
            <h4 className="text-2xl font-bold text-white">Creative Collaboration</h4>
            <p className="text-blue-100 dark:text-blue-200 mt-1">Share your creative vision</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Your Creative Prompt
              </label>
              <Textarea
                placeholder="Describe your artistic vision in detail..."
                value={myPrompt}
                onChange={(e) => updatePrompt(e.target.value)}
                className="border-border focus:border-ring focus:ring-ring min-h-[120px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                  Host Prompt
                </p>
                <p className="text-muted-foreground text-sm bg-background p-3 rounded border border-border">
                  {session?.hostPrompt || 'Waiting for host prompt...'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                  Guest Prompt
                </p>
                <p className="text-muted-foreground text-sm bg-background p-3 rounded border border-border">
                  {session?.guestPrompt || 'Waiting for guest prompt...'}
                </p>
              </div>
            </div>

            {/* Advanced Blending Options */}
            {canGenerate && (
        <Card className={`bg-gradient-to-r ${actualTheme === 'dark' ? 'from-blue-950/30 to-purple-950/30' : 'from-blue-50 to-purple-50'} ${actualTheme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-foreground flex items-center">
                      <Palette className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      AI Blending Controls
                    </h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Blending Strategy
                      </label>
                      <Select value={blendingStrategy} onValueChange={(value: any) => {
                        updateBlendingOptions(value, [promptWeight[0] / 100, 1 - promptWeight[0] / 100]);
                      }}>
                        <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fusion">🔮 Fusion - Harmonious blend</SelectItem>
                          <SelectItem value="merge">🔗 Merge - Direct combination</SelectItem>
                          <SelectItem value="style-transfer">🎨 Style Transfer - Content + Style</SelectItem>
                          <SelectItem value="weighted">⚖️ Weighted - Custom balance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(blendingStrategy === 'weighted' || showAdvancedOptions) && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Prompt Balance: Host {promptWeight[0]}% - Guest {100 - promptWeight[0]}%
                        </label>
                        <Slider
                          value={promptWeight}
                          onValueChange={(value) => {
                            setPromptWeight(value);
                            updateBlendingOptions(blendingStrategy, [value[0] / 100, 1 - value[0] / 100]);
                          }}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>More Host Influence</span>
                          <span>More Guest Influence</span>
                        </div>
                      </div>
                    )}

                    {showAdvancedOptions && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                        <div className="text-xs text-muted-foreground">
                          <strong>Fusion:</strong> Creates harmonious artistic synthesis
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Style Transfer:</strong> Uses host as content, guest as style
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Merge:</strong> Simple prompt concatenation
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Weighted:</strong> Custom attention weights
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {canGenerate && (
              <Button
                onClick={() => generateCollabImage(session)}
                disabled={isGenerating}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 dark:hover:from-blue-800 dark:hover:via-purple-800 dark:hover:to-pink-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 mr-3 animate-spin" />
                    Creating collaborative masterpiece using {blendingStrategy} blending...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Generate Collaborative Artwork
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {/* Image Approval Phase */}
      {session?.generatedImage && session?.status === 'approving' && (
        <Card className={`overflow-hidden border-0 ${cardShadow} ${cardBg}`}>
          <div className={`bg-gradient-to-r ${actualTheme === 'dark' ? 'from-amber-600 to-orange-700' : 'from-amber-500 to-orange-600'} p-6`}>
            <h4 className="text-2xl font-bold text-white">Review & Approve</h4>
            <p className="text-amber-100 dark:text-amber-200 mt-1">Both collaborators must approve to proceed</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="relative group max-w-lg">
                <img
                  src={session.generatedImage}
                  alt="Collaborative AI artwork"
                  className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-3 text-center">Approval Status</h5>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    session.hostApproved ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'
                  }`} />
                  <p className="text-sm font-medium text-foreground">Host</p>
                  {session.hostApproved && <p className="text-xs text-green-600 dark:text-green-400">Approved</p>}
                </div>
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    session.guestApproved ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'
                  }`} />
                  <p className="text-sm font-medium text-foreground">Guest</p>
                  {session.guestApproved && <p className="text-xs text-green-600 dark:text-green-400">Approved</p>}
                </div>
              </div>
            </div>

            {!session[mode === 'host' ? 'hostApproved' : 'guestApproved'] && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleApproval(false)}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-800 dark:hover:text-red-300"
                >
                  <X className="w-5 h-5 mr-2" />
                  Reject Artwork
                </Button>
                <Button
                  onClick={() => handleApproval(true)}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800 text-white font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Approve Artwork
                </Button>
              </div>
            )}

            {bothApproved && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-1">
                <CollabNFTMinter
                  imageUrl={session.generatedImage}
                  hostPrompt={session.hostPrompt!}
                  guestPrompt={session.guestPrompt!}
                  hostAddress={session.host}
                  guestAddress={session.guest!}
                  sessionId={session.id}
                  blendingStrategy={blendingStrategy}
                />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CollabMode;
