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
    const { predictionType, farmerId, cropId, historicalData, marketData, weatherData } = await req.json();
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating prediction: ${predictionType}`);

    // Fetch additional context data
    let farmerProfile, crop, priceHistory, marketForecasts, weatherHistory;

    if (farmerId) {
      const { data } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', farmerId)
        .single();
      farmerProfile = data;
    }

    if (cropId) {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .eq('id', cropId)
        .single();
      crop = data;
    }

    // Build comprehensive prompt based on prediction type
    let systemPrompt = 'You are an expert agricultural data scientist and economist specializing in predictive analytics.';
    let analysisPrompt = '';

    switch (predictionType) {
      case 'yield_forecast':
        analysisPrompt = `Forecast the crop yield based on the following data:

Crop Information:
${crop ? `- Crop Type: ${crop.crop_type}
- Planting Date: ${crop.planting_date}
- Land Area: ${crop.land_area_acres} acres
- Expected Harvest: ${crop.expected_harvest_date}` : ''}

Historical Data: ${JSON.stringify(historicalData || {})}
Weather Data: ${JSON.stringify(weatherData || {})}

Provide a detailed yield forecast with:
1. Predicted yield (kg/acre)
2. Confidence interval
3. Key factors affecting yield
4. Risk factors
5. Comparison to historical averages
6. Recommendations for maximizing yield

Return as JSON with: predictedYield, confidenceInterval (min/max), confidence (0-1), keyFactors (array), riskFactors (array), historicalComparison, recommendations (array).`;
        break;
      
      case 'price_prediction':
        const { data: recentPrices } = await supabase
          .from('crop_price_history')
          .select('*')
          .eq('crop_type', crop?.crop_type)
          .order('recorded_date', { ascending: false })
          .limit(30);
        
        priceHistory = recentPrices;

        analysisPrompt = `Predict future crop prices based on:

Crop: ${crop?.crop_type || 'Unknown'}
Current Market Prices: ${JSON.stringify(priceHistory?.slice(0, 5) || [])}
Historical Trends: ${JSON.stringify(priceHistory || [])}
Market Data: ${JSON.stringify(marketData || {})}
Seasonal Factors: Current month, expected harvest timing

Provide price predictions for:
1. Next week
2. Next month
3. Next quarter

Return as JSON with: currentPrice, predictions (array with timeframe, predictedPrice, confidence), trend (up/down/stable), volatility, keyDrivers (array), recommendations (sell now/wait/etc), bestSellingWindow.`;
        break;
      
      case 'risk_assessment':
        analysisPrompt = `Assess farming risks for:

Farmer Profile:
${farmerProfile ? `- Location: ${farmerProfile.farm_location}
- Farm Size: ${farmerProfile.farm_size_acres} acres
- Years Experience: ${farmerProfile.years_farming}
- Primary Crops: ${farmerProfile.primary_crops}` : ''}

Weather Data: ${JSON.stringify(weatherData || {})}
Historical Performance: ${JSON.stringify(historicalData || {})}

Evaluate risks across these dimensions:
1. Weather and climate risks
2. Market price volatility
3. Pest and disease risks
4. Financial stability risks
5. Operational risks

Return as JSON with: overallRiskScore (0-100), riskLevel (low/medium/high), riskBreakdown (object with scores for each dimension), criticalRisks (array), mitigationStrategies (array), insuranceRecommendations (array).`;
        break;
      
      case 'demand_forecast':
        const { data: forecasts } = await supabase
          .from('market_demand_forecasts')
          .select('*')
          .eq('crop_type', crop?.crop_type)
          .order('forecast_date', { ascending: false })
          .limit(10);
        
        marketForecasts = forecasts;

        analysisPrompt = `Forecast market demand for ${crop?.crop_type || 'crops'}:

Current Market Trends: ${JSON.stringify(marketForecasts || [])}
Market Data: ${JSON.stringify(marketData || {})}
Seasonal Patterns: Consider seasonal consumption patterns
Supply Chain Factors: Regional supply, export demand, storage capacity

Predict demand for:
1. Short-term (1-2 weeks)
2. Medium-term (1-3 months)
3. Long-term (6-12 months)

Return as JSON with: currentDemand, forecasts (array with period, demandLevel, confidence), supplyDemandBalance, pricePressure (up/down), opportunityWindows (array with timing and reasoning), recommendations (array).`;
        break;

      default:
        analysisPrompt = 'Provide general predictive analysis for the agricultural context provided.';
    }

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.4,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Parse result
    let prediction;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse response:', result);
      prediction = { rawPrediction: result };
    }

    console.log('Prediction complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        predictionType,
        prediction,
        generatedAt: new Date().toISOString(),
        model: 'deepseek-chat'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepseek-predictions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
