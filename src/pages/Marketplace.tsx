import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  ArrowRight,
  Filter,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Palette,
  BarChart3,
  MessageSquare,
  FileText,
  Camera,
  Code,
  Music,
  Video
} from 'lucide-react';

const featuredTools = [
  {
    id: 1,
    name: "ChatGPT",
    description: "Advanced conversational AI for content creation, analysis, and problem-solving",
    category: "Writing & Content",
    pricing: "Freemium",
    rating: 4.8,
    difficulty: "Beginner",
    icon: MessageSquare,
    features: ["Content Creation", "Code Assistance", "Analysis", "Translation"],
    timeToValue: "5 minutes",
    popularity: "Most Popular"
  },
  {
    id: 2,
    name: "Midjourney",
    description: "AI-powered image generation for creative professionals and marketers",
    category: "Design & Visual",
    pricing: "Paid",
    rating: 4.9,
    difficulty: "Intermediate",
    icon: Palette,
    features: ["Image Generation", "Art Creation", "Brand Assets", "Marketing Visuals"],
    timeToValue: "15 minutes",
    popularity: "Rising"
  },
  {
    id: 3,
    name: "Notion AI",
    description: "Intelligent workspace assistant for productivity and project management",
    category: "Productivity",
    pricing: "Freemium",
    rating: 4.7,
    difficulty: "Beginner",
    icon: FileText,
    features: ["Writing Assistant", "Task Management", "Database Creation", "Templates"],
    timeToValue: "10 minutes",
    popularity: "Staff Pick"
  },
  {
    id: 4,
    name: "Zapier AI",
    description: "Workflow automation platform connecting your favorite apps",
    category: "Automation",
    pricing: "Freemium",
    rating: 4.6,
    difficulty: "Intermediate",
    icon: Zap,
    features: ["Workflow Automation", "App Integration", "Trigger Management", "Custom Actions"],
    timeToValue: "30 minutes",
    popularity: "Business Essential"
  },
  {
    id: 5,
    name: "Tableau AI",
    description: "Advanced data visualization and business intelligence platform",
    category: "Analytics",
    pricing: "Paid",
    rating: 4.5,
    difficulty: "Advanced",
    icon: BarChart3,
    features: ["Data Visualization", "Business Intelligence", "Predictive Analytics", "Dashboards"],
    timeToValue: "2 hours",
    popularity: "Enterprise Favorite"
  },
  {
    id: 6,
    name: "Loom AI",
    description: "Video messaging and screen recording with AI-powered features",
    category: "Communication",
    pricing: "Freemium",
    rating: 4.4,
    difficulty: "Beginner",
    icon: Video,
    features: ["Screen Recording", "Video Messages", "AI Summaries", "Team Collaboration"],
    timeToValue: "5 minutes",
    popularity: "Team Favorite"
  }
];

const categories = [
  { value: "all", label: "All Categories", icon: Target },
  { value: "writing", label: "Writing & Content", icon: FileText },
  { value: "design", label: "Design & Visual", icon: Palette },
  { value: "productivity", label: "Productivity", icon: Clock },
  { value: "automation", label: "Automation", icon: Zap },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "communication", label: "Communication", icon: MessageSquare }
];

const difficultyLevels = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

const pricingOptions = [
  { value: "all", label: "All Pricing" },
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" }
];

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');

  const filteredTools = featuredTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           tool.category.toLowerCase().includes(selectedCategory);
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             tool.difficulty.toLowerCase() === selectedDifficulty;
    const matchesPricing = selectedPricing === 'all' || 
                          tool.pricing.toLowerCase() === selectedPricing;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesPricing;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing.toLowerCase()) {
      case 'free': return 'bg-blue-100 text-blue-800';
      case 'freemium': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToolClick = (toolId: number) => {
    navigate(`/tools/${toolId}`);
  };

  const handleGetPersonalizedRecommendations = () => {
    if (user) {
      navigate('/assessment');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/65117502-c5fc-4d37-bc15-b1f5f625b12e.png" 
                alt="Black Knight AI" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">AI Tool Marketplace</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                ← Back to Home
              </Button>
              {user ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover AI Tools for Your Business
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore our curated collection of 500+ AI tools. Get personalized recommendations 
              based on your role, industry, and goals.
            </p>
            
            {!user && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Get Personalized Recommendations
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Take our free 5-minute assessment to get AI tool recommendations 
                  tailored specifically to your role and industry.
                </p>
                <Button 
                  onClick={handleGetPersonalizedRecommendations}
                  className="w-full sm:w-auto"
                >
                  Start Free Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Filter Tools</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPricing} onValueChange={setSelectedPricing}>
                <SelectTrigger>
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent>
                  {pricingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {filteredTools.length} of {featuredTools.length} tools
            </p>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => {
              const IconComponent = tool.icon;
              return (
                <Card 
                  key={tool.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {tool.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{tool.rating}</span>
                            </div>
                            {tool.popularity && (
                              <Badge variant="secondary" className="text-xs">
                                {tool.popularity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-2">
                      {tool.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className={getDifficultyColor(tool.difficulty)}>
                        {tool.difficulty}
                      </Badge>
                      <Badge variant="outline" className={getPricingColor(tool.pricing)}>
                        {tool.pricing}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tool.timeToValue}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {tool.category}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {tool.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tool.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                      variant="outline"
                    >
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Call to Action */}
          {user && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8 mt-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Implement AI in Your Business?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get step-by-step implementation guides, ROI calculators, and expert support 
                to successfully deploy AI tools in your organization.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                size="lg"
              >
                View Your Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}