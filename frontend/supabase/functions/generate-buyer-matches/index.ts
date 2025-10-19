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
    const { cropId, farmerId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching crop and farmer data...');
    
    // Fetch crop details
    const { data: crop } = await supabase
      .from('crops')
      .select('*')
      .eq('id', cropId)
      .single();

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Fetch farmer profile with location
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    // Fetch all buyer profiles
    const { data: buyers } = await supabase
      .from('buyer_profiles')
      .select('*');

    // Fetch purchase history for pattern analysis
    const { data: purchaseHistory } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('crop_type', crop.crop_type)
      .order('purchase_date', { ascending: false })
      .limit(100);

    // Fetch market forecasts
    const { data: marketForecast } = await supabase
      .from('market_demand_forecasts')
      .select('*')
      .eq('crop_type', crop.crop_type)
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .order('forecast_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    console.log('Generating AI-powered matches...');

    // Use AI to generate intelligent matches
    const aiPrompt = `You are an expert agricultural marketplace analyst. Analyze the following data and generate optimal buyer matches for a farmer.

Crop Details:
- Type: ${crop.crop_type}
- Name: ${crop.crop_name}
- Expected Harvest: ${crop.expected_harvest_date}
- Land Area: ${crop.land_area_acres} acres
- Status: ${crop.status}

Farmer Profile:
- Location: ${farmer.farm_location || 'Not specified'}
- Years Farming: ${farmer.years_farming || 'Not specified'}
- Primary Crops: ${farmer.primary_crops?.join(', ') || 'Not specified'}

Available Buyers: ${buyers?.length || 0}
${buyers?.map(b => `
- ${b.company_name} (${b.buyer_type})
  Preferred Crops: ${b.preferred_crops?.join(', ') || 'Any'}
  Min Quality: ${b.min_quality_score}/5
  Max Distance: ${b.max_distance_km || 'Unlimited'} km
  Certifications: ${b.preferred_certifications?.join(', ') || 'None required'}
  Purchase Frequency: ${b.purchase_frequency || 'Not specified'}
`).join('\n')}

Purchase History Patterns:
${purchaseHistory?.slice(0, 10).map(p => `
- ${p.crop_type}: ${p.quantity_kg}kg at $${p.price_per_kg}/kg (Quality: ${p.quality_rating}/5)
`).join('\n') || 'No recent history'}

Market Forecast:
${marketForecast ? `
- Predicted Demand: ${marketForecast.predicted_demand_kg}kg
- Predicted Price: $${marketForecast.predicted_price_per_kg}/kg
- Demand Trend: ${marketForecast.demand_trend}
- Price Trend: ${marketForecast.price_trend}
- Confidence: ${(marketForecast.confidence_score * 100).toFixed(0)}%
` : 'No forecast available'}

For each buyer, provide a match analysis with:
1. Match score (0-100)
2. Breakdown scores for: quality fit, location, timing, certification match, historical pattern
3. Recommended price per kg
4. Reasoning for the match

Return ONLY a JSON array of matches (top 5), no other text:
[{
  "buyerId": "buyer_id",
  "matchScore": 85,
  "matchReasons": {
    "quality": 90,
    "location": 85,
    "timing": 80,
    "certification": 100,
    "historicalPattern": 75
  },
  "recommendedPrice": 2.50,
  "distanceKm": 45,
  "reasoning": "Brief explanation of why this is a good match"
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
          { role: 'system', content: 'You are an expert agricultural marketplace analyst. Respond only with valid JSON.' },
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
    
    console.log('AI response received:', aiContent.substring(0, 200));

    // Parse AI response
    let matches;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      matches = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Calculate expected harvest date and potential revenue
    const harvestDate = crop.expected_harvest_date || crop.predicted_harvest_date;
    const estimatedYield = crop.land_area_acres ? crop.land_area_acres * 2000 : 5000; // ~2000kg per acre

    // Insert matches into database
    const matchInserts = matches.slice(0, 5).map((match: any) => ({
      farmer_id: farmerId,
      buyer_id: match.buyerId,
      crop_id: cropId,
      match_score: match.matchScore,
      match_reasons: match.matchReasons,
      recommended_price: match.recommendedPrice,
      potential_revenue: match.recommendedPrice * estimatedYield,
      distance_km: match.distanceKm,
      delivery_date: harvestDate,
      status: 'pending'
    }));

    const { data: insertedMatches, error: insertError } = await supabase
      .from('farmer_buyer_matches')
      .insert(matchInserts)
      .select();

    if (insertError) {
      console.error('Error inserting matches:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${insertedMatches?.length || 0} buyer matches`);

    return new Response(
      JSON.stringify({ 
        success: true,
        matches: insertedMatches,
        message: `Generated ${insertedMatches?.length || 0} potential buyer matches`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-buyer-matches:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});