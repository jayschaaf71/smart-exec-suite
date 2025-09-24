import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Building, Clock, Target, CheckCircle, ArrowRight, Zap } from 'lucide-react';

interface AssessmentTypeSelectorProps {
  onSelectType: (type: 'personal' | 'business' | 'comprehensive') => void;
}

const AssessmentTypeSelector: React.FC<AssessmentTypeSelectorProps> = ({ onSelectType }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your AI Assessment Path</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized AI tool recommendations based on your specific needs. Choose the assessment that best fits your situation.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Personal Assessment Card */}
        <Card className="relative border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">Individual</Badge>
            </div>
            <CardTitle className="text-xl">Personal AI Productivity Assessment</CardTitle>
            <CardDescription className="text-base">
              Optimize your individual productivity with AI tools tailored to your work style and personal goals.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Perfect for:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Professionals looking to improve personal productivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Individuals who want to streamline their daily workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">People seeking tools for content creation and communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Anyone wanting to reduce time on repetitive tasks</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">What you'll get:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Personalized tool recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Step-by-step implementation guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Time-saving calculations and ROI projections</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Workflow integration recommendations</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Takes 10-15 minutes to complete</span>
            </div>

            <Button 
              onClick={() => onSelectType('personal')} 
              className="w-full group-hover:bg-primary/90 transition-colors"
              size="lg"
            >
              Start Personal Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Business Assessment Card */}
        <Card className="relative border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">Enterprise</Badge>
            </div>
            <CardTitle className="text-xl">Business AI Transformation Assessment</CardTitle>
            <CardDescription className="text-base">
              Strategic assessment for organizations implementing AI across business processes and teams.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Perfect for:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Business leaders planning AI transformation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Companies looking to automate business processes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Organizations wanting strategic AI implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Teams needing enterprise-grade AI solutions</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">What you'll get:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Strategic implementation roadmap</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Pilot project suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Team training requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Budget and resource planning</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Takes 15-20 minutes to complete</span>
            </div>

            <Button 
              onClick={() => onSelectType('business')} 
              className="w-full group-hover:bg-primary/90 transition-colors"
              size="lg"
            >
              Start Business Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Comprehensive Automation Assessment Card */}
        <Card className="relative border-2 hover:border-primary/50 transition-colors cursor-pointer group lg:col-span-3 md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">Premium</Badge>
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Comprehensive AI Automation Assessment</CardTitle>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">New</Badge>
            </div>
            <CardDescription className="text-base">
              The most thorough assessment available - get a complete automation strategy tailored specifically to your business context, industry, and goals.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Perfect for:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Companies serious about digital transformation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Organizations with complex operational needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Businesses requiring industry-specific solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Leaders needing comprehensive automation roadmaps</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">What you'll get:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Business-specific automation strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Prioritized implementation roadmap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">ROI projections and budget allocation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Risk assessment & change management plan</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Takes 25-30 minutes to complete • Most comprehensive analysis available</span>
            </div>

            <Button 
              onClick={() => onSelectType('comprehensive')} 
              className="w-full group-hover:bg-primary/90 transition-colors bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              Start Comprehensive Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Not sure which assessment to choose? You can always take both assessments to get comprehensive recommendations.
        </p>
      </div>
    </div>
  );
};

export default AssessmentTypeSelector;