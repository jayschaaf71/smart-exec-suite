# LOVABLE AI IMPLEMENTATION INSTRUCTIONS
## Black Knight AI - Enhanced Features Update

---

## OVERVIEW

Update the existing Smart Exec Suite application with enhanced AI assessment, personalized onboarding, peer networking, and consulting services. Build upon the current React/TypeScript/Supabase architecture.

---

## PHASE 1: ENHANCED ASSESSMENT SYSTEM

### 1. Update Assessment Component

**File to Modify:** `src/components/onboarding/Assessment.tsx`

**Replace existing assessment with comprehensive evaluation:**

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentData {
  aiKnowledge: {
    currentTools: string[];
    usageFrequency: string;
    confidenceLevel: number;
    challenges: string[];
    previousTraining: boolean;
  };
  roleActivities: {
    publicSpeaking: number;
    teamMeetings: number;
    boardPrep: number;
    earningsCalls: number;
    strategicPlanning: number;
    financialReporting: number;
    operationalOversight: number;
    stakeholderComm: number;
  };
  industryContext: {
    primaryIndustry: string;
    industrySubcategory: string;
    companySize: string;
    teamSize: number;
  };
}

const AI_TOOLS_OPTIONS = [
  'ChatGPT', 'Claude', 'Perplexity', 'Midjourney', 'DALL-E', 'Notion AI',
  'Grammarly', 'Jasper', 'Copy.ai', 'Otter.ai', 'Calendly AI', 'Slack AI',
  'Microsoft Copilot', 'Google Bard', 'Canva AI', 'Loom AI', 'Zoom AI',
  'Salesforce Einstein', 'HubSpot AI', 'Monday.com AI', 'None'
];

const INDUSTRIES = {
  'Technology': ['SaaS', 'Hardware', 'AI/ML', 'Cybersecurity', 'Fintech'],
  'Financial Services': ['Banking', 'Insurance', 'Investment', 'Wealth Management'],
  'Healthcare': ['Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Biotech'],
  'Manufacturing': ['Automotive', 'Aerospace', 'Consumer Goods', 'Industrial Equipment'],
  'Retail': ['E-commerce', 'Traditional Retail', 'Luxury', 'Food & Beverage'],
  'Energy': ['Oil & Gas', 'Renewable Energy', 'Utilities', 'Mining'],
  'Real Estate': ['Commercial', 'Residential', 'REITs', 'Property Management'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Marketing']
};

export function EnhancedAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    aiKnowledge: {
      currentTools: [],
      usageFrequency: '',
      confidenceLevel: 5,
      challenges: [],
      previousTraining: false
    },
    roleActivities: {
      publicSpeaking: 0,
      teamMeetings: 0,
      boardPrep: 0,
      earningsCalls: 0,
      strategicPlanning: 0,
      financialReporting: 0,
      operationalOversight: 0,
      stakeholderComm: 0
    },
    industryContext: {
      primaryIndustry: '',
      industrySubcategory: '',
      companySize: '',
      teamSize: 0
    }
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate AI knowledge score
      const knowledgeScore = calculateKnowledgeScore(assessmentData.aiKnowledge);
      
      // Save assessment data
      await supabase.from('user_assessments').insert({
        user_id: user.id,
        ai_knowledge_score: knowledgeScore,
        current_tools: assessmentData.aiKnowledge.currentTools,
        activity_breakdown: assessmentData.roleActivities,
        industry_category: assessmentData.industryContext.primaryIndustry,
        industry_subcategory: assessmentData.industryContext.industrySubcategory,
        assessment_version: '2.0',
        completed_at: new Date().toISOString()
      });

      // Save activity allocations
      const activities = Object.entries(assessmentData.roleActivities);
      for (const [activity, percentage] of activities) {
        if (percentage > 0) {
          await supabase.from('activity_allocations').insert({
            user_id: user.id,
            activity_type: activity,
            time_percentage: percentage,
            importance_level: percentage > 20 ? 3 : percentage > 10 ? 2 : 1,
            ai_potential_score: calculateAIPotential(activity)
          });
        }
      }

      // Redirect to personalized onboarding
      window.location.href = '/onboarding/personalized';
      
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const calculateKnowledgeScore = (knowledge: any) => {
    let score = 0;
    score += knowledge.currentTools.length * 5; // 5 points per tool
    score += knowledge.confidenceLevel * 5; // Up to 50 points for confidence
    score += knowledge.previousTraining ? 20 : 0; // 20 points for training
    return Math.min(score, 100);
  };

  const calculateAIPotential = (activity: string) => {
    const potentialScores: { [key: string]: number } = {
      publicSpeaking: 85,
      teamMeetings: 70,
      boardPrep: 90,
      earningsCalls: 80,
      strategicPlanning: 95,
      financialReporting: 90,
      operationalOversight: 75,
      stakeholderComm: 80
    };
    return potentialScores[activity] || 70;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Readiness Assessment</h1>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
      </div>

      {currentStep === 1 && (
        <AIKnowledgeStep 
          data={assessmentData.aiKnowledge}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, aiKnowledge: data }))}
        />
      )}

      {currentStep === 2 && (
        <RoleActivitiesStep 
          data={assessmentData.roleActivities}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, roleActivities: data }))}
        />
      )}

      {currentStep === 3 && (
        <IndustryContextStep 
          data={assessmentData.industryContext}
          onChange={(data) => setAssessmentData(prev => ({ ...prev, industryContext: data }))}
        />
      )}

      {currentStep === 4 && (
        <AssessmentSummary data={assessmentData} />
      )}

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === totalSteps ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

