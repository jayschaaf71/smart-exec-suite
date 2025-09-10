import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-primary bg-clip-text text-transparent">
              <span className="text-2xl font-bold">AI Toolkit</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button variant="cta" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Get Started
            </Button>
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
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button variant="cta" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}