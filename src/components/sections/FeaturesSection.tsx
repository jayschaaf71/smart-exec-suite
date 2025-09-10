import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  BookOpen, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  CheckCircle 
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Personalized Assessment",
    description: "Get tailored AI tool recommendations based on your role, industry, and business goals.",
    benefits: ["Role-specific suggestions", "Industry expertise", "Goal-oriented matching"]
  },
  {
    icon: Sparkles,
    title: "Curated AI Marketplace",
    description: "Access 200+ vetted AI tools with detailed reviews, pricing, and implementation guides.",
    benefits: ["Expert curation", "Implementation guides", "Real user reviews"]
  },
  {
    icon: BookOpen,
    title: "Learning Academy",
    description: "Master AI adoption with courses, tutorials, and certification programs designed for executives.",
    benefits: ["Executive-focused content", "Practical exercises", "Completion certificates"]
  },
  {
    icon: MessageSquare,
    title: "AI Assistant Chat",
    description: "Get instant answers and guidance from our context-aware AI assistant available 24/7.",
    benefits: ["Instant support", "Context-aware responses", "Implementation help"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Coordinate AI adoption across your organization with shared workspaces and progress tracking.",
    benefits: ["Shared workspaces", "Team progress tracking", "Collaborative planning"]
  },
  {
    icon: BarChart3,
    title: "Success Analytics",
    description: "Track productivity improvements, ROI, and team adoption rates with detailed analytics.",
    benefits: ["ROI calculations", "Productivity metrics", "Adoption tracking"]
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="heading-lg mb-6">
            Everything You Need for AI{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Success
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From discovery to implementation, we provide the complete toolkit for transforming 
            your business with AI productivity solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-accent/10 hover:border-accent/20 transition-smooth hover:shadow-premium group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-16">
          <Button variant="cta" size="xl">
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}