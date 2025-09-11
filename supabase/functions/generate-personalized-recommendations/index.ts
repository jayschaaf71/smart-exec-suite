import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  role: string;
  industry: string;
  ai_experience: string;
  goals: string[];
  primary_focus_areas: string[];
  company_size: string;
  time_availability: string;
}

interface AnalyticsData {
  total_sessions: number;
  total_tool_interactions: number;
  preferred_tool_categories: string[];
  most_active_hour_of_day: number;
  avg_session_duration_minutes: number;
  engagement_score: number;
}

interface UserBehaviorData {
  modules_completed: number;
  guides_completed: number;
  tools_implemented: number;
  streak_days: number;
  total_points: number;
  achievements_earned: number;
  last_activity_date: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, contextType = 'general' } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating personalized recommendations for user: ${userId}, context: ${contextType}`);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch analytics data
    const { data: analytics } = await supabase
      .from('user_analytics_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch user stats
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent tool interactions
    const { data: recentInteractions } = await supabase
      .from('user_tool_interactions')
      .select(`
        *,
        tool:tools(name, category_id, target_roles, target_industries)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch available tools
    const { data: availableTools } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'active');

    // Create user behavior summary for AI analysis
    const userContext = {
      profile: profile as UserProfile,
      analytics: analytics as AnalyticsData,
      behavior: userStats as UserBehaviorData,
      recentInteractions: recentInteractions || [],
      availableTools: availableTools || [],
      contextType
    };

    // Generate AI-powered recommendations using Perplexity
    const recommendations = await generateAIRecommendations(perplexityApiKey, userContext);

    // Store recommendations in database
    for (const recommendation of recommendations) {
      const { error: insertError } = await supabase
        .from('tool_recommendations')
        .upsert({
          user_id: userId,
          tool_id: recommendation.toolId,
          recommendation_score: recommendation.score,
          reason: recommendation.reason,
          status: 'active'
        });

      if (insertError) {
        console.error('Error storing recommendation:', insertError);
      }
    }

    console.log(`Generated ${recommendations.length} personalized recommendations`);

    return new Response(
      JSON.stringify({ 
        recommendations,
        generated_at: new Date().toISOString(),
        context: contextType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-personalized-recommendations:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAIRecommendations(apiKey: string, userContext: any) {
  const prompt = createPersonalizationPrompt(userContext);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an AI recommendation engine for business AI tools. Analyze user data and recommend the most suitable tools based on their profile, behavior, and current needs. 

Return your response as a JSON array of recommendations, each with:
- toolId: The ID of the recommended tool from the available tools
- toolName: The name of the tool
- score: Relevance score (0-100)
- reason: Brief explanation why this tool is recommended
- priority: "high", "medium", or "low"
- category: The tool category

Focus on tools that match the user's:
1. Role and industry
2. AI experience level
3. Current goals and focus areas
4. Usage patterns and engagement
5. Company size and time availability

Prioritize tools they haven't interacted with recently but align with their demonstrated interests.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response as JSON
    try {
      const recommendations = JSON.parse(aiResponse);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Response:', aiResponse);
      
      // Fallback to rule-based recommendations
      return generateFallbackRecommendations(userContext);
    }

  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    return generateFallbackRecommendations(userContext);
  }
}

function createPersonalizationPrompt(userContext: any): string {
  const { profile, analytics, behavior, recentInteractions, availableTools, contextType } = userContext;

  return `
USER PROFILE:
- Role: ${profile?.role || 'Unknown'}
- Industry: ${profile?.industry || 'Unknown'}
- AI Experience: ${profile?.ai_experience || 'beginner'}
- Company Size: ${profile?.company_size || 'Unknown'}
- Goals: ${profile?.goals?.join(', ') || 'Not specified'}
- Focus Areas: ${profile?.primary_focus_areas?.join(', ') || 'Not specified'}
- Time Availability: ${profile?.time_availability || 'Unknown'}

USER BEHAVIOR & ANALYTICS:
- Total Points: ${behavior?.total_points || 0}
- Streak Days: ${behavior?.streak_days || 0}
- Modules Completed: ${behavior?.modules_completed || 0}
- Guides Completed: ${behavior?.guides_completed || 0}
- Tools Implemented: ${behavior?.tools_implemented || 0}
- Achievements Earned: ${behavior?.achievements_earned || 0}
- Engagement Score: ${analytics?.engagement_score || 0}
- Preferred Categories: ${analytics?.preferred_tool_categories?.join(', ') || 'None'}
- Avg Session Duration: ${analytics?.avg_session_duration_minutes || 0} minutes

RECENT INTERACTIONS:
${recentInteractions?.map((interaction: any) => 
  `- ${interaction.tool?.name} (${interaction.interaction_type}) - ${interaction.created_at}`
).join('\n') || 'No recent interactions'}

AVAILABLE TOOLS:
${availableTools?.map((tool: any) => 
  `- ID: ${tool.id}, Name: ${tool.name}, Category: ${tool.category_id}, Roles: ${tool.target_roles?.join(', ')}, Industries: ${tool.target_industries?.join(', ')}, Rating: ${tool.user_rating || 0}/5`
).join('\n') || 'No tools available'}

CONTEXT: ${contextType}

Based on this data, recommend 3-5 AI tools that would be most valuable for this user right now. Consider their experience level, current progress, and demonstrated interests. Avoid tools they've recently interacted with unless there's a compelling reason to revisit them.

Return as valid JSON array only, no additional text.
`;
}

function generateFallbackRecommendations(userContext: any) {
  console.log('Using fallback recommendation logic');
  
  const { profile, availableTools, recentInteractions } = userContext;
  const recentToolIds = new Set(recentInteractions?.map((i: any) => i.tool_id) || []);
  
  // Simple rule-based recommendations as fallback
  const recommendations = [];
  const filteredTools = availableTools?.filter((tool: any) => 
    !recentToolIds.has(tool.id) &&
    (tool.target_roles?.includes(profile?.role) || 
     tool.target_industries?.includes(profile?.industry))
  ) || [];

  // Take top 3 tools based on rating
  const topTools = filteredTools
    .sort((a: any, b: any) => (b.user_rating || 0) - (a.user_rating || 0))
    .slice(0, 3);

  topTools.forEach((tool: any, index: number) => {
    recommendations.push({
      toolId: tool.id,
      toolName: tool.name,
      score: Math.max(70 - (index * 10), 50),
      reason: `Highly rated tool suitable for ${profile?.role}s in ${profile?.industry}`,
      priority: index === 0 ? 'high' : 'medium',
      category: tool.category_id || 'general'
    });
  });

  return recommendations;
}