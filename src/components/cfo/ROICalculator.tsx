import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ROICalculatorProps {
  compact?: boolean;
}

interface ROIInputs {
  hourlyRate: number;
  weeklyReportingHours: number;
  monthlyBoardPrepHours: number;
  teamSize: number;
  automationSavingsPercent: number;
  toolCostMonthly: number;
  implementationCostHours: number;
}

interface ROIResults {
  weeklyTimeSaved: number;
  monthlyCostSavings: number;
  annualCostSavings: number;
  toolCostAnnual: number;
  implementationCost: number;
  netAnnualSavings: number;
  roiPercentage: number;
  paybackMonths: number;
}

export function ROICalculator({ compact = false }: ROICalculatorProps) {
  const [inputs, setInputs] = useState<ROIInputs>({
    hourlyRate: 200, // CFO hourly rate
    weeklyReportingHours: 15,
    monthlyBoardPrepHours: 20,
    teamSize: 3,
    automationSavingsPercent: 40,
    toolCostMonthly: 500,
    implementationCostHours: 20
  });

  const [results, setResults] = useState<ROIResults>({
    weeklyTimeSaved: 0,
    monthlyCostSavings: 0,
    annualCostSavings: 0,
    toolCostAnnual: 0,
    implementationCost: 0,
    netAnnualSavings: 0,
    roiPercentage: 0,
    paybackMonths: 0
  });

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    const {
      hourlyRate,
      weeklyReportingHours,
      monthlyBoardPrepHours,
      teamSize,
      automationSavingsPercent,
      toolCostMonthly,
      implementationCostHours
    } = inputs;

    // Calculate time savings
    const weeklyTimeSaved = (weeklyReportingHours * automationSavingsPercent) / 100;
    const monthlyBoardTimeSaved = (monthlyBoardPrepHours * automationSavingsPercent) / 100;
    
    // Calculate cost savings (including team multiplier for some tasks)
    const weeklyIndividualSavings = weeklyTimeSaved * hourlyRate;
    const weeklyTeamSavings = (weeklyTimeSaved * 0.3) * (teamSize - 1) * (hourlyRate * 0.6); // Team gets 30% of savings at 60% of CFO rate
    const monthlyBoardSavings = monthlyBoardTimeSaved * hourlyRate;
    
    const monthlyCostSavings = (weeklyIndividualSavings + weeklyTeamSavings) * 4.33 + monthlyBoardSavings;
    const annualCostSavings = monthlyCostSavings * 12;
    
    // Calculate costs
    const toolCostAnnual = toolCostMonthly * 12;
    const implementationCost = implementationCostHours * hourlyRate;
    const totalFirstYearCosts = toolCostAnnual + implementationCost;
    
    // Calculate ROI
    const netAnnualSavings = annualCostSavings - toolCostAnnual;
    const roiPercentage = ((annualCostSavings - totalFirstYearCosts) / totalFirstYearCosts) * 100;
    const paybackMonths = totalFirstYearCosts / monthlyCostSavings;

    setResults({
      weeklyTimeSaved,
      monthlyCostSavings,
      annualCostSavings,
      toolCostAnnual,
      implementationCost,
      netAnnualSavings,
      roiPercentage,
      paybackMonths
    });
  };

  const updateInput = (field: keyof ROIInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600 bg-green-50';
    if (roi >= 200) return 'text-blue-600 bg-blue-50';
    if (roi >= 100) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPaybackColor = (months: number) => {
    if (months <= 3) return 'text-green-600';
    if (months <= 6) return 'text-blue-600';
    if (months <= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.roiPercentage.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground">Annual ROI</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.paybackMonths.toFixed(1)}mo
            </div>
            <p className="text-sm text-muted-foreground">Payback</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold">
            ${results.netAnnualSavings.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Net Annual Savings</p>
        </div>

        <Button className="w-full" size="sm">
          <Calculator className="h-4 w-4 mr-2" />
          Full Calculator
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-6 w-6" />
          <span>CFO AI Tools ROI Calculator</span>
        </CardTitle>
        <CardDescription>
          Calculate the potential return on investment for your AI tool implementations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Current Situation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Your Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={inputs.hourlyRate}
                onChange={(e) => updateInput('hourlyRate', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Based on salary + benefits (typically $150-300/hr for CFOs)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Finance Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                value={inputs.teamSize}
                onChange={(e) => updateInput('teamSize', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Number of people who will benefit from automation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyReporting">Weekly Reporting Hours</Label>
              <Input
                id="weeklyReporting"
                type="number"
                value={inputs.weeklyReportingHours}
                onChange={(e) => updateInput('weeklyReportingHours', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Time spent on regular financial reporting
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boardPrep">Monthly Board Prep Hours</Label>
              <Input
                id="boardPrep"
                type="number"
                value={inputs.monthlyBoardPrepHours}
                onChange={(e) => updateInput('monthlyBoardPrepHours', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Time for board presentations and materials
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Expected Automation Savings: {inputs.automationSavingsPercent}%</Label>
            <Slider
              value={[inputs.automationSavingsPercent]}
              onValueChange={(value) => updateInput('automationSavingsPercent', value[0])}
              max={80}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10% (Minimal)</span>
              <span>40% (Typical)</span>
              <span>80% (Maximum)</span>
            </div>
          </div>

          <Separator />

          <h3 className="text-lg font-semibold">Tool Costs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="toolCost">Monthly Tool Cost ($)</Label>
              <Input
                id="toolCost"
                type="number"
                value={inputs.toolCostMonthly}
                onChange={(e) => updateInput('toolCostMonthly', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Average cost per month for AI tools
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="implementationHours">Implementation Hours</Label>
              <Input
                id="implementationHours"
                type="number"
                value={inputs.implementationCostHours}
                onChange={(e) => updateInput('implementationCostHours', Number(e.target.value))}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Time to set up and train team (at your hourly rate)
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">ROI Analysis</h3>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20">
              <CardContent className="text-center p-6">
                <div className={`text-3xl font-bold mb-2 ${getROIColor(results.roiPercentage)}`}>
                  {results.roiPercentage.toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Annual ROI</p>
                <div className="mt-2">
                  {results.roiPercentage >= 200 ? (
                    <Badge className="bg-green-500">Excellent</Badge>
                  ) : results.roiPercentage >= 100 ? (
                    <Badge className="bg-blue-500">Good</Badge>
                  ) : (
                    <Badge variant="outline">Review Costs</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20">
              <CardContent className="text-center p-6">
                <div className={`text-3xl font-bold mb-2 ${getPaybackColor(results.paybackMonths)}`}>
                  {results.paybackMonths.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Payback (Months)</p>
                <div className="mt-2">
                  {results.paybackMonths <= 6 ? (
                    <Badge className="bg-green-500">Fast Payback</Badge>
                  ) : results.paybackMonths <= 12 ? (
                    <Badge className="bg-yellow-500">Moderate</Badge>
                  ) : (
                    <Badge variant="outline">Slow Payback</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2 text-green-600">
                  ${results.netAnnualSavings.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Net Annual Savings</p>
                <div className="mt-2">
                  <Badge variant="secondary">After All Costs</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium">Financial Breakdown</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-green-600">Benefits</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly time saved:</span>
                    <span className="font-medium">{results.weeklyTimeSaved.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly cost savings:</span>
                    <span className="font-medium">${results.monthlyCostSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual cost savings:</span>
                    <span className="font-medium">${results.annualCostSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-red-600">Costs</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Annual tool cost:</span>
                    <span className="font-medium">${results.toolCostAnnual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Implementation cost:</span>
                    <span className="font-medium">${results.implementationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Total first-year costs:</span>
                    <span>${(results.toolCostAnnual + results.implementationCost).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              {results.roiPercentage >= 200 ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-blue-900">
                  {results.roiPercentage >= 200 ? 'Strong Investment Case' : 'Investment Recommendation'}
                </p>
                <p className="text-sm text-blue-700">
                  {results.roiPercentage >= 200 
                    ? 'This shows excellent ROI. The time savings and efficiency gains justify the investment.'
                    : results.roiPercentage >= 100
                    ? 'This shows positive ROI. Consider starting with the highest-impact tools first.'
                    : 'Consider focusing on lower-cost tools or areas with higher automation potential.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}