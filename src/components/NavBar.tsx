import { Link, useLocation } from 'react-router-dom';
import { Palette, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Crypto' },
    { to: '/gallery', label: 'Community' },
    { to: '/solo-create', label: 'Company' },
    { to: '/collab-create', label: 'Contact' }
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
            DreamMint
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
            Log in
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            Sign up
          </Button>
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
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50">
              Log in
            </Button>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
