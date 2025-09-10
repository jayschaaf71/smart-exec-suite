import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Clock, 
  Star,
  ExternalLink,
  Settings,
  LogOut
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  industry: string | null;
  company_size: string | null;
  ai_experience: string | null;
  goals: string[] | null;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  relevanceScore: number;
  pricing: string;
  features: string[];
  url: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedTools, setRecommendedTools] = useState<AITool[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      generateRecommendations(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (profileData: UserProfile) => {
    // AI tool recommendations based on user profile
    const allTools: AITool[] = [
      {
        id: "1",
        name: "ChatGPT Plus",
        description: "Advanced AI assistant for writing, analysis, and creative tasks",
        category: "General AI",
        relevanceScore: calculateRelevance(profileData, ["writing", "analysis", "general"]),
        pricing: "$20/month",
        features: ["Advanced reasoning", "File uploads", "Custom GPTs", "Priority access"],
        url: "https://openai.com/chatgpt"
      },
      {
        id: "2", 
        name: "Notion AI",
        description: "AI-powered writing and productivity within your workspace",
        category: "Productivity",
        relevanceScore: calculateRelevance(profileData, ["productivity", "writing", "organization"]),
        pricing: "$10/month",
        features: ["Content generation", "Summarization", "Translation", "Workspace integration"],
        url: "https://notion.so"
      },
      {
        id: "3",
        name: "Midjourney",
        description: "AI image generation for creative and marketing content",
        category: "Creative",
        relevanceScore: calculateRelevance(profileData, ["creative", "marketing", "visual"]),
        pricing: "$10-60/month",
        features: ["High-quality images", "Style consistency", "Commercial usage", "Fast generation"],
        url: "https://midjourney.com"
      },
      {
        id: "4",
        name: "Zapier AI",
        description: "Automate workflows and connect apps with AI assistance",
        category: "Automation",
        relevanceScore: calculateRelevance(profileData, ["automation", "productivity", "integration"]),
        pricing: "$19.99/month",
        features: ["Workflow automation", "App integrations", "AI suggestions", "Custom triggers"],
        url: "https://zapier.com"
      },
      {
        id: "5",
        name: "Jasper AI",
        description: "AI copywriter for marketing and business content",
        category: "Marketing",
        relevanceScore: calculateRelevance(profileData, ["marketing", "writing", "business"]),
        pricing: "$49/month",
        features: ["Brand voice", "Templates", "SEO optimization", "Team collaboration"],
        url: "https://jasper.ai"
      },
      {
        id: "6",
        name: "GitHub Copilot",
        description: "AI pair programmer for software development",
        category: "Development",
        relevanceScore: calculateRelevance(profileData, ["development", "coding", "technical"]),
        pricing: "$10/month",
        features: ["Code completion", "Multiple languages", "Context aware", "IDE integration"],
        url: "https://github.com/features/copilot"
      }
    ];

    // Sort by relevance and take top recommendations
    const sorted = allTools.sort((a, b) => b.relevanceScore - a.relevanceScore);
    setRecommendedTools(sorted.slice(0, 4));
  };

  const calculateRelevance = (profileData: UserProfile, toolKeywords: string[]): number => {
    let score = 50; // Base score

    // Score based on goals
    if (profileData.goals) {
      const goalMatches = profileData.goals.filter(goal => 
        toolKeywords.some(keyword => 
          goal.toLowerCase().includes(keyword) || 
          keyword === "productivity" && goal.includes("productivity") ||
          keyword === "automation" && goal.includes("automate") ||
          keyword === "creative" && goal.includes("innovation")
        )
      ).length;
      score += goalMatches * 15;
    }

    // Score based on role
    if (profileData.role) {
      if (toolKeywords.includes("technical") && ["cto", "developer"].includes(profileData.role)) {
        score += 25;
      }
      if (toolKeywords.includes("marketing") && ["cmo", "marketing"].includes(profileData.role)) {
        score += 25;
      }
      if (toolKeywords.includes("general") && ["ceo", "founder", "manager"].includes(profileData.role)) {
        score += 20;
      }
    }

    // Score based on AI experience
    if (profileData.ai_experience) {
      if (profileData.ai_experience === "beginner" && toolKeywords.includes("general")) {
        score += 10;
      }
      if (profileData.ai_experience === "advanced" && toolKeywords.includes("technical")) {
        score += 15;
      }
    }

    return Math.min(score, 100);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/65117502-c5fc-4d37-bc15-b1f5f625b12e.png" 
                alt="Black Knight AI" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">AI Productivity Toolkit</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.display_name || "User"}
                </p>
                <p className="text-xs text-gray-500">{profile?.role || "Member"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.display_name || "there"}! 👋
          </h2>
          <p className="text-gray-600">
            Here are your personalized AI tool recommendations based on your {profile?.role} role 
            in {profile?.industry} and your goals.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Experience</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.ai_experience?.charAt(0).toUpperCase() + profile?.ai_experience?.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.goals?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recommended Tools</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendedTools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                  <p className="text-2xl font-bold text-gray-900">20+ hrs/week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommended Tools</TabsTrigger>
            <TabsTrigger value="goals">Your Goals</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendedTools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                        <CardDescription className="mt-2">{tool.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{tool.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{tool.relevanceScore}% Match</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">{tool.pricing}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <a href={tool.url} target="_blank" rel="noopener noreferrer">
                            Learn More <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline">Save for Later</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>
                  Track your progress towards achieving these objectives with AI tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.goals?.map((goal, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{goal}</h3>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <Progress value={Math.random() * 60 + 20} className="mt-2" />
                    </Card>
                  )) || (
                    <p className="text-gray-500 col-span-2">No goals set yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your information helps us provide better recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Display Name</label>
                    <p className="mt-1 text-gray-900">{profile?.display_name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-gray-900">{profile?.role || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <p className="mt-1 text-gray-900">{profile?.industry || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Size</label>
                    <p className="mt-1 text-gray-900">{profile?.company_size || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Experience</label>
                    <p className="mt-1 text-gray-900">
                      {profile?.ai_experience?.charAt(0).toUpperCase() + profile?.ai_experience?.slice(1) || "Not set"}
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}