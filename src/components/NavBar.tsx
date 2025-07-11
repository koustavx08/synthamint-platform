import { Link, useLocation } from 'react-router-dom';
import { Palette, Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/solo-create', label: 'Create' },
    { to: '/collab-create', label: 'Collaborate' },
    { to: '/storymint', label: 'Story Mint' },
    { to: '/gallery', label: 'Gallery' }
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Palette className="h-8 w-8 text-purple-600 transition-colors group-hover:text-purple-700" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SynthaMint
          </span>
        </Link>

        {/* Desktop Navigation Links - Centered */}
        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900",
                isActive(link.to) && "text-gray-900 font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center">
          <Link to="/storymint">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          >
            <Menu className={cn("h-6 w-6 transition-all duration-200", isMobileMenuOpen && "rotate-90 opacity-0")} />
            <X className={cn("absolute h-6 w-6 transition-all duration-200", !isMobileMenuOpen && "-rotate-90 opacity-0")} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 border-t border-gray-200/50 bg-white/95 backdrop-blur-md",
        isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium transition-all duration-200 text-gray-600 hover:text-gray-900",
                isActive(link.to) && "text-gray-900 font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link to="/storymint" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full font-medium shadow-lg flex items-center justify-center gap-2">
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
