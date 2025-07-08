
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from 'wagmi';
import { Copy, Users, Loader, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    if (address) {
      initializeSocket();
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
    });
  }, []);

  const initializeSocket = async () => {
    try {
      setIsConnecting(true);
      await collabSocket.connect();
      toast({
        title: "Connected",
        description: "Ready for collaboration!",
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      toast({
        title: "Connection Issue",
        description: "Using offline mode for demo purposes",
        variant: "destructive",
      });
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

  const joinSession = async () => {
    if (!address || !joinSessionId.trim()) return;
    
    try {
      setIsConnecting(true);
      const sessionData = await collabSocket.joinSession(joinSessionId.trim(), address);
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

  const generateCollabImage = async (sessionData: CollabSession) => {
    if (!sessionData.hostPrompt || !sessionData.guestPrompt) return;
    
    setIsGenerating(true);
    
    try {
      // Merge prompts for collaborative generation
      const mergedPrompt = `${sessionData.hostPrompt}, ${sessionData.guestPrompt}`;
      
      // Use AI image generation service
      const result = await aiImageService.generateImage({
        prompt: mergedPrompt,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });
      
      // Update session with generated image
      const updatedSession = {
        ...sessionData,
        generatedImage: result.url,
        status: 'approving' as const
      };
      setSession(updatedSession);
      
      toast({
        title: "Collaborative Image Generated!",
        description: "Both prompts have been merged and generated successfully",
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
      <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Collab Mode</h3>
          <p className="text-gray-400">Connect your wallet to start collaborating</p>
        </div>
      </Card>
    );
  }

  if (mode === 'menu') {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <div className="text-center mb-6">
          <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Collab Mode</h3>
          <p className="text-gray-400">Create or join a collaborative NFT session</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={createSession}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isConnecting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Start New Session
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-gray-400">Or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Enter session ID to join"
              value={joinSessionId}
              onChange={(e) => setJoinSessionId(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={joinSession}
              disabled={isConnecting || !joinSessionId.trim()}
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:text-white"
            >
              Join Session
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">
              {isHost ? 'Hosting Session' : 'Joined Session'}
            </h4>
            <p className="text-sm text-gray-400">
              Session ID: {session?.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              session?.guest ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <span className="text-sm text-gray-300">
              {session?.guest ? '2/2 Connected' : '1/2 Waiting'}
            </span>
          </div>
        </div>
        
        {isHost && sessionLink && (
          <div className="mt-3 flex items-center space-x-2">
            <Input
              value={sessionLink}
              readOnly
              className="bg-slate-700/50 border-slate-600 text-white text-sm"
            />
            <Button
              onClick={copySessionLink}
              size="sm"
              variant="outline"
              className="border-slate-600 text-gray-300 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Prompting Phase */}
      {session?.status === 'waiting' || session?.status === 'prompting' ? (
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4">Enter Your Prompt</h4>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your creative vision..."
              value={myPrompt}
              onChange={(e) => updatePrompt(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 min-h-[100px]"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Host Prompt:</p>
                <p className="text-white bg-slate-700/30 p-2 rounded">
                  {session?.hostPrompt || 'No prompt yet...'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Guest Prompt:</p>
                <p className="text-white bg-slate-700/30 p-2 rounded">
                  {session?.guestPrompt || 'No prompt yet...'}
                </p>
              </div>
            </div>

            {canGenerate && (
              <Button
                onClick={() => generateCollabImage(session)}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating Collaborative Art...
                  </>
                ) : (
                  'Generate Collaborative Image'
                )}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {/* Image Approval Phase */}
      {session?.generatedImage && session?.status === 'approving' && (
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4">Approve Collaborative Art</h4>
          
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={session.generatedImage}
                alt="Collaborative AI art"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  session.hostApproved ? 'bg-green-400' : 'bg-gray-600'
                }`} />
                <p className="text-xs text-gray-400">Host</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  session.guestApproved ? 'bg-green-400' : 'bg-gray-600'
                }`} />
                <p className="text-xs text-gray-400">Guest</p>
              </div>
            </div>

            {!session[mode === 'host' ? 'hostApproved' : 'guestApproved'] && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApproval(false)}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproval(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {bothApproved && (
              <CollabNFTMinter
                imageUrl={session.generatedImage}
                hostPrompt={session.hostPrompt!}
                guestPrompt={session.guestPrompt!}
                hostAddress={session.host}
                guestAddress={session.guest!}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CollabMode;
