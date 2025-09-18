import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedAssessment } from './EnhancedAssessment';
import { PersonalProductivity } from './PersonalProductivity';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EnhancedOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasCompletedProductivity, setHasCompletedProductivity] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAssessmentStatus();
  }, [user]);

  const checkAssessmentStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has completed assessment by checking localStorage
      const assessmentData = localStorage.getItem('assessmentData');
      const productivityData = localStorage.getItem('productivitySetup');
      setHasCompletedAssessment(!!assessmentData);
      setHasCompletedProductivity(!!productivityData);
    } catch (error) {
      console.error('Error checking assessment status:', error);
      setHasCompletedAssessment(false);
      setHasCompletedProductivity(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = () => {
    setHasCompletedAssessment(true);
  };

  const handleProductivityComplete = () => {
    setHasCompletedProductivity(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return <EnhancedAssessment onComplete={handleAssessmentComplete} />;
  }

  if (!hasCompletedProductivity) {
    return <PersonalProductivity onComplete={handleProductivityComplete} />;
  }

  // Onboarding completed - show success screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold">Setup Complete!</h2>
          <p className="text-muted-foreground">
            Welcome to Black Knight AI! Your personalized dashboard is ready.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/productivity')} 
              className="w-full"
            >
              View My AI Tools
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}