// Add individual step components here...
```

### 2. Create Database Tables

**Add to Supabase migrations:**

```sql
-- Enhanced user assessment table
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_knowledge_score INTEGER,
  current_tools JSONB,
  activity_breakdown JSONB,
  industry_category TEXT,
  industry_subcategory TEXT,
  role_level TEXT,
  team_size INTEGER,
  assessment_version TEXT DEFAULT '2.0',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity time allocation table
CREATE TABLE IF NOT EXISTS activity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT,
  time_percentage INTEGER,
  importance_level INTEGER,
  ai_potential_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own assessments" ON user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity allocations" ON activity_allocations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity allocations" ON activity_allocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## PHASE 2: PERSONALIZED ONBOARDING

### 1. Create Personal Productivity Module

**New File:** `src/components/onboarding/PersonalProductivity.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ToolRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  setup_time: string;
  roi_percentage: number;
  complexity: string;
  reason: string;
  priority: number;
}

export function PersonalProductivity() {
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedRecommendations();
  }, []);

  const loadPersonalizedRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user assessment data
      const { data: assessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!assessment) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile({ ...assessment, ...profile });

      // Generate personalized recommendations
      const recommendations = await generateRecommendations(assessment, profile);
      setRecommendations(recommendations);

    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (assessment: any, profile: any) => {
    // Role and industry specific recommendations
    const roleIndustryMap = {
      'CFO': {
        'Manufacturing': [
          {
            name: 'Power BI with AI Insights',
            description: 'Advanced financial analytics with predictive modeling for manufacturing costs',
            category: 'Analytics',
            setup_time: '2-4 hours',
            roi_percentage: 35,
            complexity: 'Medium',
            reason: 'Perfect for manufacturing CFOs needing cost analysis and supply chain insights',
            priority: 1
          },
          {
            name: 'SAP Ariba AI',
            description: 'AI-powered procurement and supply chain financial management',
            category: 'Procurement',
            setup_time: '1-2 weeks',
            roi_percentage: 45,
            complexity: 'High',
            reason: 'Essential for manufacturing supply chain cost optimization',
            priority: 2
          }
        ],
        'Pharmaceutical': [
          {
            name: 'Medidata Financial Management',
            description: 'AI-driven clinical trial budgeting and R&D financial planning',
            category: 'R&D Finance',
            setup_time: '1-3 days',
            roi_percentage: 40,
            complexity: 'Medium',
            reason: 'Specialized for pharmaceutical R&D financial management',
            priority: 1
          },
          {
            name: 'Thomson Reuters ONESOURCE',
            description: 'AI-powered regulatory compliance and tax management',
            category: 'Compliance',
            setup_time: '3-5 days',
            roi_percentage: 30,
            complexity: 'High',
            reason: 'Critical for pharmaceutical regulatory compliance',
            priority: 2
          }
        ]
      },
      'CEO': {
        'Technology': [
          {
            name: 'CB Insights AI',
            description: 'Market intelligence and competitive analysis with AI insights',
            category: 'Market Intelligence',
            setup_time: '30 minutes',
            roi_percentage: 50,
            complexity: 'Easy',
            reason: 'Essential for technology CEOs tracking market trends and competition',
            priority: 1
          },
          {
            name: 'Productboard AI',
            description: 'AI-powered product strategy and roadmap planning',
            category: 'Product Strategy',
            setup_time: '2-4 hours',
            roi_percentage: 45,
            complexity: 'Medium',
            reason: 'Perfect for technology CEOs managing product portfolios',
            priority: 2
          }
        ],
        'Healthcare': [
          {
            name: 'Epic AI Modules',
            description: 'AI-enhanced clinical operations and patient management',
            category: 'Clinical Operations',
            setup_time: '1-2 weeks',
            roi_percentage: 55,
            complexity: 'High',
            reason: 'Essential for healthcare CEOs optimizing clinical operations',
            priority: 1
          },
          {
            name: 'Salesforce Health Cloud AI',
            description: 'AI-powered patient experience and care coordination',
            category: 'Patient Experience',
            setup_time: '3-5 days',
            roi_percentage: 40,
            complexity: 'Medium',
            reason: 'Critical for healthcare CEOs improving patient outcomes',
            priority: 2
          }
        ]
      }
    };

    const role = profile?.role || 'CEO';
    const industry = assessment?.industry_category || 'Technology';
    
    return roleIndustryMap[role]?.[industry] || roleIndustryMap['CEO']['Technology'];
  };

  const handleImplementTool = async (toolId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_tool_progress').upsert({
        user_id: user.id,
        tool_id: toolId,
        status: 'interested',
        progress_percentage: 0,
        created_at: new Date().toISOString()
      });

      // Show success message
      alert('Tool added to your implementation list!');
      
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading personalized recommendations...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Personal AI Productivity Toolkit</h1>
        <p className="text-gray-600">
          Based on your role as a {userProfile?.role} in {userProfile?.industry_category}, 
          here are the most impactful AI tools for your specific needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((tool, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <Badge variant={tool.priority === 1 ? "default" : "secondary"}>
                  {tool.priority === 1 ? "High Priority" : "Medium Priority"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{tool.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Time:</span>
                  <span className="font-medium">{tool.setup_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expected ROI:</span>
                  <span className="font-medium text-green-600">{tool.roi_percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Complexity:</span>
                  <Badge variant="outline" className="text-xs">
                    {tool.complexity}
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why this tool:</strong> {tool.reason}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleImplementTool(tool.id)}
                  className="flex-1"
                >
                  Add to My Tools
                </Button>
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
}
```

