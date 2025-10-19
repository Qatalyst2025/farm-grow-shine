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
    const { task, imageUrls, context, cropType } = await req.json();
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing vision task: ${task} for ${imageUrls.length} images`);

    // Build prompt based on task type
    let systemPrompt = '';
    let analysisPrompt = '';

    switch (task) {
      case 'crop_analysis':
        systemPrompt = 'You are an expert agricultural scientist specializing in crop health analysis.';
        analysisPrompt = `Analyze these crop images for ${cropType || 'this crop'}. Provide detailed assessment of:
1. Overall health status (healthy/stressed/diseased)
2. Growth stage
3. Disease or pest identification
4. Nutrient deficiencies
5. Recommended actions
Return as structured JSON with: healthStatus, healthScore (0-100), growthStage, issues (array), diseases (array), pests (array), nutrientDeficiencies (array), recommendations (array), urgency (low/medium/high).`;
        break;
      
      case 'document_ocr':
        systemPrompt = 'You are an expert at extracting text and data from agricultural documents.';
        analysisPrompt = `Extract all visible text and structured data from this document. Include document type, issuer information, dates, certificate numbers, and any tabular data. Return as structured JSON.`;
        break;
      
      case 'quality_assessment':
        systemPrompt = 'You are an agricultural quality inspector with expertise in produce grading.';
        analysisPrompt = `Assess the quality of ${cropType || 'this produce'} from these images. Evaluate:
1. Visual appearance and color
2. Size uniformity
3. Defects or damage
4. Ripeness level
5. Grade recommendation (A/B/C)
Return as JSON with: qualityGrade, qualityScore (0-100), appearance, uniformity, defects (array), ripeness, marketability, recommendations (array).`;
        break;
      
      case 'satellite_analysis':
        systemPrompt = 'You are a remote sensing specialist for agriculture.';
        analysisPrompt = `Analyze this satellite/aerial imagery of farmland. Assess:
1. Crop health and vigor
2. Irrigation patterns
3. Problem areas
4. Growth uniformity
5. Estimated coverage
Return as JSON with: overallHealth, vegetationIndex, problemAreas (array with coordinates), irrigationAssessment, coverage, recommendations (array).`;
        break;

      default:
        systemPrompt = 'You are an expert agricultural vision AI.';
        analysisPrompt = `Analyze these agricultural images and provide relevant insights. Context: ${context || 'General analysis'}`;
    }

    // Prepare messages with images
    const imageContents = imageUrls.map((url: string) => ({
      type: 'image_url',
      image_url: { url }
    }));

    // Call DeepSeek API with vision
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
          { 
            role: 'user', 
            content: [
              { type: 'text', text: analysisPrompt },
              ...imageContents
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
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
    let analysis;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse response:', result);
      analysis = { rawAnalysis: result };
    }

    console.log('Vision analysis complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        task,
        analysis,
        imagesProcessed: imageUrls.length,
        model: 'deepseek-chat'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepseek-vision:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
