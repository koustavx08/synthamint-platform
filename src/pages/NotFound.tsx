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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center pt-24">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* 404 Display */}
          <div className="relative mb-8">
            <div className="text-8xl lg:text-9xl font-bold bg-gradient-to-r from-red-500/30 to-orange-500/30 bg-clip-text text-transparent select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              The page you're looking for seems to have vanished into the digital void. 
              Don't worry, even the best explorers sometimes take a wrong turn.
            </p>
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 inline-block backdrop-blur-sm">
              <p className="text-sm text-gray-400 font-mono">
                Attempted route: <span className="text-red-400">{location.pathname}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50">
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
                className={`h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
