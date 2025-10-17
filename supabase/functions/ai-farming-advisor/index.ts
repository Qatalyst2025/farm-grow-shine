import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, farmerId, language = 'en', context } = await req.json();
    
    console.log('AI Advisor request:', { sessionId, farmerId, language, message: message?.substring(0, 50) });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch farmer profile and context
    const { data: farmerProfile } = await supabase
      .from('farmer_profiles')
      .select('*, crops(*)')
      .eq('id', farmerId)
      .single();

    // Fetch relevant knowledge from successful farmers
    const { data: knowledge } = await supabase
      .from('farmer_knowledge_base')
      .select('*')
      .eq('verified', true)
      .order('success_score', { ascending: false })
      .limit(5);

    // Fetch session history
    const { data: session } = await supabase
      .from('farming_advice_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    const conversationHistory = session?.messages || [];

    // Build system prompt with farmer context
    const systemPrompt = `You are AgriLink AI, an expert agricultural advisor specializing in African farming. 

Farmer Context:
- Farm Size: ${farmerProfile?.farm_size_acres || 'Unknown'} acres
- Primary Crops: ${farmerProfile?.primary_crops?.join(', ') || 'Not specified'}
- Location: ${farmerProfile?.farm_location || 'Not specified'}
- Years Experience: ${farmerProfile?.years_farming || 'Unknown'}
- Active Crops: ${farmerProfile?.crops?.map((c: any) => c.crop_name).join(', ') || 'None'}

${knowledge && knowledge.length > 0 ? `
Learnings from Successful Farmers:
${knowledge.map(k => `- ${k.crop_type}: ${JSON.stringify(k.practices_used).substring(0, 100)}... (Success Score: ${k.success_score})`).join('\n')}
` : ''}

Your role:
1. Provide personalized, practical advice based on the farmer's specific conditions
2. Consider local climate, soil conditions, and available resources
3. Suggest proven techniques from successful farmers in similar conditions
4. Alert about weather risks, pest threats, and market opportunities
5. Create actionable farming plans with clear steps
6. Communicate in simple, clear language suitable for ${language === 'en' ? 'English' : language === 'sw' ? 'Swahili' : language === 'fr' ? 'French' : 'the farmer\'s language'}

Always be encouraging, practical, and focus on solutions that work in real farming conditions.`;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiResponse = await response.json();
    const advisorMessage = aiResponse.choices[0].message.content;

    // Update or create session
    const updatedMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: advisorMessage, timestamp: new Date().toISOString() }
    ];

    if (session) {
      await supabase
        .from('farming_advice_sessions')
        .update({ 
          messages: updatedMessages,
          context_data: { ...session.context_data, ...context }
        })
        .eq('id', sessionId);
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: advisorMessage,
        sessionId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-farming-advisor:', error);
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