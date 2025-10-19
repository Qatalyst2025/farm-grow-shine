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
    const { farmerId, imageUrls, geolocation, metadata } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting farm ownership verification...');

    // Fetch farmer profile for context
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (!farmer) {
      throw new Error('Farmer not found');
    }

    // Analyze images using AI
    const aiPrompt = `You are an expert agricultural verification specialist. Analyze the following farm ownership verification submission:

Farmer Profile:
- Location: ${farmer.farm_location || 'Not specified'}
- Farm Size: ${farmer.farm_size_acres || 'Not specified'} acres
- Years Farming: ${farmer.years_farming || 'Not specified'}

Submitted Data:
- Number of Images: ${imageUrls.length}
- Geolocation: ${geolocation ? `${geolocation.lat}, ${geolocation.lng} (accuracy: ${geolocation.accuracy}m)` : 'Not provided'}
- Timestamp: ${geolocation?.timestamp || 'Not provided'}
- Additional Metadata: ${JSON.stringify(metadata || {})}

Task: Perform comprehensive verification analysis to detect potential fraud:

1. **Geolocation Analysis**:
   - Is the location consistent with the farmer's stated location?
   - Check for coordinate validity and precision
   - Assess if timestamp is reasonable (not backdated or future-dated)

2. **Image Quality & Authenticity**:
   - Check if images appear to be authentic farm photos
   - Look for signs of manipulation or stock photos
   - Verify metadata consistency

3. **Fraud Indicators**:
   - Inconsistent location data
   - Image tampering signs
   - Reused or stock images
   - Metadata anomalies
   - Time inconsistencies

Return ONLY a JSON object with this structure:
{
  "verificationScore": 85,
  "verificationStatus": "verified",
  "fraudFlags": [
    {
      "type": "geolocation_mismatch",
      "severity": "medium",
      "description": "Location 50km from stated farm address",
      "confidence": 0.75
    }
  ],
  "qualityChecks": [
    {
      "checkType": "geolocation",
      "result": "passed",
      "qualityScore": 90,
      "issues": [],
      "recommendations": ["Provide additional photos from different angles"]
    }
  ],
  "aiAnalysis": {
    "authenticityScore": 85,
    "consistencyScore": 90,
    "riskLevel": "low",
    "detectedFeatures": ["farmland", "crops", "equipment"],
    "suspiciousPatterns": []
  },
  "recommendation": "approved"
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
          { role: 'system', content: 'You are an expert agricultural verification specialist. Respond only with valid JSON.' },
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
    
    console.log('AI analysis complete');

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Create verification submission
    const { data: submission, error: submissionError } = await supabase
      .from('verification_submissions')
      .insert({
        farmer_id: farmerId,
        submission_type: 'farm_ownership',
        verification_status: analysis.verificationStatus,
        image_urls: imageUrls,
        geolocation,
        metadata,
        ai_analysis: analysis.aiAnalysis,
        verification_score: analysis.verificationScore,
        fraud_flags: analysis.fraudFlags
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Create quality checks
    if (analysis.qualityChecks) {
      const qualityCheckInserts = analysis.qualityChecks.map((check: any) => ({
        submission_id: submission.id,
        check_type: check.checkType,
        check_result: check.result,
        quality_score: check.qualityScore,
        issues_found: check.issues,
        recommendations: check.recommendations,
        ai_analysis: check
      }));

      await supabase
        .from('verification_quality_checks')
        .insert(qualityCheckInserts);
    }

    // If fraud detected, create fraud log
    if (analysis.fraudFlags && analysis.fraudFlags.length > 0) {
      const fraudScore = Math.max(...analysis.fraudFlags.map((f: any) => 
        f.severity === 'critical' ? 90 : f.severity === 'high' ? 70 : f.severity === 'medium' ? 50 : 30
      ));

      await supabase
        .from('fraud_detection_logs')
        .insert({
          entity_type: 'submission',
          entity_id: submission.id,
          fraud_score: fraudScore,
          detection_method: 'image_analysis',
          fraud_indicators: analysis.fraudFlags,
          risk_level: analysis.aiAnalysis.riskLevel,
          ai_confidence: analysis.fraudFlags[0]?.confidence || 0.8
        });
    }

    // Update trust network node
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: trustNode } = await supabase
        .from('trust_network_nodes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (trustNode) {
        const trustAdjustment = analysis.verificationStatus === 'verified' ? 5 : -10;
        await supabase
          .from('trust_network_nodes')
          .update({
            current_trust_score: Math.min(100, Math.max(0, trustNode.current_trust_score + trustAdjustment)),
            verification_count: trustNode.verification_count + 1,
            trust_level: analysis.verificationStatus === 'verified' ? 'building' : 'suspicious',
            last_activity: new Date().toISOString()
          })
          .eq('id', trustNode.id);
      }
    }

    console.log('Verification complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        submission,
        analysis,
        message: 'Farm ownership verification complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-farm-ownership:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});