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
    const { cropType, region, qualityGrade, volume } = await req.json();
    
    if (!cropType) {
      throw new Error('Missing crop type');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch historical price data
    const { data: priceHistory } = await supabaseClient
      .from('crop_price_history')
      .select('*')
      .eq('crop_type', cropType)
      .order('recorded_date', { ascending: false })
      .limit(90); // Last 90 days

    // Fetch market demand forecasts
    const { data: demandForecasts } = await supabaseClient
      .from('market_demand_forecasts')
      .select('*')
      .eq('crop_type', cropType)
      .order('forecast_date', { ascending: false })
      .limit(30);

    // Fetch current market trends
    const { data: trends } = await supabaseClient
      .from('market_trends')
      .select('*')
      .eq('crop_type', cropType)
      .order('analysis_date', { ascending: false })
      .limit(10);

    // Prepare AI prompt for pricing analysis
    const analysisPrompt = `You are an expert agricultural commodity pricing analyst. Analyze the market data and provide dynamic pricing recommendations.

CROP INFORMATION:
- Crop Type: ${cropType}
- Region: ${region || 'General'}
- Quality Grade: ${qualityGrade || 'Standard'}
- Volume: ${volume ? `${volume} kg` : 'Not specified'}

HISTORICAL PRICE DATA (Last 90 days):
${priceHistory ? JSON.stringify(priceHistory.slice(0, 10), null, 2) : 'No data available'}

DEMAND FORECASTS:
${demandForecasts ? JSON.stringify(demandForecasts.slice(0, 5), null, 2) : 'No data available'}

MARKET TRENDS:
${trends ? JSON.stringify(trends, null, 2) : 'No data available'}

Provide a comprehensive pricing analysis in JSON format with:
{
  "recommended_price_per_kg": <number>,
  "price_range": {
    "min": <number>,
    "max": <number>
  },
  "confidence_score": <0-1>,
  "market_outlook": "bullish" | "bearish" | "stable",
  "price_trend": "increasing" | "decreasing" | "stable",
  "quality_premium_percentage": <number>,
  "volume_discount_percentage": <number>,
  "best_time_to_sell": {
    "recommendation": "immediate" | "wait_1_week" | "wait_2_weeks" | "wait_1_month",
    "expected_price_change_percentage": <number>
  },
  "market_factors": [
    {
      "factor": "string",
      "impact": "positive" | "negative" | "neutral",
      "weight": <0-1>
    }
  ],
  "competitive_analysis": {
    "current_market_average": <number>,
    "top_quartile_price": <number>,
    "your_position": "below_market" | "at_market" | "above_market"
  },
  "pricing_strategy": "premium" | "competitive" | "value",
  "detailed_reasoning": "string"
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
            content: 'You are an expert agricultural market analyst. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
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
    let analysis;
    try {
      const jsonContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI analysis');
    }

    // Store price recommendation in history
    await supabaseClient
      .from('crop_price_history')
      .insert({
        crop_type: cropType,
        region: region,
        price_per_kg: analysis.recommended_price_per_kg,
        quality_grade: qualityGrade,
        volume_kg: volume,
        source: 'ai_recommendation',
        recorded_date: new Date().toISOString().split('T')[0]
      });

    // Store market trend
    await supabaseClient
      .from('market_trends')
      .insert({
        crop_type: cropType,
        region: region,
        trend_type: 'price',
        trend_direction: analysis.price_trend,
        confidence_score: analysis.confidence_score,
        trend_data: {
          outlook: analysis.market_outlook,
          factors: analysis.market_factors,
          competitive_analysis: analysis.competitive_analysis
        },
        forecast_period: '30_days',
        analysis_date: new Date().toISOString().split('T')[0]
      });

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-market-pricing:', error);
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
