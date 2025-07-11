import { Link, useLocation } from 'react-router-dom';
import { Palette, Sparkles, Menu, X, Wallet, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const isActive = (path: string) => location.pathname === path;

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowConnectors(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowConnectors(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/solo-create', label: 'Create' },
    { to: '/storymint', label: 'Story Mint' },
    { to: '/collab-create', label: 'Collaborate' },
    { to: '/gallery', label: 'Gallery' }
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-800/90 backdrop-blur-md border-b border-gray-700/50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Palette className="h-8 w-8 text-purple-400 transition-colors group-hover:text-purple-300" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            SynthaMint
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white",
                isActive(link.to) && "text-white font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth - Wallet Connection */}
        <div className="hidden md:flex items-center space-x-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-mono text-gray-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Button 
                onClick={() => disconnect()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {connectors.length === 1 ? (
                <Button 
                  onClick={() => handleConnect(connectors[0])}
                  disabled={isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isPending ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => setShowConnectors(!showConnectors)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${showConnectors ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showConnectors && (
                    <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600 shadow-2xl rounded-lg z-50 min-w-[200px] overflow-hidden">
                      {connectors.map((connector, index) => (
                        <Button
                          key={connector.uid}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          variant="ghost"
                          className={`w-full justify-start text-white hover:bg-gray-700/50 rounded-none border-0 px-4 py-3 text-sm font-medium ${
                            index !== connectors.length - 1 ? 'border-b border-gray-600/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
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
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <Menu className={cn("h-6 w-6 transition-all duration-200", isMobileMenuOpen && "rotate-90 opacity-0")} />
            <X className={cn("absolute h-6 w-6 transition-all duration-200", !isMobileMenuOpen && "-rotate-90 opacity-0")} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 border-t border-gray-700/50 bg-gray-800/95 backdrop-blur-md",
        isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium transition-all duration-200 text-gray-300 hover:text-white",
                isActive(link.to) && "text-white font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-700/50 space-y-2">
            {isConnected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-4 py-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <Button 
                  onClick={() => {
                    disconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => {
                      handleConnect(connector);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
