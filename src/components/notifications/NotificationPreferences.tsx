import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { NotificationManager, type NotificationPreferences } from '@/utils/notifications';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({
    email_notifications: true,
    push_notifications: true,
    notification_types: {
      achievements: true,
      recommendations: true,
      reminders: true,
      progress: true,
      system: true,
    },
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await NotificationManager.getUserPreferences(user.id);
      if (data) {
        setPreferences({
          ...data,
          notification_types: data.notification_types as any,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const result = await NotificationManager.updatePreferences(user.id, preferences);
      if (result) {
        toast({
          title: "Preferences saved",
          description: "Your notification preferences have been updated.",
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationType = (type: keyof typeof preferences.notification_types, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: enabled,
      },
    }));
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in the app
                </p>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, push_notifications: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Types</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🏆 Achievements</Label>
                  <p className="text-sm text-muted-foreground">
                    When you unlock new achievements
                  </p>
                </div>
                <Switch
                  checked={preferences.notification_types?.achievements}
                  onCheckedChange={(checked) => updateNotificationType('achievements', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🎯 Recommendations</Label>
                  <p className="text-sm text-muted-foreground">
                    New tool recommendations and updates
                  </p>
                </div>
                <Switch
                  checked={preferences.notification_types?.recommendations}
                  onCheckedChange={(checked) => updateNotificationType('recommendations', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🚀 Progress Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Implementation and learning progress
                  </p>
                </div>
                <Switch
                  checked={preferences.notification_types?.progress}
                  onCheckedChange={(checked) => updateNotificationType('progress', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">⏰ Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Scheduled reminders and deadlines
                  </p>
                </div>
                <Switch
                  checked={preferences.notification_types?.reminders}
                  onCheckedChange={(checked) => updateNotificationType('reminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🔔 System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Platform updates and announcements
                  </p>
                </div>
                <Switch
                  checked={preferences.notification_types?.system}
                  onCheckedChange={(checked) => updateNotificationType('system', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiet Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      quiet_hours_start: e.target.value 
                    }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      quiet_hours_end: e.target.value 
                    }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}