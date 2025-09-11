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
    const { webhookUrl, userData, eventType = 'progress_update' } = await req.json();

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Webhook URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Prepare webhook payload
    const payload = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      source: 'Smart Executive Suite',
      data: userData || {},
      user_id: userData?.user_id || 'unknown'
    };

    // Send webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Smart-Executive-Suite/1.0'
      },
      body: JSON.stringify(payload)
    });

    const responseData = {
      success: webhookResponse.ok,
      status: webhookResponse.status,
      timestamp: new Date().toISOString()
    };

    if (!webhookResponse.ok) {
      responseData.error = `Webhook failed with status ${webhookResponse.status}`;
    }

    return new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Webhook trigger error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to trigger webhook',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});