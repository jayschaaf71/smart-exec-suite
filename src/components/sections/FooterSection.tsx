import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight 
} from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="text-2xl font-bold text-accent">Black Knight AI</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Empowering executives to discover, learn, and implement AI productivity 
              tools that transform their businesses.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:text-accent hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-accent hover:bg-white/10">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-accent hover:bg-white/10">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Products</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Tool Marketplace</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Learning Academy</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">AI Assistant</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Team Collaboration</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Analytics Dashboard</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Getting Started</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Documentation</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Case Studies</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Best Practices</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent transition-smooth">Community</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-white/80 mb-4">
              Get weekly insights on AI productivity and new tool releases.
            </p>
            <div className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="cta" size="sm">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5 text-accent" />
              <span className="text-white/80">hello@blackknightai.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-accent" />
              <span className="text-white/80">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-accent" />
              <span className="text-white/80">San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/60 text-sm mb-4 md:mb-0">
            © 2024 Black Knight AI. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white/60 hover:text-accent transition-smooth">Privacy Policy</a>
            <a href="#" className="text-white/60 hover:text-accent transition-smooth">Terms of Service</a>
            <a href="#" className="text-white/60 hover:text-accent transition-smooth">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}