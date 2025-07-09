
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
    <Card className="bg-card/80 backdrop-blur-sm border shadow-2xl hover:shadow-3xl transition-all duration-500 group">
      <div className="flex items-center justify-between p-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
              isConnected 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : 'bg-gradient-to-r from-primary to-accent'
            }`}>
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            {isConnected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">Wallet Connection</h3>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <p className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-muted-foreground">Connect to start creating NFTs</p>
              </div>
            )}
          </div>
        </div>
        
        {isConnected ? (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            size="lg"
            className="border-2 border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 hover:border-red-300 dark:hover:border-red-400/50 transition-all duration-200 font-medium px-6"
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
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl px-8 font-bold transition-all duration-300 relative overflow-hidden group"
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
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl px-8 font-bold transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                  <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-200 ${showConnectors ? 'rotate-180' : ''}`} />
                </Button>
                
                {showConnectors && (
                  <div className="absolute top-full right-0 mt-3 bg-card/95 backdrop-blur-md border shadow-2xl rounded-2xl z-50 min-w-[240px] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {connectors.map((connector, index) => (
                      <Button
                        key={connector.uid}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        variant="ghost"
                        className={`w-full justify-start text-foreground hover:bg-accent/50 rounded-none border-0 px-6 py-4 text-base font-medium transition-all duration-200 ${
                          index !== connectors.length - 1 ? 'border-b border-border/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
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
