import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CFOAssessmentData {
  companyProfile: {
    industry: string;
    revenue: string;
    employees: string;
    publicPrivate: string;
  };
  currentStack: {
    erp: string;
    bi: string;
    spreadsheets: string;
    automationLevel: string;
  };
  painPoints: {
    reportingTime: string;
    boardPrepTime: string;
    manualProcesses: string[];
    biggestFrustration: string;
  };
  goals: {
    timeSavings: string;
    accuracy: boolean;
    teamProductivity: boolean;
    strategicFocus: boolean;
    complianceImprovement: boolean;
  };
}

interface CFOAssessmentProps {
  onComplete: (data: CFOAssessmentData) => void;
}

export function CFOAssessment({ onComplete }: CFOAssessmentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [assessment, setAssessment] = useState<CFOAssessmentData>({
    companyProfile: {
      industry: '',
      revenue: '',
      employees: '',
      publicPrivate: ''
    },
    currentStack: {
      erp: '',
      bi: '',
      spreadsheets: '',
      automationLevel: ''
    },
    painPoints: {
      reportingTime: '',
      boardPrepTime: '',
      manualProcesses: [],
      biggestFrustration: ''
    },
    goals: {
      timeSavings: '',
      accuracy: false,
      teamProductivity: false,
      strategicFocus: false,
      complianceImprovement: false
    }
  });

  const updateAssessment = (section: keyof CFOAssessmentData, updates: any) => {
    setAssessment(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleManualProcessToggle = (process: string) => {
    const current = assessment.painPoints.manualProcesses;
    const updated = current.includes(process) 
      ? current.filter(p => p !== process)
      : [...current, process];
    
    updateAssessment('painPoints', { manualProcesses: updated });
  };

  const calculateScore = () => {
    let score = 0;
    
    // Higher scores for larger companies (more potential impact)
    if (assessment.companyProfile.revenue === '$100M-$1B') score += 30;
    else if (assessment.companyProfile.revenue === '$1B+') score += 40;
    else if (assessment.companyProfile.revenue === '$10M-$100M') score += 20;
    
    // Higher scores for more pain points
    score += assessment.painPoints.manualProcesses.length * 5;
    
    // Higher scores for more ambitious goals
    const goalCount = Object.values(assessment.goals).filter(Boolean).length;
    score += goalCount * 10;
    
    // Higher scores for lower automation
    if (assessment.currentStack.automationLevel === 'low') score += 25;
    else if (assessment.currentStack.automationLevel === 'medium') score += 15;
    
    return Math.min(score, 100);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      
      const { error } = await supabase
        .from('cfo_assessments')
        .insert({
          user_id: user.id,
          company_profile: assessment.companyProfile,
          current_stack: assessment.currentStack,
          pain_points: assessment.painPoints,
          goals: assessment.goals,
          assessment_score: score
        });

      if (error) throw error;

      toast({
        title: "Assessment Complete!",
        description: `Your CFO AI Readiness Score: ${score}/100`,
      });

      onComplete(assessment);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Industry Vertical</Label>
              <RadioGroup 
                value={assessment.companyProfile.industry} 
                onValueChange={(value) => updateAssessment('companyProfile', { industry: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manufacturing" id="manufacturing" />
                  <Label htmlFor="manufacturing">Manufacturing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="healthcare" id="healthcare" />
                  <Label htmlFor="healthcare">Healthcare</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="financial" id="financial" />
                  <Label htmlFor="financial">Financial Services</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retail" id="retail" />
                  <Label htmlFor="retail">Retail/E-commerce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="financial_services" id="financial_services" />
                  <Label htmlFor="financial_services">Financial Services</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Annual Revenue</Label>
              <RadioGroup 
                value={assessment.companyProfile.revenue} 
                onValueChange={(value) => updateAssessment('companyProfile', { revenue: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="<$10M" id="revenue_10m" />
                  <Label htmlFor="revenue_10m">Less than $10M</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$10M-$100M" id="revenue_100m" />
                  <Label htmlFor="revenue_100m">$10M - $100M</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$100M-$1B" id="revenue_1b" />
                  <Label htmlFor="revenue_1b">$100M - $1B</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="$1B+" id="revenue_1b_plus" />
                  <Label htmlFor="revenue_1b_plus">$1B+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Number of Employees</Label>
              <RadioGroup 
                value={assessment.companyProfile.employees} 
                onValueChange={(value) => updateAssessment('companyProfile', { employees: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="<100" id="emp_100" />
                  <Label htmlFor="emp_100">Less than 100</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100-1000" id="emp_1000" />
                  <Label htmlFor="emp_1000">100 - 1,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1000-10000" id="emp_10000" />
                  <Label htmlFor="emp_10000">1,000 - 10,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10000+" id="emp_10000_plus" />
                  <Label htmlFor="emp_10000_plus">10,000+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Company Type</Label>
              <RadioGroup 
                value={assessment.companyProfile.publicPrivate} 
                onValueChange={(value) => updateAssessment('companyProfile', { publicPrivate: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public Company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private Company</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Primary ERP System</Label>
              <RadioGroup 
                value={assessment.currentStack.erp} 
                onValueChange={(value) => updateAssessment('currentStack', { erp: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SAP" id="sap" />
                  <Label htmlFor="sap">SAP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oracle" id="oracle" />
                  <Label htmlFor="oracle">Oracle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NetSuite" id="netsuite" />
                  <Label htmlFor="netsuite">NetSuite</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="QuickBooks" id="quickbooks" />
                  <Label htmlFor="quickbooks">QuickBooks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="erp_other" />
                  <Label htmlFor="erp_other">Other/Custom</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Business Intelligence Tool</Label>
              <RadioGroup 
                value={assessment.currentStack.bi} 
                onValueChange={(value) => updateAssessment('currentStack', { bi: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Power BI" id="powerbi" />
                  <Label htmlFor="powerbi">Power BI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tableau" id="tableau" />
                  <Label htmlFor="tableau">Tableau</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Qlik" id="qlik" />
                  <Label htmlFor="qlik">Qlik Sense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Looker" id="looker" />
                  <Label htmlFor="looker">Looker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="None" id="bi_none" />
                  <Label htmlFor="bi_none">None - Use Excel/Spreadsheets</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Primary Spreadsheet Tool</Label>
              <RadioGroup 
                value={assessment.currentStack.spreadsheets} 
                onValueChange={(value) => updateAssessment('currentStack', { spreadsheets: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Excel" id="excel" />
                  <Label htmlFor="excel">Microsoft Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Google Sheets" id="sheets" />
                  <Label htmlFor="sheets">Google Sheets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both_sheets" />
                  <Label htmlFor="both_sheets">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Current Automation Level</Label>
              <RadioGroup 
                value={assessment.currentStack.automationLevel} 
                onValueChange={(value) => updateAssessment('currentStack', { automationLevel: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="auto_low" />
                  <Label htmlFor="auto_low">Low - Mostly manual processes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="auto_medium" />
                  <Label htmlFor="auto_medium">Medium - Some automated reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="auto_high" />
                  <Label htmlFor="auto_high">High - Highly automated</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Weekly Time Spent on Financial Reporting</Label>
              <RadioGroup 
                value={assessment.painPoints.reportingTime} 
                onValueChange={(value) => updateAssessment('painPoints', { reportingTime: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="<5 hours" id="report_5" />
                  <Label htmlFor="report_5">Less than 5 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5-10 hours" id="report_10" />
                  <Label htmlFor="report_10">5-10 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-20 hours" id="report_20" />
                  <Label htmlFor="report_20">10-20 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="20+ hours" id="report_20_plus" />
                  <Label htmlFor="report_20_plus">20+ hours</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Monthly Board Preparation Time</Label>
              <RadioGroup 
                value={assessment.painPoints.boardPrepTime} 
                onValueChange={(value) => updateAssessment('painPoints', { boardPrepTime: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="<10 hours" id="board_10" />
                  <Label htmlFor="board_10">Less than 10 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-20 hours" id="board_20" />
                  <Label htmlFor="board_20">10-20 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="20-40 hours" id="board_40" />
                  <Label htmlFor="board_40">20-40 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="40+ hours" id="board_40_plus" />
                  <Label htmlFor="board_40_plus">40+ hours</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Most Time-Consuming Manual Processes (Select all that apply)</Label>
              <div className="mt-2 space-y-2">
                {[
                  'Data collection from multiple systems',
                  'Manual variance analysis',
                  'Creating board presentations',
                  'Budget vs actual reporting',
                  'Cash flow forecasting',
                  'Compliance reporting',
                  'Month-end close processes',
                  'KPI calculation and reporting'
                ].map(process => (
                  <div key={process} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={process}
                      checked={assessment.painPoints.manualProcesses.includes(process)}
                      onChange={() => handleManualProcessToggle(process)}
                      className="rounded border-input"
                    />
                    <Label htmlFor={process}>{process}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">What's your biggest frustration as a CFO?</Label>
              <Textarea
                value={assessment.painPoints.biggestFrustration}
                onChange={(e) => updateAssessment('painPoints', { biggestFrustration: e.target.value })}
                placeholder="Describe your biggest pain point or time waster..."
                className="mt-2"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Target Weekly Time Savings</Label>
              <RadioGroup 
                value={assessment.goals.timeSavings} 
                onValueChange={(value) => updateAssessment('goals', { timeSavings: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-5 hours" id="save_5" />
                  <Label htmlFor="save_5">2-5 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5-10 hours" id="save_10" />
                  <Label htmlFor="save_10">5-10 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-15 hours" id="save_15" />
                  <Label htmlFor="save_15">10-15 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15+ hours" id="save_15_plus" />
                  <Label htmlFor="save_15_plus">15+ hours</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Primary Goals (Select all that apply)</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="accuracy"
                    checked={assessment.goals.accuracy}
                    onChange={(e) => updateAssessment('goals', { accuracy: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="accuracy">Improve reporting accuracy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="teamProductivity"
                    checked={assessment.goals.teamProductivity}
                    onChange={(e) => updateAssessment('goals', { teamProductivity: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="teamProductivity">Increase team productivity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="strategicFocus"
                    checked={assessment.goals.strategicFocus}
                    onChange={(e) => updateAssessment('goals', { strategicFocus: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="strategicFocus">Focus more on strategic analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="complianceImprovement"
                    checked={assessment.goals.complianceImprovement}
                    onChange={(e) => updateAssessment('goals', { complianceImprovement: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="complianceImprovement">Improve compliance processes</Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return assessment.companyProfile.industry && 
               assessment.companyProfile.revenue && 
               assessment.companyProfile.employees &&
               assessment.companyProfile.publicPrivate;
      case 2:
        return assessment.currentStack.erp && 
               assessment.currentStack.bi && 
               assessment.currentStack.spreadsheets &&
               assessment.currentStack.automationLevel;
      case 3:
        return assessment.painPoints.reportingTime && 
               assessment.painPoints.boardPrepTime;
      case 4:
        return assessment.goals.timeSavings;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-text">
              CFO AI Readiness Assessment
            </CardTitle>
            <CardDescription className="text-lg">
              Get personalized AI tool recommendations based on your specific challenges and goals
            </CardDescription>
            <div className="mt-4">
              <Progress value={(step / totalSteps) * 100} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {step} of {totalSteps}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {renderStep()}
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < totalSteps ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="px-8"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? 'Generating Recommendations...' : 'Complete Assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}