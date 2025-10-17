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
    const { recommendationType, farmerId, context, userPreferences } = await req.json();
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating recommendations: ${recommendationType} for farmer: ${farmerId}`);

    // Fetch farmer profile and related data
    const { data: farmerProfile } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (!farmerProfile) {
      throw new Error('Farmer profile not found');
    }

    // Fetch additional context
    const [cropsResult, creditScoreResult, knowledgeResult] = await Promise.all([
      supabase.from('crops').select('*').eq('farmer_id', farmerId).eq('status', 'active'),
      supabase.from('credit_scores').select('*').eq('farmer_id', farmerId).eq('is_active', true).single(),
      supabase.from('farmer_knowledge_base').select('*').eq('farmer_id', farmerId).eq('verified', true).limit(5)
    ]);

    const crops = cropsResult.data || [];
    const creditScore = creditScoreResult.data;
    const knowledge = knowledgeResult.data || [];

    // Build prompt based on recommendation type
    let systemPrompt = 'You are an expert agricultural advisor with deep knowledge of farming practices, market dynamics, and financial planning.';
    let recommendationPrompt = '';

    switch (recommendationType) {
      case 'farming_advice':
        recommendationPrompt = `Provide personalized farming advice for:

Farmer Profile:
- Location: ${farmerProfile.farm_location}
- Farm Size: ${farmerProfile.farm_size_acres} acres
- Years Experience: ${farmerProfile.years_farming}
- Primary Crops: ${farmerProfile.primary_crops?.join(', ') || 'Various'}

Current Crops: ${JSON.stringify(crops.map(c => ({ name: c.crop_name, type: c.crop_type, planted: c.planting_date })))}

Context: ${context || 'General farming advice'}

Provide 5-7 actionable recommendations covering:
1. Crop selection and rotation
2. Planting schedules
3. Pest and disease prevention
4. Water management
5. Soil health improvement
6. Yield optimization

Return as JSON with: recommendations (array with title, description, priority, category, implementationSteps, expectedBenefit, resources).`;
        break;
      
      case 'marketplace_matching':
        const { data: buyers } = await supabase
          .from('buyer_profiles')
          .select('*')
          .limit(20);

        const { data: priceHistory } = await supabase
          .from('crop_price_history')
          .select('*')
          .in('crop_type', crops.map(c => c.crop_type))
          .order('recorded_date', { ascending: false })
          .limit(10);

        recommendationPrompt = `Match this farmer with ideal buyers:

Farmer Profile:
- Location: ${farmerProfile.farm_location}
- Crops Available: ${crops.map(c => `${c.crop_name} (${c.expected_harvest_date})`).join(', ')}

Available Buyers: ${JSON.stringify(buyers?.map(b => ({
  id: b.id,
  name: b.company_name,
  type: b.buyer_type,
  preferredCrops: b.preferred_crops,
  maxDistance: b.max_distance_km
})) || [])}

Recent Prices: ${JSON.stringify(priceHistory || [])}

Recommend top 5 buyer matches based on:
1. Geographic proximity
2. Crop preferences match
3. Price competitiveness
4. Reliability and reputation
5. Order size compatibility

Return as JSON with: matches (array with buyerId, buyerName, matchScore, matchReasons, estimatedPrice, distance, recommendations).`;
        break;
      
      case 'educational_content':
        recommendationPrompt = `Recommend educational content for:

Farmer Profile:
- Experience Level: ${farmerProfile.years_farming < 3 ? 'Beginner' : farmerProfile.years_farming < 10 ? 'Intermediate' : 'Expert'}
- Current Knowledge: ${JSON.stringify(knowledge.map(k => k.crop_type))}
- Crops Grown: ${farmerProfile.primary_crops?.join(', ') || 'Various'}

User Preferences: ${JSON.stringify(userPreferences || {})}
Context: ${context || 'General education'}

Recommend 5-7 educational topics/courses covering:
1. Skills needed for current crops
2. Advanced techniques for improvement
3. Market and business skills
4. Technology adoption
5. Sustainability practices

Return as JSON with: recommendations (array with title, description, difficulty, duration, topics, benefits, prerequisites, format (video/text/interactive)).`;
        break;
      
      case 'financial_products':
        recommendationPrompt = `Recommend financial products for:

Farmer Profile:
- Farm Size: ${farmerProfile.farm_size_acres} acres
- Annual Revenue Estimate: Based on ${crops.length} active crops
- Credit Score: ${creditScore?.overall_score || 'Not assessed'}
- Risk Category: ${creditScore?.risk_category || 'Unknown'}

Context: ${context || 'General financial planning'}

Recommend appropriate financial products:
1. Loan products (size, terms, interest rates)
2. Insurance coverage
3. Savings plans
4. Investment opportunities
5. Payment systems

Return as JSON with: recommendations (array with productType, productName, amount, terms, benefits, eligibility, priority, provider).`;
        break;

      default:
        recommendationPrompt = `Provide general recommendations based on the farmer profile: ${JSON.stringify(farmerProfile)}`;
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
          { role: 'user', content: recommendationPrompt }
        ],
        temperature: 0.5,
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
    let recommendations;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse response:', result);
      recommendations = { rawRecommendations: result };
    }

    console.log('Recommendations generated');

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendationType,
        recommendations,
        generatedAt: new Date().toISOString(),
        model: 'deepseek-chat'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepseek-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
