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
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const serviceCode = formData.get('serviceCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const text = (formData.get('text') as string) || '';

    console.log('USSD request:', { sessionId, serviceCode, phoneNumber, text });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find farmer by phone number
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    let response = '';

    // USSD Menu Flow
    if (text === '') {
      // Main menu
      response = `CON Welcome to AgriLink AI
1. Get Farming Advice
2. Check Weather Alerts
3. View Market Prices
4. My Farming Plan
5. Report Crop Issue`;
    } else if (text === '1') {
      // Farming advice submenu
      response = `CON What do you need help with?
1. Planting advice
2. Pest control
3. Fertilizer guidance
4. Irrigation tips
5. Harvest timing`;
    } else if (text.startsWith('1*')) {
      // Process farming advice request
      const choice = text.split('*')[1];
      const topics = ['planting', 'pest control', 'fertilizer', 'irrigation', 'harvest'];
      const topic = topics[parseInt(choice) - 1];
      
      if (farmer) {
        // This would call the AI advisor in production
        response = `END We're analyzing your farm conditions for ${topic} advice. You'll receive a detailed SMS shortly.`;
      } else {
        response = `END Please register first by visiting our app or sending REGISTER to ${serviceCode}`;
      }
    } else if (text === '2') {
      // Weather alerts
      const { data: alerts } = await supabase
        .from('weather_alerts')
        .select('*')
        .gte('valid_until', new Date().toISOString())
        .order('severity', { ascending: false })
        .limit(3);

      if (alerts && alerts.length > 0) {
        response = `END Weather Alerts:\n${alerts.map(a => `${a.severity}: ${a.title}`).join('\n')}`;
      } else {
        response = `END No active weather alerts in your region.`;
      }
    } else if (text === '3') {
      // Market prices
      const { data: prices } = await supabase
        .from('market_demand_forecasts')
        .select('*')
        .gte('forecast_date', new Date().toISOString().split('T')[0])
        .order('forecast_date', { ascending: true })
        .limit(5);

      if (prices && prices.length > 0) {
        response = `END Current Market Prices:\n${prices.map(p => `${p.crop_type}: $${p.predicted_price_per_kg}/kg`).join('\n')}`;
      } else {
        response = `END No market data available currently.`;
      }
    } else if (text === '4') {
      // Farming plan
      if (farmer) {
        const { data: plan } = await supabase
          .from('farming_plans')
          .select('*')
          .eq('farmer_id', farmer.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (plan) {
          response = `END Your ${plan.crop_type} Plan:
Success Rate: ${plan.success_probability}%
Est. Yield: ${plan.estimated_yield || 'TBD'}
Est. Revenue: $${plan.estimated_revenue || 'TBD'}`;
        } else {
          response = `END No active farming plan. Visit our app to create one!`;
        }
      } else {
        response = `END Please register first to access your farming plan.`;
      }
    } else if (text === '5') {
      // Report crop issue
      response = `CON What type of issue?
1. Pest infestation
2. Disease symptoms
3. Nutrient deficiency
4. Water stress
5. Other`;
    } else if (text.startsWith('5*')) {
      // Process crop issue report
      const issueType = text.split('*')[1];
      response = `END Thank you for reporting. Our AI will analyze your crops and send recommendations via SMS.`;
    } else {
      response = `END Invalid option. Please try again.`;
    }

    return new Response(response, {
      headers: { 'Content-Type': 'text/plain' },
      status: 200
    });

  } catch (error) {
    console.error('Error in ussd-webhook:', error);
    return new Response(`END Service error. Please try again later.`, {
      headers: { 'Content-Type': 'text/plain' },
      status: 200
    });
  }
});