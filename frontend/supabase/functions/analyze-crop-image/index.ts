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
    const { imageId, imageUrl, cropId, weatherData } = await req.json();
    
    if (!imageId || !imageUrl || !cropId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update image status to processing
    await supabaseClient
      .from('crop_images')
      .update({ analysis_status: 'processing' })
      .eq('id', imageId);

    // Fetch crop details
    const { data: crop } = await supabaseClient
      .from('crops')
      .select('*')
      .eq('id', cropId)
      .single();

    // Prepare analysis prompt
    const analysisPrompt = `You are an expert agricultural AI system analyzing crop health from images.

CROP INFORMATION:
- Crop Type: ${crop?.crop_type || 'Unknown'}
- Planting Date: ${crop?.planting_date || 'Unknown'}
- Expected Harvest: ${crop?.expected_harvest_date || 'Unknown'}

${weatherData ? `WEATHER CONTEXT:
${JSON.stringify(weatherData, null, 2)}` : ''}

Analyze this crop image and provide a comprehensive assessment:

1. **Growth Stage**: Identify current growth stage (germination, vegetative, flowering, fruiting, maturity)
2. **Health Score**: Overall health rating (0-100)
3. **Pest Detection**: Identify any visible pests, their type, and severity (low/medium/high/critical)
4. **Disease Detection**: Identify any diseases, their type, and severity
5. **Water Stress**: Assess water stress level (none/low/moderate/high)
6. **Nutrient Deficiency**: Identify any visible nutrient deficiencies
7. **Vegetation Index**: Estimate vegetation health index (0-1)
8. **Recommendations**: Provide 3-5 actionable recommendations
9. **Harvest Prediction**: Estimate days until harvest readiness
10. **Risk Assessment**: Overall risk level (low/medium/high/critical)

Format your response as JSON:
{
  "growth_stage": "vegetative",
  "health_score": 85,
  "pest_detected": false,
  "pest_type": null,
  "pest_severity": null,
  "disease_detected": false,
  "disease_type": null,
  "disease_severity": null,
  "water_stress_level": "low",
  "nutrient_deficiency": ["nitrogen"],
  "vegetation_index": 0.78,
  "recommendations": [
    "Apply nitrogen fertilizer within 3 days",
    "Monitor for early signs of fungal infection",
    "Increase irrigation frequency to twice daily"
  ],
  "days_to_harvest": 45,
  "risk_level": "low",
  "detailed_analysis": "The crop shows healthy vegetative growth..."
}`;

    // Call Lovable AI with image analysis
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
            content: 'You are an expert agricultural AI vision system. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.5,
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

    // Store analysis in database
    const { data: healthAnalysis, error: analysisError } = await supabaseClient
      .from('crop_health_analysis')
      .insert({
        crop_id: cropId,
        image_id: imageId,
        growth_stage: analysis.growth_stage,
        health_score: analysis.health_score,
        pest_detected: analysis.pest_detected,
        pest_type: analysis.pest_type,
        pest_severity: analysis.pest_severity,
        disease_detected: analysis.disease_detected,
        disease_type: analysis.disease_type,
        disease_severity: analysis.disease_severity,
        water_stress_level: analysis.water_stress_level,
        nutrient_deficiency: analysis.nutrient_deficiency,
        vegetation_index: analysis.vegetation_index,
        ai_analysis: analysis,
        recommendations: analysis.recommendations,
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error inserting analysis:', analysisError);
      throw analysisError;
    }

    // Update image status to completed
    await supabaseClient
      .from('crop_images')
      .update({ analysis_status: 'completed' })
      .eq('id', imageId);

    // Update crop harvest prediction if available
    if (analysis.days_to_harvest && crop) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + analysis.days_to_harvest);
      
      await supabaseClient
        .from('crops')
        .update({ predicted_harvest_date: predictedDate.toISOString().split('T')[0] })
        .eq('id', cropId);

      // Store forecast
      await supabaseClient
        .from('crop_forecasts')
        .insert({
          crop_id: cropId,
          forecast_type: 'harvest_date',
          predicted_value: { 
            date: predictedDate.toISOString().split('T')[0],
            days_remaining: analysis.days_to_harvest 
          },
          confidence_score: analysis.health_score,
          forecast_date: new Date().toISOString().split('T')[0],
        });
    }

    // Create alerts based on analysis
    const alerts = [];
    const farmerId = crop?.farmer_id;

    if (analysis.pest_detected && analysis.pest_severity !== 'low') {
      alerts.push({
        crop_id: cropId,
        farmer_id: farmerId,
        alert_type: 'pest_control',
        severity: analysis.pest_severity === 'critical' ? 'critical' : 'urgent',
        title: `${analysis.pest_type} Detected`,
        message: `${analysis.pest_severity.toUpperCase()} severity pest infestation detected. Immediate action required.`,
        action_required: 'Apply appropriate pesticide treatment',
      });
    }

    if (analysis.disease_detected) {
      alerts.push({
        crop_id: cropId,
        farmer_id: farmerId,
        alert_type: 'disease',
        severity: analysis.disease_severity === 'critical' ? 'critical' : 'urgent',
        title: `${analysis.disease_type} Detected`,
        message: `Disease detected with ${analysis.disease_severity} severity.`,
        action_required: 'Consult agricultural expert for treatment plan',
      });
    }

    if (analysis.water_stress_level === 'high') {
      alerts.push({
        crop_id: cropId,
        farmer_id: farmerId,
        alert_type: 'irrigation',
        severity: 'urgent',
        title: 'High Water Stress Detected',
        message: 'Crop is experiencing significant water stress.',
        action_required: 'Increase irrigation immediately',
      });
    }

    if (analysis.nutrient_deficiency && analysis.nutrient_deficiency.length > 0) {
      alerts.push({
        crop_id: cropId,
        farmer_id: farmerId,
        alert_type: 'fertilization',
        severity: 'warning',
        title: 'Nutrient Deficiency Detected',
        message: `Deficiencies detected: ${analysis.nutrient_deficiency.join(', ')}`,
        action_required: 'Apply appropriate fertilizer',
      });
    }

    if (alerts.length > 0) {
      await supabaseClient.from('crop_alerts').insert(alerts);
    }

    return new Response(
      JSON.stringify({ success: true, analysis: healthAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-crop-image:', error);
    
    // Try to update image status to failed
    if (error.imageId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient
        .from('crop_images')
        .update({ analysis_status: 'failed' })
        .eq('id', error.imageId);
    }

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