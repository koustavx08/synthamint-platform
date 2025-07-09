import { useEffect, useState, useMemo, useCallback } from 'react';
import { useStoryMint } from '@/hooks/useStoryMint';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Images, Book, Sparkles, Image as ImageIcon } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const ComicGallery = () => {
  const { comics, isLoading, error } = useStoryMint();
  const [displayCount, setDisplayCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedComics.length < filteredComics.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [displayedComics.length, filteredComics.length, loadMore]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Images className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Comic Gallery
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of AI-generated comic NFTs and immersive stories
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search comics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-2">Loading comics...</div>
            <div className="text-lg text-muted-foreground">Fetching the latest creations ✨</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                  <span className="text-destructive font-bold">!</span>
                </div>
                <div className="font-bold text-lg">Error Loading Gallery</div>
              </div>
              <div className="text-destructive/80">{error}</div>
            </div>
          </div>
        )}

        {/* Comics Grid */}
        {!isLoading && !error && (
          <>
            {comics.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No Comics Yet</h3>
                <p className="text-muted-foreground text-lg">
                  Be the first to create and mint a comic NFT!
                </p>
              </div>
            ) : (
              <>
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
                      className="group overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                    >
                      <div className="relative overflow-hidden">
                        <OptimizedImage
                          src={comic.image}
                          alt="Comic NFT"
                          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                          priority={idx < 6}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                            Token #{comic.tokenId}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center gap-2 text-white">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">AI Generated</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-1">
                              {comic.name}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {comic.description}
                            </p>
                          </div>
                          
                          <div className="p-4 bg-muted/30 rounded-xl border">
                            <div className="flex items-center gap-2 mb-2">
                              <Book className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">Story Preview</span>
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4 leading-relaxed">
                              {comic.story}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Sentinel */}
                {displayedComics.length < filteredComics.length && (
                  <div id="scroll-sentinel" className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComicGallery;
