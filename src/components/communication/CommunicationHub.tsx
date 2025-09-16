import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Phone, 
  Mail, 
  Bell,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    company: string;
  };
  title: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  timestamp: Date;
}

export function CommunicationHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [newMessage, setNewMessage] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  // Mock data - in production, this would come from the backend
  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: {
        name: 'Sarah Johnson',
        avatar: '',
        role: 'CFO'
      },
      content: 'Has anyone implemented automated financial reporting with AI? Looking for recommendations.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false
    },
    {
      id: '2',
      sender: {
        name: 'Mike Chen',
        avatar: '',
        role: 'VP Finance'
      },
      content: 'The new expense tracking AI tool saved us 15 hours per week. Happy to share details.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true
    }
  ]);

  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: {
        name: 'Alex Rivera',
        avatar: '',
        role: 'CFO',
        company: 'TechCorp'
      },
      title: 'AI Implementation ROI: 6-Month Case Study',
      content: 'After 6 months of implementing various AI tools across our finance department, here are the key metrics and lessons learned...',
      category: 'Case Study',
      likes: 24,
      replies: 8,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '2',
      author: {
        name: 'Lisa Park',
        avatar: '',
        role: 'Finance Director',
        company: 'StartupXYZ'
      },
      title: 'Best AI Tools for Budget Forecasting?',
      content: 'Our team is looking to automate our quarterly budget forecasting process. What tools have worked well for other finance teams?',
      category: 'Question',
      likes: 12,
      replies: 15,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the community.",
      });
      setNewMessage('');
    }
  };

  const handleCreatePost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      toast({
        title: "Post created",
        description: "Your post has been shared with the community.",
      });
      setNewPost({ title: '', content: '', category: 'general' });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Communication Hub</h2>
        <p className="text-muted-foreground">
          Connect with other CFOs and finance professionals in your AI transformation journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Direct Messages
              </CardTitle>
              <CardDescription>
                Private conversations with other professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 p-3 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.sender.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Forum
              </CardTitle>
              <CardDescription>
                Share experiences and learn from other finance leaders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Textarea
                  placeholder="Share your thoughts, questions, or experiences..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="general">General</option>
                    <option value="question">Question</option>
                    <option value="case-study">Case Study</option>
                    <option value="recommendation">Recommendation</option>
                  </select>
                  <Button onClick={handleCreatePost}>
                    Share Post
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{post.author.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.author.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            @ {post.author.company}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.timestamp)}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <span>{post.likes} likes</span>
                          <span>{post.replies} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Manage how you receive updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get critical updates via text</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Setup
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">In-App Notifications</h4>
                    <p className="text-sm text-muted-foreground">Real-time notifications in the dashboard</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}