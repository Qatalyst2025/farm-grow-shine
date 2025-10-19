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
    const { batchId, priority } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting logistics optimization for batch:', batchId);

    // Fetch comprehensive batch information
    const { data: batch } = await supabase
      .from('supply_chain_batches')
      .select(`
        *,
        crops(*),
        farmer_profiles(*),
        buyer_profiles(*)
      `)
      .eq('id', batchId)
      .single();

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Fetch all checkpoints and quality checks
    const { data: checkpoints } = await supabase
      .from('supply_chain_checkpoints')
      .select('*')
      .eq('batch_id', batchId)
      .order('timestamp', { ascending: false });

    const { data: qualityChecks } = await supabase
      .from('supply_chain_quality_checks')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false });

    // Build AI prompt for logistics optimization
    const aiPrompt = `You are an expert logistics optimizer for agricultural supply chains. Optimize the delivery route and schedule:

Batch Information:
- Crop Type: ${batch.crops?.crop_type || 'Unknown'}
- Quantity: ${batch.quantity_kg}kg
- Harvest Date: ${batch.harvest_date}
- Days Since Harvest: ${Math.floor((Date.now() - new Date(batch.harvest_date).getTime()) / (1000 * 60 * 60 * 24))}
- Current Status: ${batch.current_status}
- Priority: ${priority || 'normal'}

Current Location:
- Latitude: ${batch.current_location_lat}
- Longitude: ${batch.current_location_lng}

Destination:
- Latitude: ${batch.destination_lat}
- Longitude: ${batch.destination_lng}
- Buyer Type: ${batch.buyer_profiles?.buyer_type || 'Unknown'}

Quality Status:
${qualityChecks && qualityChecks.length > 0 ? `- Latest Quality Grade: ${qualityChecks[0].quality_grade}
- Quality Score: ${qualityChecks[0].quality_score}
- Freshness Score: ${qualityChecks[0].freshness_score}` : '- No quality checks yet'}

Recent Checkpoints: ${checkpoints?.length || 0} recorded

Optimization Requirements:
1. **Route Optimization**: Find fastest/most efficient path
2. **Spoilage Risk Assessment**: Evaluate deterioration likelihood
3. **Time Estimation**: Calculate realistic delivery timeframes
4. **Cost Optimization**: Balance speed vs. cost
5. **Handling Requirements**: Specify temperature, storage needs
6. **Contingency Planning**: Identify alternative routes/methods

Return ONLY a JSON object:
{
  "optimizedRoute": {
    "waypoints": [
      {"lat": -1.286, "lng": 36.817, "name": "Origin", "estimatedTime": "0h"},
      {"lat": -1.292, "lng": 36.821, "name": "Checkpoint 1", "estimatedTime": "2h"},
      {"lat": -1.295, "lng": 36.825, "name": "Destination", "estimatedTime": "4h"}
    ],
    "totalDistanceKm": 15.5,
    "estimatedDurationHours": 4,
    "routeType": "direct"
  },
  "spoilageRisk": {
    "riskLevel": "low",
    "riskScore": 25,
    "factors": [
      "Good storage conditions maintained",
      "Transit time within acceptable range"
    ],
    "mitigationSteps": [
      "Maintain refrigeration at 4-8°C",
      "Minimize handling at checkpoints"
    ]
  },
  "deliverySchedule": {
    "estimatedDepartureTime": "2025-01-20T06:00:00Z",
    "estimatedArrivalTime": "2025-01-20T10:00:00Z",
    "optimalDepartureWindow": "Early morning (5-7 AM)",
    "weatherConsiderations": "Clear conditions expected"
  },
  "costEstimation": {
    "fuelCost": 45.50,
    "laborCost": 30.00,
    "packagingCost": 15.00,
    "totalEstimatedCost": 90.50,
    "currency": "USD"
  },
  "handlingRequirements": {
    "temperatureRange": "4-8°C",
    "humidityRange": "85-90%",
    "specialInstructions": [
      "Keep away from direct sunlight",
      "Handle with care to avoid bruising"
    ]
  },
  "optimizationScore": 88,
  "recommendations": [
    "Depart early morning to avoid heat",
    "Use refrigerated transport",
    "Schedule delivery during buyer's receiving hours"
  ],
  "alternativeRoutes": [
    {
      "name": "Secondary Route",
      "distanceKm": 18.2,
      "durationHours": 4.5,
      "costDifference": "+$10"
    }
  ]
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
          { role: 'system', content: 'You are an expert logistics optimizer. Respond only with valid JSON.' },
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

    // Create or update logistics record
    const { data: existingLogistics } = await supabase
      .from('supply_chain_logistics')
      .select('id')
      .eq('batch_id', batchId)
      .single();

    let logistics;
    if (existingLogistics) {
      const { data: updated } = await supabase
        .from('supply_chain_logistics')
        .update({
          route_plan: analysis.optimizedRoute,
          optimized_route: analysis.optimizedRoute,
          estimated_duration_hours: analysis.optimizedRoute.estimatedDurationHours,
          estimated_cost: analysis.costEstimation?.totalEstimatedCost,
          spoilage_risk_factors: analysis.spoilageRisk,
          temperature_requirements: {
            min: analysis.handlingRequirements?.temperatureRange?.split('-')[0],
            max: analysis.handlingRequirements?.temperatureRange?.split('-')[1]
          },
          handling_requirements: analysis.handlingRequirements?.specialInstructions,
          delivery_priority: priority || 'normal',
          optimization_score: analysis.optimizationScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLogistics.id)
        .select()
        .single();
      logistics = updated;
    } else {
      const { data: created } = await supabase
        .from('supply_chain_logistics')
        .insert({
          batch_id: batchId,
          route_plan: analysis.optimizedRoute,
          optimized_route: analysis.optimizedRoute,
          estimated_duration_hours: analysis.optimizedRoute.estimatedDurationHours,
          estimated_cost: analysis.costEstimation?.totalEstimatedCost,
          spoilage_risk_factors: analysis.spoilageRisk,
          temperature_requirements: {
            min: analysis.handlingRequirements?.temperatureRange?.split('-')[0],
            max: analysis.handlingRequirements?.temperatureRange?.split('-')[1]
          },
          handling_requirements: analysis.handlingRequirements?.specialInstructions,
          delivery_priority: priority || 'normal',
          optimization_score: analysis.optimizationScore
        })
        .select()
        .single();
      logistics = created;
    }

    // Update batch with optimized delivery estimate and spoilage risk
    await supabase
      .from('supply_chain_batches')
      .update({
        estimated_delivery_date: analysis.deliverySchedule?.estimatedArrivalTime,
        spoilage_risk_score: analysis.spoilageRisk?.riskScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId);

    console.log('Logistics optimization complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        logistics,
        analysis,
        message: 'Logistics optimization complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-logistics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
