import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Target, Users2, Award, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're dedicated to democratizing AI and making it accessible to businesses of all sizes."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your data privacy and security are our top priorities. We maintain the highest standards."
  },
  {
    icon: Users2,
    title: "Community First", 
    description: "We believe in building a supportive community where everyone can learn and grow together."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We're committed to providing only the highest quality AI tools and educational content."
  }
];

const stats = [
  { number: "500+", label: "AI Tools Curated" },
  { number: "24/7", label: "Expert Support" },
  { number: "95%", label: "Implementation Success" },
  { number: "100%", label: "Satisfaction Focused" }
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            About Black Knight AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to empower businesses with AI tools and knowledge, 
            helping leaders navigate the future of work with confidence.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2024, Black Knight AI emerged from a simple observation: 
                while AI technology was advancing rapidly, many business leaders 
                struggled to understand and implement these powerful tools effectively.
              </p>
              <p>
                Our team of AI experts, business strategists, and educators came together 
                to bridge this gap. We created a platform that not only recommends the 
                right AI tools but also provides the education and support needed to 
                use them successfully.
              </p>
              <p>
                Today, we're proud to serve thousands of businesses worldwide, helping 
                them unlock the transformative power of artificial intelligence.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-primary rounded-2xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
              <p className="text-lg opacity-90">
                "To create a world where every business, regardless of size or industry, 
                can harness the power of AI to achieve extraordinary results."
              </p>
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm opacity-80">
                  — The Black Knight AI Team
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-primary rounded-2xl p-12 mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Trusted by Industry Leaders
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Our Community?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover how Black Knight AI can help your business thrive in the age of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              Contact Our Team
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}