### 2. Create Industry Knowledge System

**New File:** `src/components/knowledge/IndustryUpdates.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IndustryUpdate {
  id: string;
  role_type: string;
  industry_category: string;
  week_of: string;
  topic_1_title: string;
  topic_1_content: string;
  topic_2_title: string;
  topic_2_content: string;
  topic_3_title: string;
  topic_3_content: string;
  sources: any;
}

export function IndustryUpdates() {
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustryUpdates();
  }, []);

  const loadIndustryUpdates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile and assessment
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: assessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setUserProfile({ ...profile, ...assessment });

      // Get industry updates for user's role and industry
      const { data: updates } = await supabase
        .from('industry_updates')
        .select('*')
        .eq('role_type', profile?.role || 'CEO')
        .eq('industry_category', assessment?.industry_category || 'Technology')
        .order('week_of', { ascending: false })
        .limit(4);

      setUpdates(updates || []);

    } catch (error) {
      console.error('Error loading industry updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading industry updates...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Industry Knowledge Updates</h1>
        <p className="text-gray-600">
          Weekly insights for {userProfile?.role}s in {userProfile?.industry_category}
        </p>
      </div>

      <div className="space-y-6">
        {updates.map((update) => (
          <Card key={update.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">
                  Week of {new Date(update.week_of).toLocaleDateString()}
                </CardTitle>
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  Latest
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  {update.topic_1_title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {update.topic_1_content}
                </p>
              </div>

              {/* Topic 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  {update.topic_2_title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {update.topic_2_content}
                </p>
              </div>

              {/* Topic 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                  {update.topic_3_title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {update.topic_3_content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min read
                </div>
                <Badge variant="secondary">
                  {userProfile?.role} • {userProfile?.industry_category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 3: PEER NETWORKING SYSTEM

### 1. Create Community Structure

**New File:** `src/components/community/CommunityHub.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  description: string;
  community_type: string;
  member_count: number;
  is_member: boolean;
  recent_activity: number;
}

