import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Users, Clock, Star } from "lucide-react";

const courses = [
  {
    title: "AI Fundamentals for Executives",
    description: "Understanding AI basics, terminology, and strategic implications for business leaders.",
    duration: "2 hours",
    level: "Beginner",
    rating: 4.8,
    lessons: 12,
    icon: BookOpen
  },
  {
    title: "Implementing AI in Your Organization",
    description: "Practical steps to introduce AI tools and processes in your company.",
    duration: "3 hours", 
    level: "Intermediate",
    rating: 4.9,
    lessons: 15,
    icon: Users
  },
  {
    title: "AI Tools Masterclass",
    description: "Deep dive into the most effective AI tools for productivity and automation.",
    duration: "4 hours",
    level: "Advanced", 
    rating: 4.7,
    lessons: 20,
    icon: Video
  },
  {
    title: "AI Strategy & ROI Measurement",
    description: "How to develop AI strategy and measure return on investment.",
    duration: "2.5 hours",
    level: "Intermediate",
    rating: 4.8,
    lessons: 10,
    icon: FileText
  }
];

export function AcademySection() {
  return (
    <section id="academy" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI Academy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master AI tools and strategies with our comprehensive learning platform. 
            From basics to advanced implementation, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {courses.map((course, index) => {
            const IconComponent = course.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {course.lessons} lessons
                    </span>
                    <Button variant="outline" size="sm">
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business with AI?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of executives who have already started their AI journey.
          </p>
          <Button variant="hero" size="lg">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}