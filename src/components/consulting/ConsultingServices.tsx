import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Star, Users, Target, CheckCircle } from 'lucide-react';
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

export function ConsultingServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<ConsultingService[]>([]);
  const [userBookings, setUserBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
    if (user) {
      loadUserBookings();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      // For now, use mock data with IDs
      const mockServices = generateDefaultServices().map((service, index) => ({
        ...service,
        id: `service-${index + 1}`
      }));
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading services:', error);
      // Fallback to mock data
      const mockServices = generateDefaultServices().map((service, index) => ({
        ...service,
        id: `service-${index + 1}`
      }));
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookings = async () => {
    if (!user) return;

    try {
      // For now, use empty array until database is set up
      setUserBookings([]);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setUserBookings([]);
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

      const bookingData = {
        id: Date.now().toString(),
        service_id: serviceId,
        user_id: user.id,
        preferred_start_date: nextWeek.toISOString().split('T')[0],
        status: 'pending' as const,
        notes: 'Booking requested through platform',
        created_at: new Date().toISOString()
      };

      // For now, just update local state
      setUserBookings(prev => [...prev, bookingData]);

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

  const generateDefaultServices = (): Omit<ConsultingService, 'id'>[] => [
    {
      service_name: "AI Strategy Implementation",
      description: "Comprehensive 12-week program to develop and execute your organization's AI transformation strategy",
      price_range: "$25,000 - $50,000",
      duration_weeks: 12,
      consultant_name: "Dr. Amanda Liu",
      consultant_expertise: ["AI Strategy", "Change Management", "ROI Optimization"],
      rating: 4.9,
      reviews_count: 47,
      outcomes: [
        "Custom AI roadmap aligned with business objectives",
        "Team training and change management plan",
        "Pilot project implementation with measurable ROI",
        "Governance framework and risk mitigation strategy"
      ],
      next_availability: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      service_name: "Executive AI Leadership Program",
      description: "Intensive 6-week executive coaching program focused on AI leadership and decision-making",
      price_range: "$15,000 - $25,000",
      duration_weeks: 6,
      consultant_name: "Michael Rodriguez",
      consultant_expertise: ["Executive Coaching", "AI Governance", "Digital Transformation"],
      rating: 4.8,
      reviews_count: 32,
      outcomes: [
        "Enhanced AI fluency and confidence",
        "Strategic decision-making framework",
        "Board-ready AI communication skills",
        "Personal AI productivity optimization"
      ],
      next_availability: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      service_name: "AI ROI Assessment & Optimization",
      description: "4-week deep-dive analysis of your current AI investments with optimization recommendations",
      price_range: "$8,000 - $15,000",
      duration_weeks: 4,
      consultant_name: "Sarah Chen",
      consultant_expertise: ["Financial Analysis", "AI Metrics", "Performance Optimization"],
      rating: 4.9,
      reviews_count: 28,
      outcomes: [
        "Comprehensive ROI analysis of existing AI initiatives",
        "Cost optimization recommendations",
        "Performance metrics dashboard",
        "Future investment prioritization framework"
      ],
      next_availability: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      service_name: "AI Risk & Compliance Framework",
      description: "8-week program to establish comprehensive AI governance, risk management, and compliance protocols",
      price_range: "$20,000 - $35,000",
      duration_weeks: 8,
      consultant_name: "James Patterson",
      consultant_expertise: ["AI Ethics", "Compliance", "Risk Management", "Legal Framework"],
      rating: 4.7,
      reviews_count: 19,
      outcomes: [
        "AI governance framework and policies",
        "Risk assessment and mitigation protocols",
        "Compliance monitoring system",
        "Ethics board establishment and training"
      ],
      next_availability: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

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