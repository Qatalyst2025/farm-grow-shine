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
    const { farmerId, cropType, soilData, climateData, resources } = await req.json();
    
    console.log('Generating farming plan for:', { farmerId, cropType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch farmer profile
    const { data: farmerProfile } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    // Fetch successful farming practices for this crop
    const { data: successfulPractices } = await supabase
      .from('farmer_knowledge_base')
      .select('*')
      .eq('crop_type', cropType)
      .eq('verified', true)
      .order('success_score', { ascending: false })
      .limit(3);

    // Fetch market demand forecast
    const { data: marketForecast } = await supabase
      .from('market_demand_forecasts')
      .select('*')
      .eq('crop_type', cropType)
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .order('forecast_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    const prompt = `Create a comprehensive farming plan for growing ${cropType}.

Farmer Profile:
- Farm Size: ${farmerProfile?.farm_size_acres} acres
- Location: ${farmerProfile?.farm_location}
- Experience: ${farmerProfile?.years_farming} years

Farm Conditions:
${soilData ? `Soil: ${JSON.stringify(soilData)}` : ''}
${climateData ? `Climate: ${JSON.stringify(climateData)}` : ''}
${resources ? `Resources: ${JSON.stringify(resources)}` : ''}

${successfulPractices && successfulPractices.length > 0 ? `
Proven Practices from Successful Farmers:
${successfulPractices.map(p => `
- Success Score: ${p.success_score}%
- Practices: ${JSON.stringify(p.practices_used)}
- Outcomes: ${JSON.stringify(p.outcomes)}
`).join('\n')}
` : ''}

${marketForecast ? `
Market Forecast:
- Predicted Price: $${marketForecast.predicted_price_per_kg}/kg
- Predicted Demand: ${marketForecast.predicted_demand_kg}kg
- Trend: ${marketForecast.demand_trend}
` : ''}

Generate a detailed farming plan including:
1. Pre-planting preparation (timeline and tasks)
2. Planting recommendations (timing, spacing, seed selection)
3. Irrigation and water management
4. Fertilization schedule
5. Pest and disease management
6. Growth milestones and monitoring
7. Harvest timing and techniques
8. Post-harvest handling
9. Expected yield and revenue projections
10. Risk mitigation strategies

Format the response as a structured JSON object with these sections.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert agricultural planner. Provide detailed, practical farming plans in JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate farming plan');
    }

    const aiResponse = await response.json();
    let planData;
    
    try {
      // Try to parse JSON from response
      const content = aiResponse.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      planData = jsonMatch ? JSON.parse(jsonMatch[0]) : { rawPlan: content };
    } catch (e) {
      planData = { rawPlan: aiResponse.choices[0].message.content };
    }

    // Calculate success probability based on conditions and historical data
    const successProbability = successfulPractices && successfulPractices.length > 0
      ? successfulPractices.reduce((acc, p) => acc + (p.success_score || 0), 0) / successfulPractices.length
      : 65;

    // Save the farming plan
    const { data: savedPlan, error: saveError } = await supabase
      .from('farming_plans')
      .insert({
        farmer_id: farmerId,
        crop_type: cropType,
        plan_data: planData,
        soil_analysis: soilData,
        climate_data: climateData,
        resource_assessment: resources,
        recommendations: planData.recommendations || [],
        success_probability: successProbability,
        estimated_yield: planData.estimatedYield,
        estimated_revenue: planData.estimatedRevenue,
        learning_source: successfulPractices ? {
          source: 'farmer_knowledge_base',
          count: successfulPractices.length
        } : null
      })
      .select()
      .single();

    if (saveError) throw saveError;

    console.log('Farming plan generated successfully:', savedPlan.id);

    return new Response(
      JSON.stringify({ plan: savedPlan }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating farming plan:', error);
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