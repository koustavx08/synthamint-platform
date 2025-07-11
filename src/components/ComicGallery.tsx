import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useStoryMint } from '@/hooks/useStoryMint';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Images, Book, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const ComicGallery = () => {
  const { comics, isLoading, error } = useStoryMint();
  const [displayCount, setDisplayCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Memoized filtered comics
  const filteredComics = useMemo(() => {
    if (!searchTerm) return comics;
    return comics.filter(comic => 
      comic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.story?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [comics, searchTerm]);

  // Memoized displayed comics
  const displayedComics = useMemo(() => 
    filteredComics.slice(0, displayCount),
    [filteredComics, displayCount]
  );

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 12);
  }, []);

  // Optimized intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedComics.length < filteredComics.length && !isLoading) {
          loadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedComics.length, filteredComics.length, loadMore, isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg animate-glow">
              <Images className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
              Comic Gallery
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our collection of AI-generated comic NFTs and immersive stories
          </p>
        </header>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search comics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              aria-label="Search comics"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="relative mb-8 inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Loading comics...</h2>
              <p className="text-lg text-muted-foreground">Fetching the latest creations ✨</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 glass border-destructive/20 rounded-2xl text-destructive">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-destructive font-bold">!</span>
                </div>
                <h2 className="font-bold text-lg">Error Loading Gallery</h2>
              </div>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Comics Grid */}
        {!isLoading && !error && (
          <>
            {comics.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No Comics Yet</h3>
                <p className="text-muted-foreground text-lg">
                  Be the first to create and mint a comic NFT!
                </p>
              </div>
            ) : (
              <section aria-label="Comic gallery">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Book className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Latest Creations
                    </h2>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {filteredComics.length} {filteredComics.length === 1 ? 'Comic' : 'Comics'}
                    {searchTerm && ` (filtered from ${comics.length})`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedComics.map((comic, idx) => (
                    <Card 
                      key={comic.tokenId || idx} 
                      className="group overflow-hidden glass hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] optimize-performance"
                    >
                      <div className="relative overflow-hidden">
                        <OptimizedImage
                          src={comic.image}
                          alt={`Comic NFT: ${comic.name}`}
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                          priority={idx < 6}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          Token #{comic.tokenId}
                        </Badge>
                        
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-2 text-white">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">AI Generated</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-1">
                            {comic.name}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {comic.description}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Book className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Story Preview</span>
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4 leading-relaxed">
                            {comic.story}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Sentinel */}
                {displayedComics.length < filteredComics.length && (
                  <div 
                    ref={sentinelRef}
                    className="flex justify-center py-8"
                    aria-hidden="true"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComicGallery;
