import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Clock, Users, Zap } from 'lucide-react';
import { ImplementationGuideViewer } from '@/components/implementation/ImplementationGuideViewer';

interface ImplementationGuidesProps {
  toolId?: string;
  toolName?: string;
}

export function ImplementationGuides({ toolId, toolName }: ImplementationGuidesProps) {
  const [selectedGuideToolId, setSelectedGuideToolId] = useState<string | null>(null);

  const handleOpenGuide = (id: string) => {
    setSelectedGuideToolId(id);
  };

  const handleCloseGuide = () => {
    setSelectedGuideToolId(null);
  };

  // If a guide is selected, show the viewer
  if (selectedGuideToolId) {
    return (
      <ImplementationGuideViewer 
        toolId={selectedGuideToolId} 
        onClose={handleCloseGuide}
      />
    );
  }

  // If a specific tool is provided, open its guide directly
  if (toolId) {
    return (
      <ImplementationGuideViewer 
        toolId={toolId} 
        onClose={handleCloseGuide}
      />
    );
  }

  // Default state - show available guides
  const featuredGuides = [
    {
      id: '1',
      toolId: 'perplexity-pro',
      toolName: 'Perplexity Pro',
      title: 'Market Research Mastery',
      description: 'Set up Perplexity Pro for daily market intelligence and competitive analysis.',
      estimatedTime: '15-20 minutes',
      difficulty: 'Beginner',
      forRoles: ['CEO', 'CMO', 'Director'],
      benefits: ['Save 2+ hours weekly on research', 'Get real-time market insights', 'Track competitors automatically']
    },
    {
      id: '2', 
      toolId: 'github-copilot',
      toolName: 'GitHub Copilot',
      title: 'AI-Powered Development Setup',
      description: 'Complete setup for GitHub Copilot to accelerate your development workflow.',
      estimatedTime: '30-45 minutes',
      difficulty: 'Intermediate',
      forRoles: ['CTO', 'Developer'],
      benefits: ['30% faster coding', 'Reduce bugs and errors', 'Learn new coding patterns']
    },
    {
      id: '3',
      toolId: 'otter-ai',
      toolName: 'Otter.ai',
      title: 'Meeting Automation',
      description: 'Automate meeting transcription and never miss important details again.',
      estimatedTime: '20-30 minutes', 
      difficulty: 'Beginner',
      forRoles: ['CEO', 'COO', 'Manager'],
      benefits: ['Never take notes again', 'Share meeting summaries instantly', 'Extract action items automatically']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Step-by-Step Implementation Guides
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Follow our detailed guides to successfully implement AI tools in your workflow. 
          Each guide includes step-by-step instructions, time estimates, and success metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredGuides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {guide.toolName}
                </Badge>
                <Badge className={getDifficultyColor(guide.difficulty)}>
                  {guide.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {guide.title}
              </CardTitle>
              <CardDescription className="text-base">
                {guide.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Guide Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {guide.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {guide.forRoles.length} roles
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Key Benefits:</h4>
                <ul className="space-y-1">
                  {guide.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Roles */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Perfect for:</h4>
                <div className="flex flex-wrap gap-1">
                  {guide.forRoles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full mt-4"
                onClick={() => handleOpenGuide(guide.toolId)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">More Guides Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We're constantly adding new implementation guides for popular AI tools. 
            Have a specific tool you'd like a guide for?
          </p>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Request a Guide
          </Button>
        </CardContent>
      </Card>

      {/* Implementation Success Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Implementation Success Rate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">94%</div>
            <div className="text-sm text-gray-600">Complete their first guide</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">87%</div>
            <div className="text-sm text-gray-600">See immediate productivity gains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">78%</div>
            <div className="text-sm text-gray-600">Implement 3+ tools within first month</div>
          </div>
        </div>
      </div>
    </div>
  );
}