export function CommunityHub() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile for community matching
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: assessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get recommended communities based on role and industry
      const { data: allCommunities } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships!inner(user_id)
        `);

      // Get user's current communities
      const { data: userMemberships } = await supabase
        .from('community_memberships')
        .select('community_id')
        .eq('user_id', user.id);

      const userCommunityIds = userMemberships?.map(m => m.community_id) || [];

      // Filter and categorize communities
      const recommendedCommunities = allCommunities?.filter(community => {
        const roleMatch = community.role_filter === profile?.role || community.role_filter === 'all';
        const industryMatch = community.industry_filter === assessment?.industry_category || community.industry_filter === 'all';
        return (roleMatch || industryMatch) && !userCommunityIds.includes(community.id);
      }) || [];

      const joinedCommunities = allCommunities?.filter(community => 
        userCommunityIds.includes(community.id)
      ) || [];

      setCommunities(recommendedCommunities);
      setUserCommunities(joinedCommunities);

    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('community_memberships').insert({
        user_id: user.id,
        community_id: communityId,
        role: 'member'
      });

      // Refresh communities
      loadCommunities();

    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading communities...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Professional Communities</h1>
        <p className="text-gray-600">
          Connect with peers in your industry and role for knowledge sharing and networking.
        </p>
      </div>

      {/* User's Communities */}
      {userCommunities.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Your Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCommunities.map((community) => (
              <CommunityCard 
                key={community.id} 
                community={community} 
                isMember={true}
                onJoin={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Communities */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              isMember={false}
              onJoin={() => joinCommunity(community.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityCard({ community, isMember, onJoin }: {
  community: Community;
  isMember: boolean;
  onJoin: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{community.name}</CardTitle>
        <Badge variant={community.community_type === 'role' ? 'default' : 'secondary'}>
          {community.community_type === 'role' ? 'Role-Based' : 'Industry-Based'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{community.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {community.member_count} members
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {community.recent_activity} recent posts
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={isMember ? () => window.location.href = `/community/${community.id}` : onJoin}
        >
          {isMember ? 'Enter Community' : 'Join Community'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2. Create Messaging System

**New File:** `src/components/community/CommunityChat.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Hash, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  user_id: string;
  message_content: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

interface Channel {
  name: string;
  description: string;
  message_count: number;
}

