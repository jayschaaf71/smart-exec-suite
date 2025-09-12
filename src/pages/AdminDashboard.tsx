import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Trophy, TrendingUp, Plus, Edit, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTools: number;
  totalGuides: number;
  totalAchievements: number;
  avgEngagement: number;
}

interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
  engagement: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category_id: '',
    pricing_model: 'freemium',
    setup_difficulty: 'easy',
    target_roles: [] as string[],
    features: [] as string[]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load system statistics
      const [usersResponse, toolsResponse, guidesResponse, achievementsResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('tools').select('*'),
        supabase.from('implementation_guides').select('*'),
        supabase.from('achievements').select('*')
      ]);

      // Calculate engagement stats
      const { data: analyticsData } = await supabase
        .from('user_analytics_summary')
        .select('engagement_score');

      const avgEngagement = analyticsData?.reduce((sum, user) => sum + (user.engagement_score || 0), 0) / (analyticsData?.length || 1);

      setStats({
        totalUsers: usersResponse.data?.length || 0,
        activeUsers: analyticsData?.filter(user => user.engagement_score > 50).length || 0,
        totalTools: toolsResponse.data?.length || 0,
        totalGuides: guidesResponse.data?.length || 0,
        totalAchievements: achievementsResponse.data?.length || 0,
        avgEngagement: avgEngagement || 0
      });

      setUsers(usersResponse.data || []);
      setTools(toolsResponse.data || []);

      // Generate mock activity data (in a real app, this would come from analytics)
      const mockActivity: UserActivity[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        newUsers: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        engagement: Math.floor(Math.random() * 30) + 60
      }));

      setUserActivity(mockActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTool = async () => {
    try {
      const { error } = await supabase
        .from('tools')
        .insert([newTool]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tool created successfully"
      });

      setNewTool({
        name: '',
        description: '',
        category_id: '',
        pricing_model: 'freemium',
        setup_difficulty: 'easy',
        target_roles: [],
        features: []
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error creating tool:', error);
      toast({
        title: "Error",
        description: "Failed to create tool",
        variant: "destructive"
      });
    }
  };

  const deleteTool = async (toolId: string) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tool deleted successfully"
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete tool",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">There was an error loading the admin dashboard data.</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your AI adoption platform</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Settings className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tools</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTools}</div>
              <p className="text-xs text-muted-foreground">
                Available in platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Implementation Guides</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalGuides}</div>
              <p className="text-xs text-muted-foreground">
                Step-by-step guides
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats?.avgEngagement || 0)}%</div>
              <Progress value={stats?.avgEngagement || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="tools">Tool Management</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Trends</CardTitle>
                  <CardDescription>Daily new users and activity levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="newUsers" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="New Users"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        name="Active Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Distribution</CardTitle>
                  <CardDescription>User engagement score distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their access</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 10).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{user.user_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role || 'User'}</Badge>
                        </TableCell>
                        <TableCell>{user.industry || 'N/A'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Tool</CardTitle>
                  <CardDescription>Add a new AI tool to the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="toolName">Tool Name</Label>
                    <Input
                      id="toolName"
                      value={newTool.name}
                      onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                      placeholder="Enter tool name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="toolDescription">Description</Label>
                    <Textarea
                      id="toolDescription"
                      value={newTool.description}
                      onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                      placeholder="Describe the tool's capabilities"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pricingModel">Pricing Model</Label>
                    <Select
                      value={newTool.pricing_model}
                      onValueChange={(value) => setNewTool({ ...newTool, pricing_model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="freemium">Freemium</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Setup Difficulty</Label>
                    <Select
                      value={newTool.setup_difficulty}
                      onValueChange={(value) => setNewTool({ ...newTool, setup_difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={createTool} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Tools</CardTitle>
                  <CardDescription>Manage AI tools in the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tool.pricing_model} • {tool.setup_difficulty}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteTool(tool.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage guides, tutorials, and learning content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Content Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Manage implementation guides, learning modules, and educational content
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">User Registration</h4>
                      <p className="text-sm text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">System-wide email notifications</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Analytics Collection</h4>
                      <p className="text-sm text-muted-foreground">Collect user analytics and usage data</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="font-medium">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <div className="mt-4 space-x-2">
                    <Button variant="destructive" size="sm">
                      Reset All User Data
                    </Button>
                    <Button variant="destructive" size="sm">
                      Clear Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}