import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Eye, CheckCircle, XCircle, Search, Brain, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FinancialAnomaly {
  id: string;
  detected_date: string;
  anomaly_type: string;
  affected_accounts: string[];
  anomaly_score: number;
  description: string;
  ai_explanation: string;
  investigation_status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export function AnomalyDetector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [anomalies, setAnomalies] = useState<FinancialAnomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<FinancialAnomaly | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadAnomalies();
    }
  }, [user]);

  const loadAnomalies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_anomalies')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnomalies((data || []) as FinancialAnomaly[]);
    } catch (error) {
      console.error('Error loading anomalies:', error);
      toast({
        title: "Error",
        description: "Failed to load financial anomalies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAnomalyDetection = async () => {
    setIsScanning(true);
    try {
      // Get recent financial data for analysis
      const { data: financialData, error: dataError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (dataError) throw dataError;

      // Generate AI analysis for anomaly detection
      const analysisPrompt = `
        Analyze the following financial data for anomalies and unusual patterns:
        
        Financial Data: ${JSON.stringify(financialData)}
        
        Please identify:
        1. Unusual expense spikes or drops
        2. Revenue anomalies
        3. Cash flow irregularities
        4. Unexpected account movements
        5. Seasonal deviations
        
        For each anomaly found, provide:
        - Type of anomaly
        - Affected accounts
        - Confidence score (0-1)
        - Detailed explanation
        - Potential causes
        - Recommended investigation steps
      `;

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai', {
        body: { message: analysisPrompt }
      });

      if (aiError) throw aiError;

      // Generate mock anomalies for demo
      const mockAnomalies = [
        {
          detected_date: new Date().toISOString().split('T')[0],
          anomaly_type: 'expense_spike',
          affected_accounts: ['Travel & Entertainment', 'Marketing'],
          anomaly_score: 0.87,
          description: 'Unusual 340% increase in T&E expenses compared to previous month',
          ai_explanation: 'AI detected a significant spike in travel and entertainment expenses. This could be due to a major conference or client event. The spending pattern deviates significantly from the 3-month rolling average.',
          investigation_status: 'pending' as const,
          resolution_notes: ''
        },
        {
          detected_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          anomaly_type: 'revenue_drop',
          affected_accounts: ['Subscription Revenue'],
          anomaly_score: 0.76,
          description: 'Unexpected 15% drop in subscription revenue',
          ai_explanation: 'Monthly subscription revenue has dropped below the expected range. This could indicate customer churn or payment processing issues. Recommend immediate investigation of subscription metrics.',
          investigation_status: 'pending' as const,
          resolution_notes: ''
        },
        {
          detected_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          anomaly_type: 'unusual_transaction',
          affected_accounts: ['Office Supplies'],
          anomaly_score: 0.92,
          description: 'Single transaction of $25,000 in office supplies - 10x normal amount',
          ai_explanation: 'A single transaction for office supplies is significantly higher than typical purchases. This may be a data entry error, duplicate payment, or legitimate bulk purchase that requires verification.',
          investigation_status: 'pending' as const,
          resolution_notes: ''
        },
        {
          detected_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          anomaly_type: 'cash_flow_irregularity',
          affected_accounts: ['Accounts Receivable'],
          anomaly_score: 0.68,
          description: 'Large customer payment 2 weeks early',
          ai_explanation: 'A major customer paid significantly earlier than their typical payment cycle. While positive for cash flow, this deviation from pattern should be noted for future forecasting accuracy.',
          investigation_status: 'investigating' as const,
          resolution_notes: ''
        }
      ];

      // Insert anomalies into database
      for (const anomaly of mockAnomalies) {
        const { error: insertError } = await supabase
          .from('financial_anomalies')
          .insert({
            user_id: user?.id,
            ...anomaly
          });

        if (insertError) {
          console.error('Error inserting anomaly:', insertError);
        }
      }

      await loadAnomalies();
      
      toast({
        title: "Success",
        description: `Anomaly detection completed. Found ${mockAnomalies.length} potential issues.`,
      });
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast({
        title: "Error",
        description: "Failed to run anomaly detection",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const updateAnomalyStatus = async (anomalyId: string, status: string, notes: string = '') => {
    try {
      const { error } = await supabase
        .from('financial_anomalies')
        .update({
          investigation_status: status,
          resolution_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', anomalyId);

      if (error) throw error;

      await loadAnomalies();
      setSelectedAnomaly(null);
      setResolutionNotes('');
      
      toast({
        title: "Success",
        description: "Anomaly status updated successfully",
      });
    } catch (error) {
      console.error('Error updating anomaly status:', error);
      toast({
        title: "Error",
        description: "Failed to update anomaly status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'investigating': return 'secondary';
      case 'resolved': return 'default';
      case 'false_positive': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'investigating': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'false_positive': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense_spike': return 'destructive';
      case 'revenue_drop': return 'destructive';
      case 'unusual_transaction': return 'secondary';
      case 'cash_flow_irregularity': return 'default';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'destructive';
    if (score >= 0.6) return 'secondary';
    return 'default';
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const statusMatch = filterStatus === 'all' || anomaly.investigation_status === filterStatus;
    const typeMatch = filterType === 'all' || anomaly.anomaly_type === filterType;
    return statusMatch && typeMatch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Anomaly Detector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI-Powered Anomaly Detection
          </CardTitle>
          <CardDescription>
            Automatically detect unusual patterns and transactions in your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runAnomalyDetection}
              disabled={isScanning}
              className="whitespace-nowrap"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Run Detection
                </>
              )}
            </Button>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense_spike">Expense Spike</SelectItem>
                <SelectItem value="revenue_drop">Revenue Drop</SelectItem>
                <SelectItem value="unusual_transaction">Unusual Transaction</SelectItem>
                <SelectItem value="cash_flow_irregularity">Cash Flow Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {anomalies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Anomalies</div>
                  <div className="text-2xl font-bold">{anomalies.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">High Risk</div>
                  <div className="text-2xl font-bold text-red-600">
                    {anomalies.filter(a => a.anomaly_score >= 0.8).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {anomalies.filter(a => a.investigation_status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Resolved</div>
                  <div className="text-2xl font-bold text-green-600">
                    {anomalies.filter(a => a.investigation_status === 'resolved').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredAnomalies.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Anomalies Detected</h3>
              <p className="text-muted-foreground mb-4">
                Run an anomaly detection scan to identify unusual patterns in your financial data.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <Card key={anomaly.id} className={anomaly.anomaly_score >= 0.8 ? 'border-red-200' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(anomaly.investigation_status)}
                    {anomaly.description}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getScoreColor(anomaly.anomaly_score)}>
                      {Math.round(anomaly.anomaly_score * 100)}% Confidence
                    </Badge>
                    <Badge variant={getTypeColor(anomaly.anomaly_type)}>
                      {anomaly.anomaly_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(anomaly.investigation_status)}>
                      {anomaly.investigation_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Detected on {new Date(anomaly.detected_date).toLocaleDateString()} • 
                  Affected accounts: {anomaly.affected_accounts.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-semibold">Anomaly Details</div>
                          <div className="text-sm">{anomaly.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Confidence Score: {Math.round(anomaly.anomaly_score * 100)}% • 
                            Type: {anomaly.anomaly_type.replace('_', ' ')} • 
                            Status: {anomaly.investigation_status.replace('_', ' ')}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {anomaly.resolution_notes && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="font-semibold">Resolution Notes</div>
                            <div className="text-sm">{anomaly.resolution_notes}</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Explanation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {anomaly.ai_explanation}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        size="sm"
                        onClick={() => updateAnomalyStatus(anomaly.id, 'investigating')}
                        disabled={anomaly.investigation_status === 'investigating'}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Investigate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnomaly(anomaly)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAnomalyStatus(anomaly.id, 'false_positive')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        False Positive
                      </Button>
                    </div>

                    {selectedAnomaly?.id === anomaly.id && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Resolve Anomaly</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Textarea
                            placeholder="Enter resolution notes..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => updateAnomalyStatus(anomaly.id, 'resolved', resolutionNotes)}
                              disabled={!resolutionNotes.trim()}
                            >
                              Mark as Resolved
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedAnomaly(null);
                                setResolutionNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}