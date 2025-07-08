
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
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
          <Button 
            onClick={handleConnect}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Connect MetaMask
          </Button>
        )}
      </div>
    </Card>
  );
};

export default WalletConnection;
