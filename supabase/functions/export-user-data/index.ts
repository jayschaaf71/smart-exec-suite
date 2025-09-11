import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, format = 'json', includeAnalytics = false } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Fetch user data
    const fetchData = async (table: string, query: string = '*') => {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?user_id=eq.${userId}&select=${query}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    };

    const [
      profile,
      stats,
      achievements,
      learningProgress,
      implementationProgress,
      toolInteractions,
      notifications
    ] = await Promise.all([
      fetchData('profiles'),
      fetchData('user_stats'),
      fetchData('user_achievements', '*, achievements(*)'),
      fetchData('user_learning_progress', '*, learning_modules(title), learning_paths(title)'),
      fetchData('user_implementation_progress', '*, implementation_guides(title)'),
      fetchData('user_tool_interactions', '*, tools(name)'),
      fetchData('notifications')
    ]);

    let analyticsData = {};
    if (includeAnalytics) {
      const [events, summary, insights] = await Promise.all([
        fetchData('user_analytics_events'),
        fetchData('user_analytics_summary'),
        fetchData('user_behavior_insights')
      ]);
      analyticsData = { events, summary, insights };
    }

    const exportData = {
      exportMetadata: {
        userId,
        exportDate: new Date().toISOString(),
        format,
        version: '1.0'
      },
      profile: profile[0] || null,
      stats: stats[0] || null,
      achievements: achievements || [],
      learningProgress: learningProgress || [],
      implementationProgress: implementationProgress || [],
      toolInteractions: toolInteractions || [],
      notifications: notifications || [],
      ...(includeAnalytics && { analytics: analyticsData })
    };

    if (format === 'csv') {
      // Convert to CSV format for key metrics
      const csvData = [
        ['Metric', 'Value'],
        ['Level', exportData.stats?.level_title || 'AI Novice'],
        ['Total Points', exportData.stats?.total_points || 0],
        ['Guides Completed', exportData.stats?.guides_completed || 0],
        ['Tools Implemented', exportData.stats?.tools_implemented || 0],
        ['Achievements Earned', exportData.stats?.achievements_earned || 0],
        ['Modules Completed', exportData.stats?.modules_completed || 0],
        ['Total Time Invested (minutes)', exportData.stats?.total_time_invested_minutes || 0],
        ['Streak Days', exportData.stats?.streak_days || 0],
        ['Last Activity', exportData.stats?.last_activity_date || 'N/A']
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="smart-exec-export-${userId.slice(0, 8)}.csv"`
        }
      });
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to export data',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});