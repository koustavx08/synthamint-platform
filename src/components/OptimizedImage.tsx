import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const getOptimizedSrc = useCallback((originalSrc: string, quality: number = 75) => {
    // For external URLs, return as-is
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }
    
    // For local images, add quality parameters (if using a service like Cloudinary)
    return originalSrc;
  }, []);

  // Create WebP version if supported
  const getWebPSrc = useCallback((originalSrc: string) => {
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();

    if (supportsWebP && !originalSrc.includes('.webp')) {
      // Convert to WebP if your CDN supports it
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  const loadImage = useCallback(() => {
    if (!src) return;

    const optimizedSrc = getOptimizedSrc(src, quality);
    const webpSrc = getWebPSrc(optimizedSrc);
    
    setCurrentSrc(webpSrc);
  }, [src, quality, getOptimizedSrc, getWebPSrc]);

  useEffect(() => {
    if (priority) {
      loadImage();
      return;
    }

    // Lazy loading with Intersection Observer
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );
    }

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [priority, loadImage]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}

      {/* Main image */}
      <picture>
        <source srcSet={currentSrc} type="image/webp" />
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </picture>
    </div>
  );
};

export default React.memo(OptimizedImage);
