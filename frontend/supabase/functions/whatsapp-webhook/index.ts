import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // WhatsApp webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
        return new Response(challenge, { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process WhatsApp message
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return new Response(JSON.stringify({ status: 'no_message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const from = message.from; // Phone number
    const messageText = message.text?.body;
    const messageType = message.type;

    console.log('Message from:', from, 'Type:', messageType, 'Text:', messageText);

    // Find farmer by phone number
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('phone_number', from)
      .maybeSingle();

    if (!farmer) {
      console.log('Farmer not found for phone:', from);
      // Could send a registration message here
      return new Response(JSON.stringify({ status: 'farmer_not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get or create WhatsApp session
    const { data: existingSession } = await supabase
      .from('farming_advice_sessions')
      .select('*')
      .eq('farmer_id', farmer.id)
      .eq('session_type', 'whatsapp')
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let sessionId = existingSession?.id;

    if (!existingSession) {
      const { data: newSession } = await supabase
        .from('farming_advice_sessions')
        .insert({
          farmer_id: farmer.id,
          session_type: 'whatsapp',
          language: 'en', // Could be detected from message
          messages: []
        })
        .select()
        .single();
      
      sessionId = newSession.id;
    }

    // Call AI advisor
    const advisorResponse = await fetch(`${supabaseUrl}/functions/v1/ai-farming-advisor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message: messageText,
        farmerId: farmer.id,
        language: 'en'
      })
    });

    const advisorData = await advisorResponse.json();

    // Send response back to WhatsApp
    // Note: This requires WhatsApp Business API credentials
    // For now, we log the response
    console.log('Would send to WhatsApp:', advisorData.response);

    // In production, you would send via WhatsApp API:
    // await sendWhatsAppMessage(from, advisorData.response);

    return new Response(
      JSON.stringify({ status: 'success', message: 'Message processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in whatsapp-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});