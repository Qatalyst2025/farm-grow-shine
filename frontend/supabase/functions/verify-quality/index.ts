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
    const { batchId, checkpointId, checkType, imageUrls, storageConditions } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting quality verification for batch:', batchId);

    // Fetch batch and crop details
    const { data: batch } = await supabase
      .from('supply_chain_batches')
      .select('*, crops(*)')
      .eq('id', batchId)
      .single();

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Fetch previous quality checks
    const { data: previousChecks } = await supabase
      .from('supply_chain_quality_checks')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Build AI prompt for quality analysis
    const aiPrompt = `You are an expert agricultural quality inspector. Analyze this produce quality checkpoint:

Batch Information:
- Crop Type: ${batch.crops?.crop_type || 'Unknown'}
- Crop Name: ${batch.crops?.crop_name || 'Unknown'}
- Harvest Date: ${batch.harvest_date}
- Initial Grade: ${batch.initial_quality_grade || 'Unknown'}
- Days Since Harvest: ${Math.floor((Date.now() - new Date(batch.harvest_date).getTime()) / (1000 * 60 * 60 * 24))}

Current Inspection:
- Check Type: ${checkType}
- Number of Images: ${imageUrls?.length || 0}
- Storage Conditions: ${JSON.stringify(storageConditions || {})}

Previous Quality Checks: ${JSON.stringify(previousChecks?.map(check => ({
  grade: check.quality_grade,
  score: check.quality_score,
  freshness: check.freshness_score,
  daysAgo: Math.floor((Date.now() - new Date(check.created_at).getTime()) / (1000 * 60 * 60 * 24))
})) || [])}

Quality Assessment Tasks:
1. **Visual Quality Grading**: Assess appearance, color, size uniformity
2. **Freshness Assessment**: Evaluate decay, wilting, discoloration
3. **Contamination Detection**: Check for mold, pests, foreign materials
4. **Storage Compliance**: Verify temperature, humidity, ventilation
5. **Handling Verification**: Check for bruising, damage, proper packaging

Return ONLY a JSON object:
{
  "qualityGrade": "A",
  "qualityScore": 92,
  "freshnessScore": 88,
  "contaminationDetected": false,
  "contaminationType": null,
  "visualIndicators": {
    "color": "vibrant",
    "texture": "firm",
    "uniformity": "excellent",
    "defects": "minimal"
  },
  "storageCompliance": {
    "temperatureOk": true,
    "humidityOk": true,
    "ventilationOk": true
  },
  "imageAnalysis": {
    "clarity": "good",
    "lighting": "adequate",
    "coverage": "comprehensive"
  },
  "aiConfidence": 0.89,
  "recommendations": [
    "Maintain current storage conditions",
    "Monitor for ripeness changes"
  ],
  "estimatedShelfLife": "7-10 days",
  "marketReadiness": "ready",
  "qualityTrend": "stable"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert agricultural quality inspector. Respond only with valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Create quality check record
    const { data: qualityCheck, error: checkError } = await supabase
      .from('supply_chain_quality_checks')
      .insert({
        batch_id: batchId,
        checkpoint_id: checkpointId,
        check_type: checkType,
        quality_grade: analysis.qualityGrade,
        quality_score: analysis.qualityScore,
        freshness_score: analysis.freshnessScore,
        contamination_detected: analysis.contaminationDetected,
        contamination_type: analysis.contaminationType,
        storage_conditions: storageConditions,
        image_analysis: analysis.imageAnalysis,
        ai_confidence: analysis.aiConfidence,
        visual_indicators: analysis.visualIndicators,
        recommendations: analysis.recommendations
      })
      .select()
      .single();

    if (checkError) throw checkError;

    // Update checkpoint with quality check reference
    if (checkpointId) {
      await supabase
        .from('supply_chain_checkpoints')
        .update({
          image_urls: imageUrls,
          notes: `Quality Grade: ${analysis.qualityGrade}, Score: ${analysis.qualityScore}`
        })
        .eq('id', checkpointId);
    }

    console.log('Quality verification complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        qualityCheck,
        analysis,
        message: 'Quality verification complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-quality:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
