import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, TrendingUp, Headphones, Wrench, Brain } from 'lucide-react';

export function QuickAccess() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Community Hub",
      description: "Connect with fellow executives and share insights",
      icon: Users,
      path: "/community",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Industry Updates", 
      description: "Latest AI trends and industry developments",
      icon: TrendingUp,
      path: "/industry-updates",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Consulting Services",
      description: "Expert AI implementation consulting",
      icon: Headphones,
      path: "/consulting", 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Productivity Tools",
      description: "Personalized AI tool recommendations",
      icon: Brain,
      path: "/productivity",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Button
                key={feature.path}
                variant="ghost"
                className="h-auto p-4 justify-start"
                onClick={() => navigate(feature.path)}
              >
                <div className={`p-2 rounded-lg ${feature.bgColor} mr-3`}>
                  <IconComponent className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}