import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Star, Users, Target, CheckCircle, Brain, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ConsultingService {
  id: string;
  service_name: string;
  description: string;
  price_range: string;
  duration_weeks: number;
  consultant_name: string;
  consultant_expertise: string[];
  rating: number;
  reviews_count: number;
  outcomes: string[];
  next_availability: string;
}

interface ServiceBooking {
  id: string;
  service_id: string;
  user_id: string;
  preferred_start_date: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface AIAssessment {
  id: string;
  assessment_type: string;
  ai_recommendations: any;
  confidence_score: number;
  status: string;
  created_at: string;
}

export function ConsultingServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<ConsultingService[]>([]);
  const [userBookings, setUserBookings] = useState<ServiceBooking[]>([]);
  const [aiAssessment, setAiAssessment] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [specificContext, setSpecificContext] = useState('');

  useEffect(() => {
    loadServices();
    if (user) {
      loadUserBookings();
      loadUserAssessments();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      const { data: servicesData, error } = await supabase
        .from('consulting_services')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Error loading services",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookings = async () => {
    if (!user) return;

    try {
      const { data: bookingsData, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadUserAssessments = async () => {
    if (!user) return;

    try {
      const { data: assessmentData, error } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('assessment_type', 'consulting')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setAiAssessment(assessmentData);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const handleBookService = async (serviceId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a consultation.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already has a booking for this service
      const existingBooking = userBookings.find(b => 
        b.service_id === serviceId && 
        ['pending', 'confirmed'].includes(b.status)
      );

      if (existingBooking) {
        toast({
          title: "Already booked",
          description: "You already have a booking for this service.",
          variant: "destructive"
        });
        return;
      }

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          service_id: serviceId,
          user_id: user.id,
          preferred_start_date: nextWeek.toISOString().split('T')[0],
          status: 'pending',
          notes: 'Booking requested through platform'
        })
        .select()
        .single();

      if (error) throw error;

      setUserBookings(prev => [data, ...prev]);

      toast({
        title: "Consultation booked!",
        description: "A consultant will contact you within 24 hours to confirm details.",
      });

    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        title: "Error booking consultation",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateAIAssessment = async () => {
    if (!user) return;

    setAssessmentLoading(true);
    try {
      // Get user profile for assessment
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Call the AI assessment edge function
      const { data, error } = await supabase.functions.invoke('ai-assessment', {
        body: {
          assessmentType: 'consulting',
          userProfile: profile,
          specificContext: specificContext ? { additionalInfo: specificContext } : undefined
        }
      });

      if (error) throw error;

      setAiAssessment(data.assessment);
      setShowAssessment(false);
      
      toast({
        title: "AI Assessment Complete!",
        description: `Assessment generated with ${Math.round(data.confidenceScore * 100)}% confidence.`,
      });

    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        title: "Assessment Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setAssessmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading consulting services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Expert Consulting Services</h1>
        <p className="text-muted-foreground">
          Get personalized guidance from AI implementation experts to accelerate your transformation
        </p>
      </div>

      {/* AI Assessment Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            AI-Powered Consulting Assessment
          </CardTitle>
          <CardDescription>
            Get personalized consulting recommendations based on your role, industry, and specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Assessment Complete</span>
                  <Badge variant="secondary">
                    {Math.round(aiAssessment.confidence_score * 100)}% Confidence
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(aiAssessment.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {aiAssessment.ai_recommendations?.summary && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Key Recommendations:</h4>
                  <p className="text-sm text-muted-foreground">
                    {aiAssessment.ai_recommendations.summary}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate New Assessment
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Assessment Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate a personalized AI assessment to get tailored consulting recommendations
              </p>
              <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
                <DialogTrigger asChild>
                  <Button>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>AI Automation Assessment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Our AI will analyze your profile and generate personalized consulting recommendations.
                    </p>
                    <div>
                      <label className="text-sm font-medium">Additional Context (Optional)</label>
                      <Textarea
                        placeholder="Describe any specific challenges, goals, or context that would help personalize your assessment..."
                        value={specificContext}
                        onChange={(e) => setSpecificContext(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={generateAIAssessment} 
                      disabled={assessmentLoading}
                      className="w-full"
                    >
                      {assessmentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Assessment...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Assessment
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Bookings */}
      {userBookings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.slice(0, 2).map((booking) => {
                const service = services.find(s => s.id === booking.service_id);
                return (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{service?.service_name || 'Service'}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(booking.preferred_start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{service.service_name}</CardTitle>
                <Badge variant="outline">
                  {service.duration_weeks} weeks
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{service.description}</p>

              {/* Consultant Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${service.consultant_name}`} />
                  <AvatarFallback>{service.consultant_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{service.consultant_name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm ml-1">{service.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({service.reviews_count} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2">
                {service.consultant_expertise.map((expertise, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {expertise}
                  </Badge>
                ))}
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Key Outcomes
                </h4>
                <ul className="space-y-2">
                  {service.outcomes.slice(0, 3).map((outcome, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing and Availability */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Investment</span>
                  <span className="font-medium">{service.price_range}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Next Available</span>
                  <span className="text-sm">
                    {new Date(service.next_availability).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* AI Recommendation Badge */}
              {aiAssessment?.ai_recommendations?.toolRecommendations?.some((tool: string) => 
                tool.toLowerCase().includes(service.service_name.toLowerCase().split(' ')[0])
              ) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">AI Recommended</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                className="w-full" 
                onClick={() => handleBookService(service.id)}
                disabled={userBookings.some(b => 
                  b.service_id === service.id && 
                  ['pending', 'confirmed'].includes(b.status)
                )}
              >
                {userBookings.some(b => 
                  b.service_id === service.id && 
                  ['pending', 'confirmed'].includes(b.status)
                ) ? 'Already Booked' : 'Book Consultation'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Need Custom Solutions?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our team can create tailored consulting programs specifically designed for your organization's 
              unique challenges and objectives.
            </p>
            <Button size="lg" variant="outline">
              Contact Enterprise Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}