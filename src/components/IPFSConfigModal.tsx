
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';

interface IPFSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, secretKey: string) => void;
  initialApiKey?: string;
  initialSecretKey?: string;
}

const IPFSConfigModal = ({ isOpen, onClose, onSave, initialApiKey = '', initialSecretKey = '' }: IPFSConfigModalProps) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [secretKey, setSecretKey] = useState(initialSecretKey);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim() && secretKey.trim()) {
      onSave(apiKey.trim(), secretKey.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800/95 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Configure IPFS Storage</DialogTitle>
          <DialogDescription className="text-gray-300">
            Enter your Pinata API credentials to enable secure IPFS uploads. 
            Your keys are stored locally and never shared.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="apiKey" className="text-gray-200 font-semibold">Pinata API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Pinata API Key"
              className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="secretKey" className="text-gray-200 font-semibold">Pinata Secret Key</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your Pinata Secret Key"
                className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-200 hover:bg-gray-600/50"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">How to get Pinata API keys:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-300 text-sm">
              <li>
                Sign up at{' '}
                <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  pinata.cloud
                </a>
              </li>
              <li>Navigate to the API Keys section</li>
              <li>Create a new API key with pinning permissions</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!apiKey.trim() || !secretKey.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IPFSConfigModal;
