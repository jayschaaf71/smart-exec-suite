import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, TrendingUp, Send, Plus, Heart, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_at: string;
}

interface CommunityMessage {
  id: string;
  community_id: string;
  author_id: string;
  author_name: string;
  content: string;
  message_type: 'discussion' | 'question' | 'announcement';
  likes_count: number;
  replies_count: number;
  created_at: string;
  author_role?: string;
  author_company?: string;
}

const COMMUNITY_CATEGORIES = [
  'Industry Leaders',
  'AI Implementation',
  'Technology Trends',
  'Financial Planning',
  'Operations Excellence',
  'Leadership Development'
];

export function CommunityHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'discussion' | 'question' | 'announcement'>('discussion');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadMessages(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      // For now, use mock data until database is properly set up
      const mockCommunities = generateDefaultCommunities().map((community, index) => ({
        ...community,
        id: `community-${index + 1}`
      }));
      
      setCommunities(mockCommunities);
      setSelectedCommunity(mockCommunities[0]);
    } catch (error) {
      console.error('Error loading communities:', error);
      // Fallback to mock data
      const mockCommunities = generateDefaultCommunities().map((community, index) => ({
        ...community,
        id: `community-${index + 1}`
      }));
      setCommunities(mockCommunities);
      setSelectedCommunity(mockCommunities[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (communityId: string) => {
    try {
      // For now, use mock data until database is properly set up
      const mockMessages = generateMockMessages(communityId);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(generateMockMessages(communityId));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity || !user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('user_id', user.id)
        .maybeSingle();

      const messageData = {
        id: Date.now().toString(),
        community_id: selectedCommunity.id,
        author_id: user.id,
        author_name: profile?.display_name || 'Anonymous',
        content: newMessage,
        message_type: messageType,
        likes_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        author_role: profile?.role
      };

      // For now, just add to local state
      setMessages(prev => [messageData, ...prev]);
      setNewMessage('');
      
      toast({
        title: "Message posted!",
        description: "Your message has been shared with the community."
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error posting message",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      // For now, just update locally
      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, member_count: c.member_count + 1 }
          : c
      ));

      toast({
        title: "Joined community!",
        description: "You can now participate in discussions."
      });

    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error joining community",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateDefaultCommunities = (): Omit<Community, 'id'>[] => [
    {
      name: "CEO Leadership Circle",
      description: "Strategic discussions for C-suite executives on AI transformation",
      category: "Industry Leaders",
      member_count: 247,
      created_at: new Date().toISOString()
    },
    {
      name: "AI Implementation Success Stories",
      description: "Share experiences and learnings from AI implementations",
      category: "AI Implementation",
      member_count: 189,
      created_at: new Date().toISOString()
    },
    {
      name: "Financial AI Applications",
      description: "CFO-focused discussions on AI in finance and operations",
      category: "Financial Planning",
      member_count: 156,
      created_at: new Date().toISOString()
    },
    {
      name: "Tech Industry Insights",
      description: "Latest trends and developments in technology sector",
      category: "Technology Trends",
      member_count: 312,
      created_at: new Date().toISOString()
    }
  ];

  const generateMockMessages = (communityId: string): CommunityMessage[] => [
    {
      id: '1',
      community_id: communityId,
      author_id: 'user1',
      author_name: 'Sarah Chen',
      author_role: 'CEO',
      author_company: 'TechVision Corp',
      content: 'Just implemented Claude AI for our board report preparation. Reduced prep time by 60% while improving quality. Happy to share our implementation strategy.',
      message_type: 'discussion',
      likes_count: 23,
      replies_count: 8,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      community_id: communityId,
      author_id: 'user2',
      author_name: 'David Martinez',
      author_role: 'CFO',
      author_company: 'Growth Dynamics',
      content: 'Question for the group: What metrics are you using to measure AI ROI? Struggling to quantify the productivity gains across departments.',
      message_type: 'question',
      likes_count: 15,
      replies_count: 12,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      community_id: communityId,
      author_id: 'user3',
      author_name: 'Lisa Park',
      author_role: 'CTO',
      author_company: 'InnovateTech',
      content: 'Sharing our AI governance framework that helped us scale implementation across 500+ employees. Link in comments.',
      message_type: 'announcement',
      likes_count: 41,
      replies_count: 18,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community Hub</h1>
        <p className="text-muted-foreground">
          Connect with fellow executives and share AI implementation insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Communities Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Communities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCommunity?.id === community.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCommunity(community)}
                >
                  <h3 className="font-medium text-sm">{community.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {community.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {community.member_count} members
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Discussion Area */}
        <div className="lg:col-span-2">
          {selectedCommunity && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedCommunity.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCommunity.description}
                    </p>
                  </div>
                  <Button onClick={() => handleJoinCommunity(selectedCommunity.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Message Composer */}
                <div className="border rounded-lg p-4 mb-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Share your insights with the community..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Post Message
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.author_name}`} />
                          <AvatarFallback>{message.author_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-sm">{message.author_name}</h4>
                            {message.author_role && (
                              <Badge variant="outline" className="text-xs">
                                {message.author_role}
                              </Badge>
                            )}
                            <Badge 
                              variant={message.message_type === 'announcement' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {message.message_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(message.created_at)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed mb-3">{message.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Heart className="w-3 h-3 mr-1" />
                              {message.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {message.replies_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}