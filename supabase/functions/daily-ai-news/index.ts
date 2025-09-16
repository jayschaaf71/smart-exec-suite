import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  url?: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, forceRefresh = false } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have fresh news for today (unless force refresh)
    if (!forceRefresh) {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingNews, error: fetchError } = await supabase
        .from('daily_ai_news')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .order('created_at', { ascending: false });

      if (!fetchError && existingNews && existingNews.length > 0) {
        console.log('Returning cached news for user:', userId);
        return new Response(
          JSON.stringify({ news: existingNews }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, industry, primary_focus_areas')
      .eq('user_id', userId)
      .single();

    // Generate personalized AI news
    const newsItems = await generatePersonalizedNews(profile);

    // Store news in database
    const newsWithUserId = newsItems.map(item => ({
      ...item,
      user_id: userId,
      created_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('daily_ai_news')
      .insert(newsWithUserId);

    if (insertError) {
      console.error('Error storing news:', insertError);
    }

    console.log('Generated fresh news for user:', userId);
    return new Response(
      JSON.stringify({ news: newsWithUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-ai-news function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generatePersonalizedNews(profile: any): Promise<NewsItem[]> {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!perplexityApiKey) {
    console.log('No Perplexity API key found, using fallback news');
    return getFallbackNews();
  }

  try {
    // Create personalized prompt based on user profile
    const role = profile?.role || 'executive';
    const industry = profile?.industry || 'technology';
    const focusAreas = profile?.primary_focus_areas || ['productivity', 'automation'];
    
    const prompt = `Generate 5 recent AI news items specifically relevant for a ${role} in the ${industry} industry, focusing on ${focusAreas.join(', ')}. 

    Include news about:
    - AI tools and productivity solutions for executives
    - Financial AI and automation for CFOs
    - Business intelligence and analytics
    - AI implementation strategies and ROI
    - Industry-specific AI applications

    Format as JSON array with this exact structure:
    [
      {
        "title": "Clear, compelling headline",
        "summary": "2-3 sentence summary explaining relevance to CFOs/executives",
        "category": "one of: Financial AI, Productivity, Analytics, Strategy, Industry News",
        "importance": "high/medium/low based on business impact",
        "url": "https://example.com (if available, otherwise null)"
      }
    ]

    Focus on practical, actionable insights rather than technical details. Prioritize recent developments from the last 7 days.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI news curator specializing in business and financial AI updates for executives. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'week'
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from Perplexity API');
    }

    // Parse JSON response
    const newsItems = JSON.parse(content);
    
    // Add IDs and ensure proper format
    return newsItems.map((item: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary,
      category: item.category,
      importance: item.importance,
      url: item.url || null,
      created_at: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Error generating personalized news:', error);
    return getFallbackNews();
  }
}

function getFallbackNews(): NewsItem[] {
  const fallbackItems = [
    {
      id: `news-${Date.now()}-1`,
      title: "CFOs Report 40% ROI Increase from AI Automation Tools",
      summary: "Recent survey shows financial executives achieving significant returns through AI-powered accounting and forecasting solutions. Key adoption areas include automated financial reporting and predictive analytics.",
      category: "Financial AI",
      importance: "high" as const,
      url: null,
      created_at: new Date().toISOString()
    },
    {
      id: `news-${Date.now()}-2`,
      title: "New Business Intelligence AI Tools Streamline Executive Decision Making",
      summary: "Latest AI-powered analytics platforms are helping executives make faster, data-driven decisions. Tools now offer real-time insights and automated report generation.",
      category: "Analytics",
      importance: "medium" as const,
      url: null,
      created_at: new Date().toISOString()
    },
    {
      id: `news-${Date.now()}-3`,
      title: "Enterprise AI Implementation Strategies Show 60% Success Rate",
      summary: "Companies following structured AI adoption frameworks report higher success rates. Key factors include executive buy-in, clear ROI metrics, and phased rollout approaches.",
      category: "Strategy",
      importance: "medium" as const,
      url: null,
      created_at: new Date().toISOString()
    }
  ];

  return fallbackItems;
}