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
    const { loanApplicationId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting loan fraud detection...');

    // Fetch loan application
    const { data: loanApp } = await supabase
      .from('loan_applications')
      .select('*, farmer_profiles(*), farmer_trust_scores(*)')
      .eq('id', loanApplicationId)
      .single();

    if (!loanApp) {
      throw new Error('Loan application not found');
    }

    // Fetch behavioral biometrics
    const { data: biometrics } = await supabase
      .from('behavioral_biometrics')
      .select('*')
      .eq('user_id', loanApp.farmer_profiles.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch verification history
    const { data: verifications } = await supabase
      .from('verification_submissions')
      .select('*')
      .eq('farmer_id', loanApp.farmer_id)
      .order('created_at', { ascending: false });

    // Fetch previous loan applications
    const { data: previousLoans } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('farmer_id', loanApp.farmer_id)
      .neq('id', loanApplicationId);

    // Fetch trust network data
    const { data: trustNode } = await supabase
      .from('trust_network_nodes')
      .select('*')
      .eq('user_id', loanApp.farmer_profiles.user_id)
      .single();

    console.log('Analyzing loan application with AI...');

    const aiPrompt = `You are an expert fraud detection specialist for agricultural lending. Analyze this loan application for fraud indicators:

Loan Application:
- Amount: $${loanApp.loan_amount}
- Purpose: ${loanApp.purpose}
- Status: ${loanApp.status}
- AI Recommendation: ${loanApp.ai_recommendation || 'None'}

Farmer Profile:
- Farm Size: ${loanApp.farmer_profiles.farm_size_acres || 'Not specified'} acres
- Years Farming: ${loanApp.farmer_profiles.years_farming || 0}
- Location: ${loanApp.farmer_profiles.farm_location || 'Unknown'}
- Primary Crops: ${loanApp.farmer_profiles.primary_crops?.join(', ') || 'None'}

Trust Score:
- Overall Score: ${loanApp.farmer_trust_scores?.overall_score || 'N/A'}
- Risk Level: ${loanApp.farmer_trust_scores?.risk_level || 'Unknown'}

Trust Network:
- Trust Score: ${trustNode?.current_trust_score || 50}/100
- Trust Level: ${trustNode?.trust_level || 'new'}
- Verification Count: ${trustNode?.verification_count || 0}
- Successful Transactions: ${trustNode?.successful_transactions || 0}
- Fraud Reports: ${trustNode?.fraud_reports || 0}

Verification History:
- Total Verifications: ${verifications?.length || 0}
- Verified: ${verifications?.filter((v: any) => v.verification_status === 'verified').length || 0}
- Rejected: ${verifications?.filter((v: any) => v.verification_status === 'rejected').length || 0}
- Flagged: ${verifications?.filter((v: any) => v.verification_status === 'flagged').length || 0}

Previous Loans:
- Total Applications: ${previousLoans?.length || 0}
- Approved: ${previousLoans?.filter((l: any) => l.status === 'approved').length || 0}
- Rejected: ${previousLoans?.filter((l: any) => l.status === 'rejected').length || 0}

Behavioral Biometrics:
- Recent Sessions: ${biometrics?.length || 0}
- Anomalies Detected: ${biometrics?.filter((b: any) => b.anomaly_detected).length || 0}
- Average Risk Score: ${biometrics?.length ? (biometrics.reduce((sum: number, b: any) => sum + (b.risk_score || 0), 0) / biometrics.length).toFixed(1) : 'N/A'}

Analyze for these fraud patterns:
1. **Application Fraud**: Inconsistent information, exaggerated farm size, false credentials
2. **Identity Fraud**: Multiple applications from same user with different identities
3. **Velocity Fraud**: Rapid successive applications, unusual timing patterns
4. **Behavioral Anomalies**: Unusual user behavior patterns from biometrics
5. **Network Fraud**: Connections to known fraudulent actors
6. **Verification Failures**: Failed or suspicious verifications
7. **Amount Anomalies**: Loan amount inconsistent with farm size or history

Return ONLY a JSON object:
{
  "fraudScore": 25,
  "riskLevel": "low",
  "fraudIndicators": [
    {
      "type": "velocity_fraud",
      "description": "Multiple applications in short timeframe",
      "severity": "medium",
      "confidence": 0.7
    }
  ],
  "aiConfidence": 0.85,
  "recommendation": "approve_with_monitoring",
  "reasoning": "Low risk score with minor velocity concerns. Recommend approval with ongoing monitoring.",
  "trustImpact": {
    "adjustment": 5,
    "reason": "Consistent history and successful verifications"
  }
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
          { role: 'system', content: 'You are an expert fraud detection specialist. Respond only with valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Create fraud detection log if suspicious
    if (analysis.fraudScore > 30 || analysis.riskLevel !== 'low') {
      await supabase
        .from('fraud_detection_logs')
        .insert({
          entity_type: 'loan_application',
          entity_id: loanApplicationId,
          fraud_score: analysis.fraudScore,
          detection_method: 'pattern_recognition',
          fraud_indicators: analysis.fraudIndicators,
          risk_level: analysis.riskLevel,
          ai_confidence: analysis.aiConfidence
        });
    }

    // Update trust network based on analysis
    if (trustNode && analysis.trustImpact) {
      await supabase
        .from('trust_network_nodes')
        .update({
          current_trust_score: Math.min(100, Math.max(0, trustNode.current_trust_score + analysis.trustImpact.adjustment)),
          last_activity: new Date().toISOString()
        })
        .eq('id', trustNode.id);
    }

    console.log('Fraud detection complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        message: 'Loan fraud detection complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-loan-fraud:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});