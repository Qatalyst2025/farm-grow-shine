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
    const { batchId, checkpointType, locationLat, locationLng, locationAccuracy, metadata } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting geolocation verification for batch:', batchId);

    // Fetch batch details
    const { data: batch } = await supabase
      .from('supply_chain_batches')
      .select('*, farmer_profiles(*)')
      .eq('id', batchId)
      .single();

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Fetch previous checkpoints for this batch
    const { data: previousCheckpoints } = await supabase
      .from('supply_chain_checkpoints')
      .select('*')
      .eq('batch_id', batchId)
      .order('timestamp', { ascending: false })
      .limit(5);

    // Calculate distance from origin and expected route
    const originLat = batch.farmer_profiles?.farm_location?.split(',')[0] || 0;
    const originLng = batch.farmer_profiles?.farm_location?.split(',')[1] || 0;
    
    const distanceFromOrigin = calculateDistance(originLat, originLng, locationLat, locationLng);

    // Build AI prompt for verification
    const aiPrompt = `You are an expert supply chain verification specialist. Analyze this geolocation checkpoint for potential fraud or tampering:

Batch Information:
- Batch Number: ${batch.batch_number}
- Current Status: ${batch.current_status}
- Origin: ${batch.farmer_profiles?.farm_location || 'Unknown'}
- Destination: ${batch.destination_lat}, ${batch.destination_lng}

Current Checkpoint:
- Type: ${checkpointType}
- Location: ${locationLat}, ${locationLng}
- Accuracy: ${locationAccuracy}m
- Distance from Origin: ${distanceFromOrigin.toFixed(2)}km
- Timestamp: ${new Date().toISOString()}

Previous Checkpoints: ${JSON.stringify(previousCheckpoints?.map(cp => ({
  type: cp.checkpoint_type,
  location: `${cp.location_lat}, ${cp.location_lng}`,
  timestamp: cp.timestamp
})) || [])}

Additional Metadata: ${JSON.stringify(metadata || {})}

Verification Tasks:
1. **Location Validity**: Check if coordinates are valid and within reasonable range
2. **Route Consistency**: Verify this checkpoint follows a logical path from previous ones
3. **Timing Analysis**: Check if time elapsed is realistic for distance traveled
4. **Tampering Detection**: Identify any suspicious patterns:
   - Impossible travel speeds
   - Location jumps
   - Coordinate precision anomalies
   - Metadata inconsistencies

Return ONLY a JSON object:
{
  "verificationStatus": "verified" | "suspicious" | "failed",
  "verificationScore": 85,
  "tamperingDetected": false,
  "tamperingIndicators": [
    {
      "type": "timing_anomaly",
      "severity": "medium",
      "description": "Travel speed exceeds normal range",
      "confidence": 0.75
    }
  ],
  "locationValidity": {
    "coordinatesValid": true,
    "accuracyAcceptable": true,
    "withinExpectedRegion": true
  },
  "routeConsistency": {
    "followsLogicalPath": true,
    "distanceReasonable": true,
    "directionCorrect": true
  },
  "timingAnalysis": {
    "travelSpeedKmh": 45.5,
    "isRealistic": true,
    "durationAppropriate": true
  },
  "riskLevel": "low",
  "recommendations": ["Continue monitoring subsequent checkpoints"],
  "complianceStatus": "compliant"
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
          { role: 'system', content: 'You are an expert supply chain verification specialist. Respond only with valid JSON.' },
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

    // Create checkpoint record
    const { data: checkpoint, error: checkpointError } = await supabase
      .from('supply_chain_checkpoints')
      .insert({
        batch_id: batchId,
        checkpoint_type: checkpointType,
        location_lat: locationLat,
        location_lng: locationLng,
        location_accuracy: locationAccuracy,
        verification_method: 'ai_geolocation',
        verification_status: analysis.verificationStatus,
        verification_score: analysis.verificationScore,
        tampering_detected: analysis.tamperingDetected,
        tampering_indicators: analysis.tamperingIndicators,
        metadata
      })
      .select()
      .single();

    if (checkpointError) throw checkpointError;

    // Update batch location
    await supabase
      .from('supply_chain_batches')
      .update({
        current_location_lat: locationLat,
        current_location_lng: locationLng,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId);

    // If tampering detected, create fraud log
    if (analysis.tamperingDetected) {
      await supabase
        .from('fraud_detection_logs')
        .insert({
          entity_type: 'checkpoint',
          entity_id: checkpoint.id,
          fraud_score: 100 - analysis.verificationScore,
          detection_method: 'geolocation_analysis',
          fraud_indicators: analysis.tamperingIndicators,
          risk_level: analysis.riskLevel,
          ai_confidence: 0.9
        });
    }

    console.log('Geolocation verification complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        checkpoint,
        analysis,
        message: 'Geolocation verification complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-geolocation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
