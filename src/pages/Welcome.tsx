import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome to Black Knight AI! 🎉
          </h1>
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            You're successfully signed in. Let's get you set up with personalized AI tool recommendations.
          </p>
        </div>

        {/* Next Steps Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Zap className="w-6 h-6 text-primary" />
              Ready to Transform Your Workflow?
            </CardTitle>
            <CardDescription className="text-lg">
              Take our quick 2-minute assessment to get personalized AI tool recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">2</div>
                <div className="text-sm text-slate-600">Minutes to complete</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">10+</div>
                <div className="text-sm text-slate-600">Personalized tools</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">$1000+</div>
                <div className="text-sm text-slate-600">Potential monthly savings</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">What you'll get:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Personalized AI tool recommendations for your role</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Step-by-step implementation guides</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">ROI calculations and time-saving estimates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Access to learning academy and expert insights</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate('/assessment')}
                className="flex-1 h-12 text-lg"
                size="lg"
              >
                Start My Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex-1 h-12"
                size="lg"
              >
                Skip to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-slate-500 space-y-2">
          <p>🔒 Your data is secure and never shared with third parties</p>
          <p>⚡ Most users save 5+ hours per week with our recommendations</p>
        </div>
      </div>
    </div>
  );
}