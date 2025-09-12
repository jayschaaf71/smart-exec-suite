import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Search, 
  Filter,
  Grid,
  List,
  Eye,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  category_id: string;
  features: string[];
  pricing_model: string;
  pricing_amount: number;
  user_rating: number;
  expert_rating: number;
  popularity_score: number;
  time_to_value: string;
  setup_difficulty: string;
  target_roles: string[];
  target_industries: string[];
  target_company_sizes: string[];
  pros: string[];
  cons: string[];
  website_url: string;
  logo_url: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function ToolLibrary() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortTools();
  }, [tools, searchQuery, selectedCategory, selectedDifficulty, selectedPricing, sortBy]);

  const loadData = async () => {
    try {
      // Load tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active');

      if (toolsError) throw toolsError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      setTools(toolsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading tools:', error);
      toast({
        title: "Error",
        description: "Failed to load tools. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTools = () => {
    let filtered = [...tools];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.features?.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category_id === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tool => tool.setup_difficulty === selectedDifficulty);
    }

    // Pricing filter
    if (selectedPricing !== 'all') {
      if (selectedPricing === 'free') {
        filtered = filtered.filter(tool => 
          tool.pricing_model === 'free' || tool.pricing_model === 'freemium'
        );
      } else if (selectedPricing === 'paid') {
        filtered = filtered.filter(tool => 
          tool.pricing_model !== 'free' && tool.pricing_model !== 'freemium'
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.user_rating || 0) - (a.user_rating || 0);
        case 'popularity':
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        case 'newest':
          // Since we don't have created_at in the interface, use popularity as fallback
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        default:
          return 0;
      }
    });

    setFilteredTools(filtered);
  };

  const getPricingDisplay = (tool: Tool) => {
    if (tool.pricing_model === 'free') return 'Free';
    if (tool.pricing_model === 'freemium') return 'Freemium';
    if (tool.pricing_amount) return `$${tool.pricing_amount}/month`;
    return 'Contact for pricing';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Tool Library</h2>
            <p className="text-muted-foreground">
              Discover and explore {tools.length} AI tools to boost your productivity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPricing} onValueChange={setSelectedPricing}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popular</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTools.length} of {tools.length} tools
        </p>
      </div>

      {/* Tools Grid/List */}
      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredTools.map((tool) => (
            <Card 
              key={tool.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'p-0' : ''
              }`}
              onClick={() => navigate(`/tools/${tool.id}`)}
            >
              <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                <div className={`flex ${viewMode === 'list' ? 'items-center gap-4' : 'flex-col gap-2'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(tool.category_id)}
                      </Badge>
                    </div>
                    <CardDescription className={viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}>
                      {tool.description}
                    </CardDescription>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {getPricingDisplay(tool)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tool.time_to_value}
                      </div>
                      {tool.user_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {tool.user_rating}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {viewMode === 'grid' && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {getPricingDisplay(tool)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tool.time_to_value}
                      </div>
                      {tool.user_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {tool.user_rating}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(tool.setup_difficulty)}>
                        {tool.setup_difficulty} setup
                      </Badge>
                      {tool.popularity_score > 50 && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>

                    {tool.features && tool.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {tool.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tool.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tools/${tool.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}