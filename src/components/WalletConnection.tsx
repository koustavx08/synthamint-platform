
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
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Wallet Connection</h3>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-slate-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Connect to start creating NFTs</p>
            )}
          </div>
        </div>
        
        {isConnected ? (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Disconnect
          </Button>
        ) : (
          <div className="relative">
            {connectors.length === 1 ? (
              <Button 
                onClick={() => handleConnect(connectors[0])}
                disabled={isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-6"
              >
                {isPending ? 'Connecting...' : `Connect ${connectors[0].name}`}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setShowConnectors(!showConnectors)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-6"
                >
                  Connect Wallet
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                
                {showConnectors && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-10 min-w-[200px] overflow-hidden">
                    {connectors.map((connector) => (
                      <Button
                        key={connector.uid}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        variant="ghost"
                        className="w-full justify-start text-slate-700 hover:bg-slate-50 rounded-none border-0 px-4 py-3"
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
