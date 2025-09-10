import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent mb-8">
            <CheckCircle className="mr-2 h-4 w-4" />
            Trusted by 10,000+ executives
          </div>

          {/* Headline */}
          <h1 className="heading-xl text-white mb-6">
            Your AI Productivity{" "}
            <span className="bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
              Transformation
            </span>{" "}
            Starts Here
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover, learn, and implement the perfect AI tools for your business. 
            Get personalized recommendations and step-by-step guidance from industry experts.
          </p>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-white/80">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">200+ AI Tools</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">45% Avg Productivity Gain</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="xl" 
              className="min-w-[200px]"
              onClick={() => navigate(user ? '/onboarding' : '/auth')}
            >
              {user ? 'Continue Assessment' : 'Start Free Assessment'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="premium" size="xl" className="min-w-[200px]">
              View Tool Marketplace
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-16">
            <p className="text-white/60 text-sm mb-6">Trusted by leading companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}