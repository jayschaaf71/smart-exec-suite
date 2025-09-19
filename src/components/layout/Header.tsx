import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import blackKnightLogo from '@/assets/black-knight-logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={blackKnightLogo} 
              alt="Black Knight AI" 
              className="h-20 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <button 
                  onClick={() => navigate('/community')}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Community
                </button>
                <button 
                  onClick={() => navigate('/industry-updates')}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Updates
                </button>
                <button 
                  onClick={() => navigate('/consulting')}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Consulting
                </button>
              </>
            ) : (
              <>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Pricing
                </a>
                <a 
                  href="#academy" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Academy
                </a>
                <a 
                  href="#about" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  About
                </a>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <span className="text-muted-foreground text-sm">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button 
                  variant="cta" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              {user ? (
                <>
                  <button 
                    onClick={() => navigate('/community')}
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
                  >
                    Community
                  </button>
                  <button 
                    onClick={() => navigate('/industry-updates')}
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
                  >
                    Updates
                  </button>
                  <button 
                    onClick={() => navigate('/consulting')}
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2 text-left"
                  >
                    Consulting
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="#features" 
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                  >
                    Pricing
                  </a>
                  <a 
                    href="#academy" 
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                  >
                    Academy
                  </a>
                  <a 
                    href="#about" 
                    className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                  >
                    About
                  </a>
                </>
              )}
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <div className="text-muted-foreground text-sm px-2">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      variant="cta" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}