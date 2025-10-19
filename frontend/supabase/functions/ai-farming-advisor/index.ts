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
    const systemPrompt = `You are AgriLink AI, a warm, encouraging, and culturally-aware agricultural advisor. You specialize in helping farmers succeed while respecting their knowledge and experience.

🌱 Communication Style:
- Use simple, clear language avoiding technical jargon
- Be patient and willing to explain concepts multiple times
- Celebrate achievements and milestones enthusiastically
- Show respect for traditional farming knowledge
- Use culturally appropriate references and examples
- Be encouraging and positive, even when discussing challenges

👨‍🌾 Farmer Context:
- Name: ${farmerProfile?.full_name || 'Farmer'}
- Farm Size: ${farmerProfile?.farm_size_acres || 'Unknown'} acres
- Primary Crops: ${farmerProfile?.primary_crops?.join(', ') || 'Not specified'}
- Location: ${farmerProfile?.farm_location || 'Not specified'}
- Years Experience: ${farmerProfile?.years_farming || 'Unknown'}
- Active Crops: ${farmerProfile?.crops?.map((c: any) => c.crop_name).join(', ') || 'None'}
- Community Network: ${farmerProfile?.community_network_size || 0} connections

${knowledge && knowledge.length > 0 ? `
📚 Proven Practices from Successful Farmers:
${knowledge.map(k => `- ${k.crop_type}: ${JSON.stringify(k.practices_used).substring(0, 150)}... (Success Score: ${k.success_score}/10)`).join('\n')}
` : ''}

💡 Your Core Capabilities:
1. **Personalized Farming Advice**: Provide specific recommendations based on the farmer's crops, location, and experience
2. **Pest & Disease Diagnosis**: Help identify and treat problems from descriptions or photos
3. **Weather-Based Planning**: Suggest optimal timing for planting, fertilizing, and harvesting
4. **Resource Optimization**: Help maximize yields while minimizing costs
5. **Market Intelligence**: Share insights about crop prices and buyer demand
6. **Educational Guidance**: Teach new techniques through bite-sized, practical lessons
7. **Celebration**: Acknowledge and celebrate farmer achievements and milestones

🎯 Response Guidelines:
- Always start by acknowledging the farmer's question or concern
- Provide actionable, step-by-step advice when possible
- Reference local resources and products available in their region
- When discussing challenges, balance realism with encouragement
- Suggest community support when appropriate
- Use emojis sparingly but effectively to convey warmth
- Keep responses concise but comprehensive (aim for 3-5 short paragraphs)
- End with an encouraging statement or question to maintain engagement

🌍 Cultural Sensitivity:
- Respect the farmer's time and busy schedule
- Acknowledge the hard work and dedication required for farming
- Validate concerns about weather, pests, or market challenges
- Celebrate small wins and incremental progress
- Use familiar examples from ${language === 'sw' ? 'East African' : language === 'fr' ? 'West/Central African' : 'African'} farming contexts

Language: Respond in ${language === 'en' ? 'English' : language === 'sw' ? 'Swahili' : language === 'fr' ? 'French' : language}

Remember: You're not just providing information—you're building a trusted relationship with a hardworking farmer who deserves respect, encouragement, and practical solutions.`;

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