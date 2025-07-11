
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowConnectors(false);
  };

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
      <div className="flex items-center justify-between p-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
              isConnected 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            }`}>
              <Wallet className="w-8 h-8 text-white" />
            </div>
            {isConnected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Wallet Connection</h3>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm font-medium text-emerald-400">Connected</span>
                </div>
                <div className="h-4 w-px bg-gray-600"></div>
                <p className="text-sm font-mono text-gray-300 bg-gray-700/50 px-3 py-1 rounded-lg">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-gray-300">Connect to start creating NFTs</p>
              </div>
            )}
          </div>
        </div>
        
        {isConnected ? (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            size="lg"
            className="border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200 font-medium px-6"
          >
            Disconnect
          </Button>
        ) : (
          <div className="relative">
            {connectors.length === 1 ? (
              <Button 
                onClick={() => handleConnect(connectors[0])}
                disabled={isPending}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl px-8 font-bold transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <Wallet className="w-5 h-5 mr-2" />
                {isPending ? 'Connecting...' : `Connect ${connectors[0].name}`}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setShowConnectors(!showConnectors)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl px-8 font-bold transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                  <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-200 ${showConnectors ? 'rotate-180' : ''}`} />
                </Button>
                
                {showConnectors && (
                  <div className="absolute top-full right-0 mt-3 bg-gray-800/95 backdrop-blur-md border border-gray-600 shadow-2xl rounded-2xl z-50 min-w-[240px] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {connectors.map((connector, index) => (
                      <Button
                        key={connector.uid}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        variant="ghost"
                        className={`w-full justify-start text-white hover:bg-gray-700/50 rounded-none border-0 px-6 py-4 text-base font-medium transition-all duration-200 ${
                          index !== connectors.length - 1 ? 'border-b border-gray-600/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          {isPending ? 'Connecting...' : connector.name}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WalletConnection;
