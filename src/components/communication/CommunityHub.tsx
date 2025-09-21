import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, TrendingUp, Send, Plus, Heart, Share2, Search } from 'lucide-react';
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
  is_member?: boolean;
}

interface CommunityMessage {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  message_type: 'discussion' | 'question' | 'announcement';
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles?: {
    display_name: string | null;
    role: string | null;
  } | null;
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCommunities();
  }, [user]);

  useEffect(() => {
    if (selectedCommunity) {
      loadMessages(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      // Load communities from database
      const { data: communitiesData, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false });

      if (error) throw error;

      // Check membership status for authenticated users
      let communitiesWithMembership = communitiesData || [];
      
      if (user) {
        const { data: memberships } = await supabase
          .from('community_memberships')
          .select('community_id')
          .eq('user_id', user.id);

        const memberCommunityIds = new Set(memberships?.map(m => m.community_id) || []);
        
        communitiesWithMembership = communitiesData.map(community => ({
          ...community,
          is_member: memberCommunityIds.has(community.id)
        }));
      }

      setCommunities(communitiesWithMembership);
      if (communitiesWithMembership.length > 0) {
        setSelectedCommunity(communitiesWithMembership[0]);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error loading communities",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (communityId: string) => {
    try {
      // Get messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select('*')
        .eq('community_id', communityId)
        .is('parent_message_id', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get author profiles separately
      const authorIds = [...new Set(messagesData.map(msg => msg.author_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, role')
        .in('user_id', authorIds);

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      // Combine data with proper typing
      const typedMessagesData: CommunityMessage[] = messagesData.map(msg => ({
        id: msg.id,
        community_id: msg.community_id,
        author_id: msg.author_id,
        content: msg.content,
        message_type: msg.message_type as 'discussion' | 'question' | 'announcement',
        likes_count: msg.likes_count || 0,
        replies_count: msg.replies_count || 0,
        created_at: msg.created_at,
        profiles: profilesMap.get(msg.author_id) || null
      }));
      
      setMessages(typedMessagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity || !user) return;

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          community_id: selectedCommunity.id,
          author_id: user.id,
          content: newMessage,
          message_type: messageType
        })
        .select('*')
        .single();

      if (error) throw error;

      // Get user profile for the new message
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('user_id', user.id)
        .single();

      // Create typed message with profile data
      const typedData: CommunityMessage = {
        id: data.id,
        community_id: data.community_id,
        author_id: data.author_id,
        content: data.content,
        message_type: data.message_type as 'discussion' | 'question' | 'announcement',
        likes_count: data.likes_count || 0,
        replies_count: data.replies_count || 0,
        created_at: data.created_at,
        profiles: profileData || null
      };

      // Add to local state for immediate UI update
      setMessages(prev => [typedData, ...prev]);
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join communities.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('community_id', communityId)
        .maybeSingle();

      if (existingMembership) {
        toast({
          title: "Already a member",
          description: "You're already part of this community.",
        });
        return;
      }

      // Add membership
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: user.id,
          community_id: communityId,
          role: 'member'
        });

      if (error) throw error;

      // Update local state
      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, member_count: c.member_count + 1, is_member: true }
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

  const handleLikeMessage = async (messageId: string) => {
    if (!user) return;

    try {
      // Simple increment approach
      const { error } = await supabase
        .from('community_messages')
        .update({ likes_count: 1 })
        .eq('id', messageId);

      if (error) {
        console.error('Like failed:', error);
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, likes_count: msg.likes_count + 1 }
          : msg
      ));
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {filteredCommunities.map((community) => (
                <div
                  key={community.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCommunity?.id === community.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCommunity(community)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{community.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    </div>
                    {community.is_member && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        Member
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
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
                  <Button 
                    onClick={() => handleJoinCommunity(selectedCommunity.id)}
                    disabled={selectedCommunity.is_member}
                    variant={selectedCommunity.is_member ? "secondary" : "default"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedCommunity.is_member ? 'Joined' : 'Join'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Message Composer */}
                {user && selectedCommunity.is_member && (
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
                )}

                {/* Messages */}
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.profiles?.display_name}`} />
                          <AvatarFallback>
                            {message.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-sm">{message.profiles?.display_name || 'Anonymous'}</h4>
                            {message.profiles?.role && (
                              <Badge variant="outline" className="text-xs">
                                {message.profiles.role}
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleLikeMessage(message.id)}
                            >
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
                  
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}