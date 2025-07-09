import { Link, useLocation } from 'react-router-dom';
import { Palette, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/solo-create', label: 'Solo Create' },
    { to: '/collab-create', label: 'Collab Create' },
    { to: '/storymint', label: 'Story Mint' },
    { to: '/gallery', label: 'Gallery' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Palette className="h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SynthaMint
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive(link.to) && "bg-accent text-accent-foreground shadow-sm"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Theme Toggle */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative"
          >
            <Menu className={cn("h-6 w-6 transition-all duration-200", isMobileMenuOpen && "rotate-90 opacity-0")} />
            <X className={cn("absolute h-6 w-6 transition-all duration-200", !isMobileMenuOpen && "-rotate-90 opacity-0")} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 border-t bg-background/95 backdrop-blur",
        isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive(link.to) && "bg-accent text-accent-foreground shadow-sm"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
