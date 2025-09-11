import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Shield, 
  BarChart3, 
  Zap, 
  Globe, 
  Crown,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

interface EnterpriseFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'available' | 'coming-soon' | 'beta';
}

export function EnterpriseFeatures() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');

  const enterpriseFeatures: EnterpriseFeature[] = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Multi-Tenant Architecture",
      description: "Isolated environments for different business units with centralized management",
      status: 'available'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Advanced Security & Compliance",
      description: "SOC 2, GDPR compliance, SSO integration, and enterprise-grade security",
      status: 'available'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Management & Roles",
      description: "Granular role-based access control and team hierarchy management",
      status: 'available'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics & Reporting",
      description: "Custom dashboards, ROI tracking, and comprehensive usage analytics",
      status: 'available'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "API & Integrations",
      description: "REST API, webhooks, and pre-built integrations with enterprise tools",
      status: 'beta'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "White-Label Solution",
      description: "Customize branding, domain, and user interface to match your organization",
      status: 'coming-soon'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per user/month',
      description: 'Perfect for small teams getting started with AI adoption',
      features: [
        'Up to 10 users',
        'Basic analytics',
        'Email support',
        'Standard integrations',
        'Basic security features'
      ],
      limitations: [
        'Limited customization',
        'Standard support only'
      ]
    },
    {
      name: 'Professional',
      price: '$99',
      period: 'per user/month',
      description: 'Advanced features for growing organizations',
      features: [
        'Up to 100 users',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Enhanced security',
        'Team management',
        'Custom workflows'
      ],
      limitations: [
        'Limited white-labeling'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'Full-featured solution for large organizations',
      features: [
        'Unlimited users',
        'Complete analytics suite',
        'Dedicated support',
        'All integrations',
        'Enterprise security',
        'Multi-tenant support',
        'White-label solution',
        'Custom development',
        'SLA guarantees'
      ],
      limitations: []
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="text-green-600 bg-green-100">Available</Badge>;
      case 'beta':
        return <Badge variant="secondary" className="text-blue-600 bg-blue-100">Beta</Badge>;
      case 'coming-soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Enterprise Solutions</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Scale AI adoption across your organization with enterprise-grade features, 
          security, and support designed for large teams and complex requirements.
        </p>
      </div>

      <Tabs defaultValue="features" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Enterprise Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>ROI Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">40%</div>
                  <div className="text-sm text-muted-foreground">Faster AI Implementation</div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">60%</div>
                  <div className="text-sm text-muted-foreground">Reduced Training Time</div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">3x</div>
                  <div className="text-sm text-muted-foreground">ROI Within 12 Months</div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Included Features:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume Discounts Available</CardTitle>
              <CardDescription>
                Get additional savings for larger organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-sm text-muted-foreground">users</div>
                  <div className="text-lg font-semibold text-green-600">10% off</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">users</div>
                  <div className="text-lg font-semibold text-green-600">20% off</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-muted-foreground">users</div>
                  <div className="text-lg font-semibold text-green-600">30% off</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
              <CardDescription>
                Typical enterprise deployment timeline and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Discovery & Planning (1-2 weeks)</h4>
                    <p className="text-muted-foreground">Requirements gathering, technical architecture review, and customization planning</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Environment Setup (1 week)</h4>
                    <p className="text-muted-foreground">Infrastructure deployment, security configuration, and integration setup</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Pilot Deployment (2-3 weeks)</h4>
                    <p className="text-muted-foreground">Limited rollout to pilot group, testing, and feedback incorporation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Full Rollout (2-4 weeks)</h4>
                    <p className="text-muted-foreground">Organization-wide deployment, training, and change management</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Optimization & Support (Ongoing)</h4>
                    <p className="text-muted-foreground">Performance monitoring, optimization, and continuous support</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dedicated Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Dedicated Customer Success Manager</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 Technical Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Implementation Assistance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Training & Onboarding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Regular Health Checks</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>SSO/SAML Integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Data Encryption at Rest & Transit</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Regular Security Audits</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Organization?</h3>
          <p className="text-lg mb-6 opacity-90">
            Schedule a demo to see how our enterprise platform can accelerate your AI adoption journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Schedule Demo
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}