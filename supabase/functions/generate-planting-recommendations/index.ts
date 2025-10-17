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
    const { farmerId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching farmer data and market trends...');
    
    // Fetch farmer profile
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (!farmer) {
      throw new Error('Farmer not found');
    }

    // Fetch current crops
    const { data: currentCrops } = await supabase
      .from('crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'active');

    // Fetch all market forecasts for next 6 months
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    const { data: marketForecasts } = await supabase
      .from('market_demand_forecasts')
      .select('*')
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .lte('forecast_date', sixMonthsFromNow.toISOString().split('T')[0])
      .order('predicted_price_per_kg', { ascending: false });

    // Fetch purchase history to understand what sells well
    const { data: purchaseHistory } = await supabase
      .from('purchase_history')
      .select('crop_type, price_per_kg, quality_rating, quantity_kg')
      .order('purchase_date', { ascending: false })
      .limit(200);

    console.log('Generating AI-powered planting recommendations...');

    const aiPrompt = `You are an expert agricultural advisor specializing in crop planning and market optimization. Analyze the following data to provide strategic planting recommendations for a farmer.

Farmer Profile:
- Location: ${farmer.farm_location || 'Not specified'}
- Farm Size: ${farmer.farm_size_acres || 'Not specified'} acres
- Years Experience: ${farmer.years_farming || 'Not specified'}
- Primary Crops: ${farmer.primary_crops?.join(', ') || 'Various'}

Current Active Crops: ${currentCrops?.length || 0}
${currentCrops?.map(c => `- ${c.crop_name} (${c.crop_type}), planted ${c.planting_date}`).join('\n') || 'None'}

Market Forecast Data (Next 6 Months):
${marketForecasts?.slice(0, 20).map(f => `
- ${f.crop_type}: 
  Price: $${f.predicted_price_per_kg}/kg (${f.price_trend})
  Demand: ${f.predicted_demand_kg}kg (${f.demand_trend})
  Confidence: ${(f.confidence_score * 100).toFixed(0)}%
  Date: ${f.forecast_date}
`).join('\n') || 'No forecast data'}

Historical Sales Performance:
${purchaseHistory?.slice(0, 15).map(p => `- ${p.crop_type}: $${p.price_per_kg}/kg, ${p.quantity_kg}kg sold, Quality: ${p.quality_rating}/5`).join('\n') || 'No history'}

Based on this data, provide 3-5 strategic planting recommendations that will maximize the farmer's profitability. Consider:
1. Market demand trends and price predictions
2. Optimal planting times for harvest timing
3. Crop diversification to reduce risk
4. Competition levels (if many farmers grow the same crop)
5. Premium market opportunities (organic, specialty crops)

For each recommendation, calculate:
- Recommended planting date (format: YYYY-MM-DD)
- Expected harvest date (format: YYYY-MM-DD, considering typical growing periods)
- Predicted market price at harvest
- Expected profit per acre
- Demand level (low/medium/high/very_high)
- Competition level (low/medium/high)

Return ONLY a JSON array, no other text:
[{
  "cropType": "tomatoes",
  "recommendedPlantingDate": "2025-03-15",
  "expectedHarvestDate": "2025-07-20",
  "predictedMarketPrice": 3.50,
  "predictedDemandLevel": "high",
  "expectedProfitPerAcre": 12000,
  "confidenceScore": 0.85,
  "competitionLevel": "medium",
  "reasoning": {
    "marketTiming": "Harvest aligns with peak demand season",
    "priceTrend": "Prices expected to rise 15% by harvest",
    "demandForecast": "Strong buyer interest, low supply expected",
    "riskFactors": "Weather dependency, moderate competition"
  },
  "marketForecast": {
    "expectedDemand": "25000kg",
    "priceRange": "3.20-3.80",
    "competitors": "12 other farms"
  },
  "weatherFactors": {
    "optimalSeason": "Spring planting for summer harvest",
    "riskLevel": "low"
  }
}]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor. Respond only with valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response received');

    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Insert recommendations into database
    const recommendationInserts = recommendations.map((rec: any) => ({
      farmer_id: farmerId,
      crop_type: rec.cropType,
      recommended_planting_date: rec.recommendedPlantingDate,
      expected_harvest_date: rec.expectedHarvestDate,
      predicted_market_price: rec.predictedMarketPrice,
      predicted_demand_level: rec.predictedDemandLevel,
      expected_profit_per_acre: rec.expectedProfitPerAcre,
      confidence_score: rec.confidenceScore,
      competition_level: rec.competitionLevel,
      reasoning: rec.reasoning,
      market_forecast: rec.marketForecast,
      weather_factors: rec.weatherFactors,
      status: 'active'
    }));

    const { data: insertedRecs, error: insertError } = await supabase
      .from('planting_recommendations')
      .insert(recommendationInserts)
      .select();

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${insertedRecs?.length || 0} planting recommendations`);

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendations: insertedRecs,
        message: `Generated ${insertedRecs?.length || 0} planting recommendations`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-planting-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});