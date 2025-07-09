import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { Suspense, lazy, useEffect } from 'react';

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SoloCreate = lazy(() => import("./pages/SoloCreate"));
const CollabCreate = lazy(() => import("./pages/CollabCreate"));
const StoryMint = lazy(() => import("./components/StoryMint"));
const ComicGallery = lazy(() => import("./components/ComicGallery"));
const NavBar = lazy(() => import("./components/NavBar"));

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
      </div>
      <div className="text-lg font-medium text-muted-foreground">Loading...</div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();
    
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-300">
      <Suspense fallback={<LoadingFallback />}>
        <NavBar />
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingFallback />}>
              <Index />
            </Suspense>
          } />
          <Route path="/solo-create" element={
            <Suspense fallback={<LoadingFallback />}>
              <SoloCreate />
            </Suspense>
          } />
          <Route path="/collab-create" element={
            <Suspense fallback={<LoadingFallback />}>
              <CollabCreate />
            </Suspense>
          } />
          <Route path="/storymint" element={
            <Suspense fallback={<LoadingFallback />}>
              <StoryMint />
            </Suspense>
          } />
          <Route path="/gallery" element={
            <Suspense fallback={<LoadingFallback />}>
              <ComicGallery />
            </Suspense>
          } />
          <Route path="*" element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
