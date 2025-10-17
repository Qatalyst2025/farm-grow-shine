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
    const { task, text, language, context } = await req.json();
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing NLP task: ${task} in language: ${language || 'en'}`);

    // Build prompt based on task type
    let systemPrompt = '';
    let userPrompt = text;

    switch (task) {
      case 'translate':
        systemPrompt = `You are an expert agricultural translator. Translate the following text to ${language} while preserving agricultural terminology and context. Respond only with the translation.`;
        break;
      
      case 'document_processing':
        systemPrompt = `You are an expert document processor for agriculture. Extract key information from the following document and return a structured JSON with: documentType, issuer, issueDate, expiryDate, certificateNumber, compliance, and summary.`;
        break;
      
      case 'sentiment_analysis':
        systemPrompt = `You are an expert at analyzing farmer feedback and support queries. Analyze the sentiment and urgency of the following message. Return JSON with: sentiment (positive/neutral/negative), urgency (low/medium/high), category, and recommendedAction.`;
        break;
      
      case 'content_generation':
        systemPrompt = `You are an agricultural education expert. Generate clear, practical educational content about: ${context}. Make it accessible to farmers with varying literacy levels. Use simple language and practical examples.`;
        break;
      
      case 'query_understanding':
        systemPrompt = `You are an AI assistant helping farmers. Understand the farmer's query and extract: intent, crops mentioned, location if any, urgency, and required information. Return as JSON.`;
        break;

      default:
        systemPrompt = `You are a helpful agricultural AI assistant. Process the following text and provide relevant insights.`;
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Parse result if it's JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { text: result };
    }

    console.log('NLP processing complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        task,
        result: parsedResult,
        language,
        model: 'deepseek-chat'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepseek-nlp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
