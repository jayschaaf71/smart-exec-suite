import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentRequest {
  assessmentType: 'consulting' | 'organization' | 'strategy';
  userProfile: {
    role: string;
    industry: string;
    company_size: string;
    ai_experience: string;
    goals: string[];
    time_availability: string;
    implementation_timeline: string;
  };
  specificContext?: {
    [key: string]: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { assessmentType, userProfile, specificContext }: AssessmentRequest = await req.json();

    // Get authorization header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Create assessment-specific prompts
    const systemPrompt = generateSystemPrompt(assessmentType, userProfile);
    const userPrompt = generateUserPrompt(assessmentType, userProfile, specificContext);

    // Call Perplexity API for AI-powered insights
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: true,
        search_domain_filter: ['harvard.edu', 'mit.edu', 'mckinsey.com', 'deloitte.com', 'pwc.com'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;
    const relatedQuestions = aiResponse.related_questions || [];

    // Parse and structure the AI recommendations
    const recommendations = parseAIRecommendations(aiContent, assessmentType);

    // Calculate confidence score based on user profile completeness and AI response quality
    const confidenceScore = calculateConfidenceScore(userProfile, aiContent);

    // Store assessment in database
    const { data: assessment, error: insertError } = await supabase
      .from('ai_assessments')
      .insert({
        user_id: user.id,
        assessment_type: assessmentType,
        assessment_data: {
          userProfile,
          specificContext,
          relatedQuestions
        },
        ai_recommendations: recommendations,
        confidence_score: confidenceScore,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing assessment:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({
      assessment,
      recommendations,
      confidenceScore,
      relatedQuestions,
      rawAIResponse: aiContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assessment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'AI assessment failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSystemPrompt(assessmentType: string, userProfile: any): string {
  const basePrompt = `You are an expert AI consultant specializing in helping ${userProfile.role}s in the ${userProfile.industry} industry implement AI solutions effectively.`;
  
  switch (assessmentType) {
    case 'consulting':
      return `${basePrompt} 

Your task is to provide a comprehensive consulting assessment that includes:
1. Current AI readiness analysis
2. Specific challenges and opportunities for their role and industry
3. Recommended implementation roadmap with timelines
4. ROI projections and success metrics
5. Risk assessment and mitigation strategies
6. Vendor/tool recommendations with rationale
7. Change management considerations

Focus on actionable, data-driven recommendations that align with their stated goals and timeline. Use current industry best practices and cite relevant case studies when possible.`;

    case 'organization':
      return `${basePrompt}

Your task is to assess their organization's AI transformation potential, including:
1. Organizational readiness for AI adoption
2. Cultural and structural changes needed
3. Skills gaps and training requirements
4. Technology infrastructure assessment
5. Budget and resource allocation recommendations
6. Governance and compliance considerations
7. Competitive positioning analysis

Provide strategic recommendations that consider their company size, industry dynamics, and current AI maturity level.`;

    case 'strategy':
      return `${basePrompt}

Your task is to develop a strategic AI vision and roadmap, including:
1. AI strategy alignment with business objectives
2. Priority use cases and quick wins
3. Long-term transformation vision
4. Innovation opportunities and competitive advantages
5. Partnership and acquisition strategies
6. Technology stack recommendations
7. Success measurement framework

Focus on strategic planning and high-level direction that positions them for long-term success in AI adoption.`;

    default:
      return basePrompt;
  }
}

function generateUserPrompt(assessmentType: string, userProfile: any, specificContext?: any): string {
  return `Please provide a detailed AI assessment for the following profile:

Role: ${userProfile.role}
Industry: ${userProfile.industry}
Company Size: ${userProfile.company_size}
AI Experience: ${userProfile.ai_experience}
Primary Goals: ${userProfile.goals.join(', ')}
Time Availability: ${userProfile.time_availability}
Implementation Timeline: ${userProfile.implementation_timeline}

${specificContext ? `Additional Context: ${JSON.stringify(specificContext, null, 2)}` : ''}

Assessment Type: ${assessmentType}

Please provide a structured response with specific, actionable recommendations tailored to their profile. Include concrete steps, timelines, and expected outcomes. Focus on practical implementation advice that considers their constraints and objectives.`;
}

function parseAIRecommendations(aiContent: string, assessmentType: string): any {
  // Basic parsing - in production, this could be more sophisticated
  const sections = aiContent.split('\n\n');
  
  const recommendations = {
    summary: sections[0] || '',
    keyRecommendations: [],
    implementationSteps: [],
    timeline: '',
    expectedROI: '',
    riskFactors: [],
    nextActions: [],
    toolRecommendations: [],
    rawAnalysis: aiContent
  };

  // Extract structured information using regex patterns
  const stepPattern = /(\d+\.\s+[^\n]+)/g;
  const steps = aiContent.match(stepPattern) || [];
  recommendations.implementationSteps = steps.slice(0, 5);

  const toolPattern = /(tool|platform|software|solution):\s*([^\n,]+)/gi;
  const tools = aiContent.match(toolPattern) || [];
  recommendations.toolRecommendations = tools.slice(0, 3);

  // Extract key recommendations (lines starting with bullet points or numbers)
  const recommendationPattern = /^[\s]*[-•*]\s*(.+)$/gm;
  const keyRecs = aiContent.match(recommendationPattern) || [];
  recommendations.keyRecommendations = keyRecs.slice(0, 5);

  return recommendations;
}

function calculateConfidenceScore(userProfile: any, aiResponse: string): number {
  let score = 0.5; // Base score

  // Profile completeness (0.3 weight)
  const profileFields = ['role', 'industry', 'company_size', 'ai_experience'];
  const completedFields = profileFields.filter(field => userProfile[field] && userProfile[field].trim());
  score += (completedFields.length / profileFields.length) * 0.3;

  // Goals clarity (0.2 weight)
  if (userProfile.goals && userProfile.goals.length > 0) {
    score += 0.2;
  }

  // AI response quality indicators (0.3 weight)
  const responseLength = aiResponse.length;
  if (responseLength > 1000) score += 0.1;
  if (responseLength > 2000) score += 0.1;
  if (aiResponse.includes('recommendation')) score += 0.05;
  if (aiResponse.includes('timeline')) score += 0.05;

  // Industry-specific indicators (0.2 weight)
  const industryKeywords = ['finance', 'technology', 'healthcare', 'manufacturing'];
  if (industryKeywords.some(keyword => 
    userProfile.industry.toLowerCase().includes(keyword))) {
    score += 0.2;
  }

  return Math.min(1.0, Math.max(0.1, score));
}