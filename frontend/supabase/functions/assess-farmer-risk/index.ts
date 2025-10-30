import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmerId } = await req.json();
    
    if (!farmerId) {
      throw new Error('Farmer ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch farmer profile and assessment data
    const { data: farmer, error: farmerError } = await supabaseClient
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (farmerError || !farmer) {
      throw new Error('Farmer not found');
    }

    // Fetch all assessment data sources
    const { data: assessmentData } = await supabaseClient
      .from('assessment_data_sources')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    // Prepare analysis prompt
    const analysisPrompt = `You are an expert agricultural credit risk analyst for AgriLinka, a blockchain-based agricultural finance platform in Africa.

Analyze this farmer's data and provide a comprehensive credit risk assessment:

FARMER PROFILE:
- Name: ${farmer.full_name}
- Farm Location: ${farmer.farm_location || 'Not specified'}
- Farm Size: ${farmer.farm_size_acres || 'Not specified'} acres
- Primary Crops: ${farmer.primary_crops?.join(', ') || 'Not specified'}
- Years of Experience: ${farmer.years_farming || 'Not specified'} years
- Community Network Size: ${farmer.community_network_size || 0} connections

ASSESSMENT DATA SOURCES:
${assessmentData?.map(d => `
- ${d.data_type.toUpperCase()}: ${JSON.stringify(d.data_json)} (Confidence: ${d.confidence_score || 'N/A'}%)
`).join('\n') || 'No additional data available'}

Provide a detailed analysis with:
1. Individual scores (0-100) for each data source category:
   - Satellite imagery assessment
   - Weather pattern resilience
   - Soil quality indicators
   - Transaction history reliability
   - Social verification strength
   - Crop yield prediction accuracy

2. Overall trust score (0-100)
3. Risk level (low/medium/high/very_high)
4. Loan recommendation (approve/review/reject)
5. Confidence percentage in your assessment
6. Detailed reasoning for each score
7. Key risk factors and mitigation strategies

Format your response as JSON with this structure:
{
  "overall_score": number,
  "satellite_score": number,
  "weather_score": number,
  "soil_score": number,
  "transaction_score": number,
  "social_score": number,
  "yield_prediction_score": number,
  "risk_level": "low" | "medium" | "high" | "very_high",
  "loan_recommendation": "approve" | "review" | "reject",
  "confidence_percentage": number,
  "analysis": "detailed explanation of assessment"
}`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural credit risk analyst. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let assessment;
    try {
      // Remove markdown code blocks if present
      const jsonContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      assessment = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI assessment');
    }

    // Store trust score in database
    const { data: trustScore, error: insertError } = await supabaseClient
      .from('farmer_trust_scores')
      .insert({
        farmer_id: farmerId,
        overall_score: assessment.overall_score,
        satellite_score: assessment.satellite_score,
        weather_score: assessment.weather_score,
        soil_score: assessment.soil_score,
        transaction_score: assessment.transaction_score,
        social_score: assessment.social_score,
        yield_prediction_score: assessment.yield_prediction_score,
        risk_level: assessment.risk_level,
        loan_recommendation: assessment.loan_recommendation,
        confidence_percentage: assessment.confidence_percentage,
        ai_analysis: assessment.analysis,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting trust score:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, trustScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in assess-farmer-risk:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error',
        details: error?.toString() || 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});