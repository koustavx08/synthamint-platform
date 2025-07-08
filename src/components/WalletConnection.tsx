
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ChevronDown } from 'lucide-react';
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
    <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Wallet Connection</h3>
            {isConnected ? (
              <p className="text-sm text-gray-300">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Connect your wallet to start minting</p>
            )}
          </div>
        </div>
        
        {isConnected ? (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        ) : (
          <div className="relative">
            {connectors.length === 1 ? (
              <Button 
                onClick={() => handleConnect(connectors[0])}
                disabled={isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isPending ? 'Connecting...' : `Connect ${connectors[0].name}`}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setShowConnectors(!showConnectors)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Connect Wallet
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                
                {showConnectors && (
                  <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px]">
                    {connectors.map((connector) => (
                      <Button
                        key={connector.uid}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-slate-700 rounded-none first:rounded-t-lg last:rounded-b-lg"
                      >
                        {isPending ? 'Connecting...' : connector.name}
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
