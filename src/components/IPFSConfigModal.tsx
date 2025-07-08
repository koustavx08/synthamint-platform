
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
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Configure IPFS Storage</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your Pinata API credentials to enable real IPFS uploads. 
            Your keys will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-white">Pinata API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Pinata API Key"
              className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="text-white">Pinata Secret Key</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your Pinata Secret Key"
                className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-slate-700/30 p-3 rounded">
            <p className="mb-2"><strong>To get Pinata API keys:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sign up at <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">pinata.cloud</a></li>
              <li>Go to API Keys section</li>
              <li>Create a new API key with pinning permissions</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-gray-300 hover:text-white">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!apiKey.trim() || !secretKey.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IPFSConfigModal;
