import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 404 Display */}
        <div className="relative mb-8">
          <div className="text-8xl lg:text-9xl font-bold bg-gradient-to-r from-primary/20 to-accent/20 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The page you're looking for seems to have vanished into the digital void. 
            Don't worry, even the best explorers sometimes take a wrong turn.
          </p>
          <div className="p-4 bg-muted/30 rounded-xl border inline-block">
            <p className="text-sm text-muted-foreground font-mono">
              Attempted route: <span className="text-destructive">{location.pathname}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-8">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="border-2">
            <Link to="/gallery">
              <Search className="w-5 h-5 mr-2" />
              Browse Gallery
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
