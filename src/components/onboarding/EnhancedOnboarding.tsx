import { useState, useEffect } from 'react';
import { EnhancedAssessment } from './EnhancedAssessment';
import { PersonalProductivity } from './PersonalProductivity';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function EnhancedOnboarding() {
  const { user } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
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
      setHasCompletedAssessment(!!assessmentData);
    } catch (error) {
      console.error('Error checking assessment status:', error);
      setHasCompletedAssessment(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return <EnhancedAssessment />;
  }

  return <PersonalProductivity />;
}