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
    const { farmerId, cropTypes } = await req.json();
    
    if (!farmerId) {
      throw new Error('Missing farmer ID');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch farmer profile
    const { data: farmer } = await supabaseClient
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    // Fetch crops
    const { data: crops } = await supabaseClient
      .from('crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'active');

    // Determine crops to analyze
    const cropsToAnalyze = cropTypes || crops?.map(c => c.crop_type) || [];

    // Fetch market data for each crop
    const marketData = await Promise.all(
      cropsToAnalyze.map(async (cropType: string) => {
        const [priceHistory, demandForecasts, trends, alerts] = await Promise.all([
          supabaseClient
            .from('crop_price_history')
            .select('*')
            .eq('crop_type', cropType)
            .order('recorded_date', { ascending: false })
            .limit(30),
          supabaseClient
            .from('market_demand_forecasts')
            .select('*')
            .eq('crop_type', cropType)
            .order('forecast_date', { ascending: false })
            .limit(10),
          supabaseClient
            .from('market_trends')
            .select('*')
            .eq('crop_type', cropType)
            .order('analysis_date', { ascending: false })
            .limit(5),
          supabaseClient
            .from('market_alerts')
            .select('*')
            .eq('crop_type', cropType)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        return {
          crop_type: cropType,
          price_history: priceHistory.data,
          demand_forecasts: demandForecasts.data,
          trends: trends.data,
          alerts: alerts.data
        };
      })
    );

    // Prepare AI prompt
    const analysisPrompt = `You are an expert agricultural market analyst providing strategic insights for farmers.

FARMER PROFILE:
- Location: ${farmer?.farm_location || 'Unknown'}
- Farm Size: ${farmer?.farm_size_acres || 'Unknown'} acres
- Primary Crops: ${farmer?.primary_crops?.join(', ') || 'Unknown'}

ACTIVE CROPS:
${crops?.map(c => `- ${c.crop_name} (${c.crop_type}): Planted ${c.planting_date}, Harvest ${c.expected_harvest_date}`).join('\n') || 'No active crops'}

MARKET DATA BY CROP:
${JSON.stringify(marketData, null, 2)}

Generate comprehensive market insights in JSON format:
{
  "overall_market_pulse": {
    "status": "bullish" | "bearish" | "stable",
    "confidence": <0-1>,
    "summary": "string"
  },
  "crop_insights": [
    {
      "crop_type": "string",
      "current_price_trend": "increasing" | "decreasing" | "stable",
      "demand_outlook": "high" | "medium" | "low",
      "supply_situation": "shortage" | "balanced" | "surplus",
      "best_selling_window": {
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "expected_price_range": {
          "min": <number>,
          "max": <number>
        }
      },
      "risk_factors": ["string"],
      "opportunities": ["string"],
      "competitor_activity": "string",
      "export_potential": {
        "viable": boolean,
        "target_markets": ["string"],
        "premium_percentage": <number>
      }
    }
  ],
  "strategic_recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "action": "string",
      "expected_impact": "string",
      "timeline": "string",
      "effort_required": "low" | "medium" | "high"
    }
  ],
  "price_alerts_suggested": [
    {
      "crop_type": "string",
      "target_price": <number>,
      "rationale": "string"
    }
  ],
  "market_timing": {
    "crops_to_sell_now": ["string"],
    "crops_to_hold": ["string"],
    "reason": "string"
  },
  "negotiation_tips": [
    {
      "scenario": "string",
      "tactic": "string",
      "expected_outcome": "string"
    }
  ]
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
            content: 'You are an expert agricultural market strategist. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.4,
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
    let insights;
    try {
      const jsonContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI insights');
    }

    // Create price alerts based on suggestions
    if (insights.price_alerts_suggested) {
      const alertsToInsert = insights.price_alerts_suggested.map((alert: any) => ({
        farmer_id: farmerId,
        crop_type: alert.crop_type,
        target_price: alert.target_price,
        alert_condition: 'above',
        is_active: true
      }));

      await supabaseClient
        .from('price_alerts')
        .insert(alertsToInsert);
    }

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-market-insights:', error);
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
