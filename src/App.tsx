import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StoryMint from "./components/StoryMint";
import ComicGallery from "./components/ComicGallery";
import NavBar from "./components/NavBar";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/storymint" element={<StoryMint />} />
            <Route path="/gallery" element={<ComicGallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
