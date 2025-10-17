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
    const { farmerId } = await req.json();
    console.log('Calculating credit score for farmer:', farmerId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch latest assessment data
    const { data: assessment } = await supabase
      .from('credit_assessment_dimensions')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch farmer profile and related data
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*, crops(*), loan_applications(*)')
      .eq('id', farmerId)
      .single();

    // Fetch trust network data
    const { data: trustNode } = await supabase
      .from('trust_network_nodes')
      .select('*')
      .eq('user_id', farmer.user_id)
      .maybeSingle();

    // Calculate dimension scores
    const satelliteScore = assessment ? (
      (assessment.crop_health_score || 0) * 0.4 +
      (assessment.land_use_efficiency || 0) * 0.4 +
      (assessment.farm_area_verified ? 20 : 0)
    ) : 50;

    const weatherScore = assessment ? (
      100 - ((assessment.drought_exposure || 0) * 0.4 + (assessment.flood_risk || 0) * 0.4 + (100 - (assessment.climate_risk_score || 50)) * 0.2)
    ) : 60;

    const financialScore = assessment ? (
      (assessment.mobile_money_score || 0) * 0.4 +
      (assessment.transaction_consistency || 0) * 0.3 +
      (assessment.savings_pattern || 0) * 0.3
    ) : 55;

    const socialScore = assessment ? (
      (assessment.community_verification_score || 0) * 0.5 +
      (assessment.network_strength || 0) * 0.3 +
      Math.min((assessment.peer_endorsements || 0) * 2, 20)
    ) : (trustNode?.current_trust_score || 50);

    const historicalScore = assessment ? (
      (assessment.historical_yield_score || 0) * 0.4 +
      (assessment.repayment_history_score || 0) * 0.4 +
      (assessment.business_longevity_score || 0) * 0.2
    ) : (farmer.years_farming ? Math.min(farmer.years_farming * 10, 60) : 40);

    // Component weights (configurable)
    const weights = {
      satellite: 0.20,
      weather: 0.15,
      financial: 0.25,
      social: 0.20,
      historical: 0.20
    };

    // Calculate overall score
    const overallScore = Math.round(
      satelliteScore * weights.satellite +
      weatherScore * weights.weather +
      financialScore * weights.financial +
      socialScore * weights.social +
      historicalScore * weights.historical
    );

    // Determine risk category
    let riskCategory: string;
    if (overallScore >= 80) riskCategory = 'minimal';
    else if (overallScore >= 65) riskCategory = 'low';
    else if (overallScore >= 50) riskCategory = 'moderate';
    else if (overallScore >= 35) riskCategory = 'high';
    else riskCategory = 'very_high';

    // Calculate confidence based on data completeness
    const dataCompleteness = assessment?.data_completeness || 60;
    const confidenceScore = Math.round(dataCompleteness * 0.8 + (trustNode?.verification_count || 0) * 2);
    const confidenceInterval = 10 - (confidenceScore / 10);

    // Use AI to generate explainable recommendations
    const aiPrompt = `Analyze this farmer's credit assessment and provide improvement recommendations:

Overall Score: ${overallScore}/100
Risk Category: ${riskCategory}

Dimension Scores:
- Satellite/Farm Data: ${satelliteScore.toFixed(1)} (crop health, land use)
- Weather Risk: ${weatherScore.toFixed(1)} (climate resilience)
- Financial Behavior: ${financialScore.toFixed(1)} (mobile money, savings)
- Social Trust: ${socialScore.toFixed(1)} (community verification)
- Historical Performance: ${historicalScore.toFixed(1)} (yield, repayment history)

Farm Profile:
- Size: ${farmer.farm_size_acres || 'Unknown'} acres
- Years Farming: ${farmer.years_farming || 'Unknown'}
- Primary Crops: ${farmer.primary_crops?.join(', ') || 'Not specified'}

Generate:
1. Top 3 improvement recommendations with specific, actionable steps
2. Scoring explanation in simple language
3. Comparison with peer farmers (estimate based on region/crop type)
4. Predicted score if recommendations are followed

Return as JSON: { "recommendations": [], "explanation": "", "peerComparison": {}, "predictedImprovement": 0 }`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a credit assessment AI that provides clear, actionable insights to farmers.' 
          },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
      }),
    });

    let aiAnalysis = {
      recommendations: [],
      explanation: 'Your score is based on multiple factors including farm data, financial behavior, and community trust.',
      peerComparison: {},
      predictedImprovement: 5
    };

    if (aiResponse.ok) {
      const data = await aiResponse.json();
      const content = data.choices[0].message.content;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
      }
    }

    // Get previous score for trend analysis
    const { data: previousScore } = await supabase
      .from('credit_scores')
      .select('overall_score')
      .eq('farmer_id', farmerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const scoreChange = previousScore ? overallScore - previousScore.overall_score : 0;
    let scoreTrend: string;
    if (Math.abs(scoreChange) < 3) scoreTrend = 'stable';
    else if (scoreChange > 0) scoreTrend = 'improving';
    else scoreTrend = 'declining';

    // Calculate loan eligibility
    const maxLoanAmount = Math.round((overallScore / 100) * 5000 * (farmer.farm_size_acres || 1));
    const baseInterestRate = 12;
    const recommendedInterestRate = baseInterestRate - ((overallScore - 50) / 10);
    const loanTermMonths = overallScore >= 70 ? 24 : overallScore >= 50 ? 12 : 6;

    // Deactivate previous scores
    await supabase
      .from('credit_scores')
      .update({ is_active: false })
      .eq('farmer_id', farmerId)
      .eq('is_active', true);

    // Save new score
    const { data: newScore, error: scoreError } = await supabase
      .from('credit_scores')
      .insert({
        farmer_id: farmerId,
        assessment_id: assessment?.id,
        overall_score: overallScore,
        risk_category: riskCategory,
        confidence_score: confidenceScore,
        confidence_interval_lower: overallScore - confidenceInterval,
        confidence_interval_upper: overallScore + confidenceInterval,
        satellite_weight: weights.satellite,
        weather_weight: weights.weather,
        financial_weight: weights.financial,
        social_weight: weights.social,
        historical_weight: weights.historical,
        score_factors: {
          satellite: satelliteScore,
          weather: weatherScore,
          financial: financialScore,
          social: socialScore,
          historical: historicalScore
        },
        improvement_recommendations: aiAnalysis.recommendations,
        peer_comparison: aiAnalysis.peerComparison,
        score_trend: scoreTrend,
        previous_score: previousScore?.overall_score,
        score_change: scoreChange,
        max_loan_amount: maxLoanAmount,
        recommended_interest_rate: recommendedInterestRate,
        loan_term_months: loanTermMonths,
        model_version: 'v1.0.0',
        model_confidence: confidenceScore >= 75 ? 'high' : confidenceScore >= 50 ? 'medium' : 'low',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (scoreError) throw scoreError;

    // Add to history
    await supabase
      .from('credit_score_history')
      .insert({
        farmer_id: farmerId,
        score_id: newScore.id,
        overall_score: overallScore,
        risk_category: riskCategory,
        triggered_by: 'new_data',
        change_reason: `Score ${scoreTrend}. ${aiAnalysis.explanation.substring(0, 200)}`
      });

    // Create alerts for significant changes
    if (Math.abs(scoreChange) >= 10) {
      await supabase
        .from('credit_score_alerts')
        .insert({
          farmer_id: farmerId,
          score_id: newScore.id,
          alert_type: scoreChange > 0 ? 'score_improvement' : 'score_drop',
          severity: Math.abs(scoreChange) >= 20 ? 'critical' : 'warning',
          title: scoreChange > 0 ? 'Credit Score Improved!' : 'Credit Score Decreased',
          message: `Your credit score ${scoreChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreChange)} points to ${overallScore}.`,
          affected_dimensions: { change: scoreChange, trend: scoreTrend }
        });
    }

    console.log('Credit score calculated successfully:', newScore.id);

    return new Response(
      JSON.stringify({ 
        score: newScore,
        analysis: aiAnalysis
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error calculating credit score:', error);
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