export function CommunityChat({ communityId }: { communityId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [channels] = useState<Channel[]>([
    { name: 'general', description: 'General discussion', message_count: 0 },
    { name: 'ai-tools', description: 'AI tool recommendations', message_count: 0 },
    { name: 'industry-news', description: 'Latest industry updates', message_count: 0 },
    { name: 'ask-experts', description: 'Q&A with experts', message_count: 0 },
    { name: 'success-stories', description: 'Implementation wins', message_count: 0 }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [communityId, activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles!inner(full_name, role)
        `)
        .eq('community_id', communityId)
        .eq('channel_name', activeChannel)
        .order('created_at', { ascending: true })
        .limit(50);

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        user_id: msg.user_id,
        message_content: msg.message_content,
        created_at: msg.created_at,
        user_name: msg.profiles.full_name,
        user_role: msg.profiles.role
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`community-${communityId}-${activeChannel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${communityId}`
      }, (payload) => {
        if (payload.new.channel_name === activeChannel) {
          // Fetch the complete message with user info
          loadMessages();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('community_messages').insert({
        community_id: communityId,
        user_id: user.id,
        channel_name: activeChannel,
        message_content: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen max-h-[800px]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Channels</h3>
        </div>
        <div className="p-2">
          {channels.map((channel) => (
            <button
              key={channel.name}
              onClick={() => setActiveChannel(channel.name)}
              className={`w-full text-left p-2 rounded hover:bg-gray-200 flex items-center ${
                activeChannel === channel.name ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              <Hash className="w-4 h-4 mr-2" />
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              <h2 className="font-semibold">#{activeChannel}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm text-gray-600">24 members</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {message.user_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{message.user_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {message.user_role}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.message_content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${activeChannel}`}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 4: CONSULTING SERVICES

### 1. Create Consulting Services Hub

**New File:** `src/components/consulting/ConsultingHub.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConsultingService {
  id: string;
  service_type: string;
  service_name: string;
  description: string;
  duration_weeks: number;
  price_usd: number;
  delivery_method: string;
  max_participants: number;
  features: string[];
}

export function ConsultingHub() {
  const [services, setServices] = useState<ConsultingService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultingServices();
  }, []);

  const loadConsultingServices = async () => {
    try {
      const { data } = await supabase
        .from('consulting_services')
        .select('*')
        .order('price_usd', { ascending: true });

      setServices(data || []);
    } catch (error) {
      console.error('Error loading consulting services:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookService = async (serviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const service = services.find(s => s.id === serviceId);
      if (!service) return;

      await supabase.from('service_bookings').insert({
        user_id: user.id,
        service_id: serviceId,
        booking_status: 'pending',
        total_amount: service.price_usd
      });

      alert('Service booking request submitted! We will contact you within 24 hours.');
      
    } catch (error) {
      console.error('Error booking service:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'training', name: 'Training & Education' },
    { id: 'deep_dive', name: 'Deep Dive Classes' },
    { id: 'assessment', name: 'Business Assessment' },
    { id: 'implementation', name: 'AI Implementation' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.service_type === selectedCategory);

  if (loading) {
    return <div className="flex justify-center p-8">Loading consulting services...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Consulting Services</h1>
        <p className="text-gray-600">
          Expert-led consulting services to accelerate your AI implementation journey.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onBook={() => bookService(service.id)}
          />
        ))}
      </div>

      {/* Special "DO IT NOW" Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">Ready to Implement AI Now?</h2>
          <p className="text-gray-600 mb-6">
            Skip the planning phase and get a working AI solution in 3 weeks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Automated Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                AI-powered financial dashboards and executive reports
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  3-week delivery
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  $25,000 fixed price
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => bookService('quick-reporting')}>
                DO IT NOW
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">AI Customer Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Intelligent chatbot with knowledge base integration
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  3-week delivery
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  $25,000 fixed price
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => bookService('quick-customer-service')}>
                DO IT NOW
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Document Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Automated contract analysis and data extraction
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  3-week delivery
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  $25,000 fixed price
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => bookService('quick-document-processing')}>
                DO IT NOW
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, onBook }: {
  service: ConsultingService;
  onBook: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{service.service_name}</CardTitle>
          <Badge variant="outline">
            {service.service_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{service.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Duration:
            </div>
            <span className="font-medium">{service.duration_weeks} weeks</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Investment:
            </div>
            <span className="font-medium">${service.price_usd.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Delivery:
            </div>
            <Badge variant="secondary" className="text-xs">
              {service.delivery_method}
            </Badge>
          </div>
        </div>

        {service.features && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Includes:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {service.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button className="w-full" onClick={onBook}>
          Book Consultation
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## DATABASE MIGRATIONS

**Add these tables to your Supabase database:**

```sql
-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  community_type TEXT CHECK (community_type IN ('role', 'industry', 'hybrid')),
  role_filter TEXT,
  industry_filter TEXT,
  member_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community memberships
CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Community messages
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name TEXT DEFAULT 'general',
  message_content TEXT NOT NULL,
  parent_message_id UUID REFERENCES community_messages(id),
  attachments JSONB,
  mentions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Industry updates table
CREATE TABLE IF NOT EXISTS industry_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL,
  industry_category TEXT NOT NULL,
  industry_subcategory TEXT,
  week_of DATE NOT NULL,
  topic_1_title TEXT NOT NULL,
  topic_1_content TEXT NOT NULL,
  topic_2_title TEXT NOT NULL,
  topic_2_content TEXT NOT NULL,
  topic_3_title TEXT NOT NULL,
  topic_3_content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consulting services table
CREATE TABLE IF NOT EXISTS consulting_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT CHECK (service_type IN ('training', 'deep_dive', 'assessment', 'implementation')),
  service_name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  price_usd INTEGER,
  delivery_method TEXT CHECK (delivery_method IN ('remote', 'onsite', 'hybrid')),
  max_participants INTEGER,
  features TEXT[],
  prerequisites TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service bookings
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES consulting_services(id) ON DELETE CASCADE,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  total_amount INTEGER,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);
CREATE POLICY "Users can view their memberships" ON community_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join communities" ON community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Community members can view messages" ON community_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_memberships 
    WHERE community_id = community_messages.community_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Community members can send messages" ON community_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM community_memberships 
    WHERE community_id = community_messages.community_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Industry updates are viewable by everyone" ON industry_updates FOR SELECT USING (true);
CREATE POLICY "Consulting services are viewable by everyone" ON consulting_services FOR SELECT USING (true);
CREATE POLICY "Users can view their bookings" ON service_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## ROUTING UPDATES

**Update your main App.tsx to include new routes:**

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EnhancedAssessment } from '@/components/onboarding/Assessment';
import { PersonalProductivity } from '@/components/onboarding/PersonalProductivity';
import { IndustryUpdates } from '@/components/knowledge/IndustryUpdates';
import { CommunityHub } from '@/components/community/CommunityHub';
import { CommunityChat } from '@/components/community/CommunityChat';
import { ConsultingHub } from '@/components/consulting/ConsultingHub';

// Add these routes to your existing routing structure
<Routes>
  {/* Existing routes */}
  
  {/* New enhanced routes */}
  <Route path="/assessment" element={<EnhancedAssessment />} />
  <Route path="/onboarding/personalized" element={<PersonalProductivity />} />
  <Route path="/knowledge/updates" element={<IndustryUpdates />} />
  <Route path="/community" element={<CommunityHub />} />
  <Route path="/community/:id" element={<CommunityChat />} />
  <Route path="/consulting" element={<ConsultingHub />} />
</Routes>
```

---

## IMPLEMENTATION PRIORITY

1. **Week 1**: Enhanced Assessment System + Database setup
2. **Week 2**: Personal Productivity Module + Industry Updates
3. **Week 3**: Community Hub + Basic Messaging
4. **Week 4**: Consulting Services + "DO IT NOW" functionality
5. **Week 5**: Real-time messaging + Polish

This implementation builds upon your existing Smart Exec Suite architecture and adds the comprehensive functionality described in your requirements. Each component is designed to work with your current Supabase setup and React/TypeScript structure.

