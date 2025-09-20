import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RecommendedTools } from '@/components/dashboard/RecommendedTools';
import { QuickWins } from '@/components/dashboard/QuickWins';
import { ImplementationGuides } from '@/components/implementation/ImplementationGuides';
import { ProgressTracking } from '@/components/dashboard/ProgressTracking';
import { LearningAcademy } from '@/components/learning/LearningAcademy';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { IntegrationExport } from '@/components/integration/IntegrationExport';
import { EnterpriseFeatures } from '@/components/enterprise/EnterpriseFeatures';
import { SystemHealth } from '@/components/system/SystemHealth';
import { ToolLibrary } from '@/components/tools/ToolLibrary';
import { Analytics } from '@/utils/analytics';
import { DailyAINews } from '@/components/daily-news/DailyAINews';
import { CommunicationHub } from '@/components/communication/CommunicationHub';
import { QuickAccess } from '@/components/navigation/QuickAccess';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Clock,
  Home,
  LogOut,
  ChevronRight,
  Award,
  BarChart3,
  Lightbulb,
  Zap,
  Users
} from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface UserProfile {
  display_name: string;
  role: string;
  industry: string;
  ai_experience: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    toolsRecommended: 0,
    toolsImplemented: 0,
    goalsActive: 0,
    timeInvested: '0 hours'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      Analytics.init(user.id);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    // For mock user, use mock data
    if (user.id === '550e8400-e29b-41d4-a716-446655440000') {
      setProfile({
        display_name: 'Test User',
        role: 'Manager',
        industry: 'Technology', 
        ai_experience: 'Beginner'
      });
      
      setStats({
        toolsRecommended: 8,
        toolsImplemented: 0,
        goalsActive: 3,
        timeInvested: '0 hours'
      });
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          role: data.role || '',
          industry: data.industry || '',
          ai_experience: data.ai_experience || ''
        });
        
        setStats({
          toolsRecommended: 8,
          toolsImplemented: 0,
          goalsActive: data.goals?.length || 0,
          timeInvested: '0 hours'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || !profile.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-lg shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Black Knight AI!</h2>
              <p className="text-gray-600 mb-4">
                Complete your personalized assessment to get tailored AI tool recommendations for your role and industry.
              </p>
              <div className="text-sm text-muted-foreground mb-6">
                <p>✨ Get personalized recommendations</p>
                <p>🎯 See tools specific to your role</p>
                <p>📊 Track your AI implementation progress</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/assessment')} 
              size="lg"
              className="w-full"
            >
              Start Your Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Black Knight AI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {profile.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profile.display_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile.display_name}! 👋
            </h2>
            <p className="text-lg text-gray-600">
              Here are your personalized AI tool recommendations for {profile.role}s in {profile.industry}.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tools Recommended</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.toolsRecommended}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tools Implemented</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.toolsImplemented}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Goals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.goalsActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Time Invested</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.timeInvested}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access & Daily AI News */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <QuickAccess />
            </div>
            <div className="lg:col-span-2">
              <DailyAINews />
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1">
              <TabsTrigger value="recommendations" className="text-xs">Recommended</TabsTrigger>
              <TabsTrigger value="library" className="text-xs">Library</TabsTrigger>
              <TabsTrigger value="quickwins" className="text-xs">Quick Wins</TabsTrigger>
              <TabsTrigger value="guides" className="text-xs">Guides</TabsTrigger>
              <TabsTrigger value="learning" className="text-xs">Learning</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              <TabsTrigger value="communications" className="text-xs">Community</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <TabsList className="grid grid-cols-5 gap-1">
                <TabsTrigger value="integrations" className="text-xs">Export</TabsTrigger>
                <TabsTrigger value="enterprise" className="text-xs">Enterprise</TabsTrigger>
                <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
                <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="recommendations">
              <RecommendedTools />
            </TabsContent>
            
            <TabsContent value="library">
              <ToolLibrary />
            </TabsContent>
            
            <TabsContent value="quickwins">
              <QuickWins />
            </TabsContent>
            
            <TabsContent value="guides">
              <ImplementationGuides />
            </TabsContent>
            
            <TabsContent value="learning">
              <LearningAcademy />
            </TabsContent>
            
            <TabsContent value="progress">
              <ProgressTracking />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="integrations">
              <IntegrationExport />
            </TabsContent>
            
            <TabsContent value="enterprise">
              <EnterpriseFeatures />
            </TabsContent>
            
            <TabsContent value="system">
              <SystemHealth />
            </TabsContent>
            
            <TabsContent value="communications">
              <CommunicationHub />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationPreferences />
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    View and manage your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground">{profile.display_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Industry</Label>
                      <p className="text-sm text-muted-foreground">{profile.industry}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">AI Experience</Label>
                      <p className="text-sm text-muted-foreground capitalize">{profile.ai_experience}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/onboarding')}>
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}