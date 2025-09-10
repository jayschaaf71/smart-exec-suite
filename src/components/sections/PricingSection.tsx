import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individual executives getting started with AI",
    icon: Zap,
    badge: null,
    features: [
      "Access to 10 recommended tools",
      "Basic learning content",
      "Personal analytics dashboard",
      "Email support",
      "Tool implementation guides",
      "Progress tracking"
    ],
    cta: "Start Free Trial",
    variant: "outline" as const
  },
  {
    name: "Professional", 
    price: "$79",
    period: "/month",
    description: "Ideal for teams and growing organizations",
    icon: Star,
    badge: "Most Popular",
    features: [
      "Unlimited tool access",
      "Complete learning academy",
      "AI assistant chat support",
      "Team features (up to 5 members)",
      "Advanced analytics & ROI tracking",
      "Priority email support",
      "Custom implementation playbooks",
      "Team collaboration workspace"
    ],
    cta: "Get Started",
    variant: "cta" as const
  },
  {
    name: "Enterprise",
    price: "$149", 
    period: "/month",
    description: "For large organizations with advanced needs",
    icon: Crown,
    badge: "Premium",
    features: [
      "All Professional features",
      "Advanced team collaboration",
      "Custom implementation playbooks",
      "Dedicated success manager",
      "Advanced reporting & analytics",
      "SSO integration",
      "Custom branding options",
      "24/7 priority support"
    ],
    cta: "Contact Sales",
    variant: "executive" as const
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="heading-lg mb-6">
            Choose Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Success Plan
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Start with a free trial and upgrade as your AI adoption grows. 
            All plans include our satisfaction guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-gradient-card border-accent/10 hover:border-accent/20 transition-smooth hover:shadow-premium ${
                plan.badge ? 'ring-2 ring-accent/20 shadow-glow' : ''
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-4 py-1">
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base mb-4">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.variant} 
                  size="lg" 
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-16">
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan? <a href="#contact" className="text-accent hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </section>
  );
}