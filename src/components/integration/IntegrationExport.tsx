import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  FileText, 
  Calendar, 
  BarChart3, 
  Share, 
  Zap,
  Slack,
  Mail,
  Webhook,
  ExternalLink,
  Copy
} from 'lucide-react';

export function IntegrationExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [zapierWebhook, setZapierWebhook] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const exportProgressReport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch user data for export
      const [profileData, statsData, achievementsData, progressData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
        supabase.from('user_implementation_progress').select('*, implementation_guides(title)').eq('user_id', user.id)
      ]);

      const reportData = {
        profile: profileData.data,
        stats: statsData.data,
        achievements: achievementsData.data,
        progress: progressData.data,
        exportDate: new Date().toISOString(),
        summary: {
          totalPoints: statsData.data?.total_points || 0,
          level: statsData.data?.level_title || 'AI Novice',
          guidesCompleted: statsData.data?.guides_completed || 0,
          toolsImplemented: statsData.data?.tools_implemented || 0,
          achievementsEarned: statsData.data?.achievements_earned || 0
        }
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart-exec-progress-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your progress report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCertificate = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create a simple certificate (in a real app, you'd use a proper PDF library)
      const certificateData = {
        recipient: profile?.display_name || 'Professional',
        level: stats?.level_title || 'AI Novice',
        points: stats?.total_points || 0,
        completedGuides: stats?.guides_completed || 0,
        issueDate: new Date().toLocaleDateString(),
        certificateId: `CERT-${user.id.slice(0, 8).toUpperCase()}-${Date.now()}`
      };

      const certificateText = `
SMART EXECUTIVE SUITE CERTIFICATE

This certifies that
${certificateData.recipient}

Has successfully achieved the level of
${certificateData.level}

With ${certificateData.points} points earned
And ${certificateData.completedGuides} implementation guides completed

Certificate ID: ${certificateData.certificateId}
Issued on: ${certificateData.issueDate}

Smart Executive Suite - AI Productivity Platform
      `;

      const blob = new Blob([certificateText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart-exec-certificate-${certificateData.certificateId}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Certificate Generated",
        description: "Your achievement certificate has been downloaded.",
      });
    } catch (error) {
      console.error('Certificate error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your certificate.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const triggerZapierWebhook = async () => {
    if (!zapierWebhook) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      await fetch(zapierWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          level: stats?.level_title,
          points: stats?.total_points,
          guides_completed: stats?.guides_completed,
          tools_implemented: stats?.tools_implemented,
          triggered_from: "Smart Executive Suite"
        }),
      });

      toast({
        title: "Zapier Triggered",
        description: "Your progress data has been sent to Zapier. Check your Zap history to confirm.",
      });
    } catch (error) {
      console.error('Zapier error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to trigger Zapier webhook. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const shareProgress = async () => {
    if (!user) return;

    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const shareText = `🚀 My AI productivity journey with Smart Executive Suite:

Level: ${stats?.level_title || 'AI Novice'}
Points: ${stats?.total_points || 0}
Guides Completed: ${stats?.guides_completed || 0}
Tools Implemented: ${stats?.tools_implemented || 0}

Transform your business with AI! #SmartExecutiveSuite #AIProductivity`;

      if (navigator.share) {
        await navigator.share({
          title: 'My AI Productivity Progress',
          text: shareText,
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Your progress summary has been copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download your progress, achievements, and learning data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={exportProgressReport}
              disabled={isExporting}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3 text-left">
                <FileText className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Progress Report</div>
                  <div className="text-sm text-muted-foreground">
                    Complete JSON export of your data
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={exportCertificate}
              disabled={isExporting}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3 text-left">
                <Calendar className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Achievement Certificate</div>
                  <div className="text-sm text-muted-foreground">
                    Official certificate of your progress
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Your Progress
          </CardTitle>
          <CardDescription>
            Share your AI productivity achievements with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={shareProgress} className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Share Progress Summary
          </Button>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>
            Connect your progress with external tools and workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zapier Integration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="zapier-webhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={zapierWebhook}
                onChange={(e) => setZapierWebhook(e.target.value)}
              />
              <Button 
                onClick={triggerZapierWebhook}
                disabled={isConnecting || !zapierWebhook}
              >
                <Zap className="h-4 w-4 mr-2" />
                Trigger
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a Zapier webhook trigger to automate actions based on your progress
            </p>
          </div>

          <Separator />

          {/* Integration Instructions */}
          <div className="space-y-4">
            <h4 className="font-medium">Available Integrations</h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Slack className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Slack</div>
                    <div className="text-sm text-muted-foreground">
                      Send progress updates to Slack channels
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Email Reports</div>
                    <div className="text-sm text-muted-foreground">
                      Automated weekly progress emails
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Analytics Export</div>
                    <div className="text-sm text-muted-foreground">
                      Export to Google Sheets or Excel
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}