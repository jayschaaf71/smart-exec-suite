import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Newspaper, Clock, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  url?: string;
  created_at: string;
}

export function DailyAINews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailyNews = async () => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('daily-ai-news', {
        body: { 
          userId: user.id,
          forceRefresh: refreshing 
        }
      });

      if (response.error) {
        throw response.error;
      }

      setNews(response.data?.news || []);
    } catch (error: any) {
      console.error('Error fetching daily news:', error);
      toast({
        title: "Failed to load news",
        description: "Unable to fetch today's AI news updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyNews();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDailyNews();
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return <TrendingUp className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <Newspaper className="h-3 w-3" />;
      default: return <Newspaper className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">Today's AI News</CardTitle>
            <CardDescription>
              Personalized updates for CFOs and executives
            </CardDescription>
          </div>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">Today's AI News</CardTitle>
          <CardDescription>
            Personalized updates for CFOs and executives
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No news updates available today.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
              Check for updates
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={item.id}>
                 <div className="space-y-2 p-3 rounded-lg border border-transparent hover:border-accent-foreground/20 hover:bg-accent/50 transition-all cursor-pointer" 
                      onClick={() => item.url && window.open(item.url, '_blank')}>
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="font-medium text-sm leading-tight flex-1 hover:text-primary transition-colors">{item.title}</h3>
                     <div className="flex items-center gap-1 flex-shrink-0">
                       <Badge variant={getImportanceColor(item.importance)} className="text-xs">
                         {getImportanceIcon(item.importance)}
                         <span className="ml-1">{item.importance}</span>
                       </Badge>
                     </div>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                   <div className="flex items-center justify-between">
                     <Badge variant="outline" className="text-xs">
                       {item.category}
                     </Badge>
                     {item.url && (
                       <div className="flex items-center text-xs text-muted-foreground">
                         <ExternalLink className="h-3 w-3 mr-1" />
                         Click to read more
                       </div>
                     )}
                   </div>
                 </div>
                {index < news.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}