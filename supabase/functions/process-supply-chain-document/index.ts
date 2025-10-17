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
    const { batchId, documentType, documentUrl, documentNumber, issuer, issueDate, expiryDate, metadata } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting document verification for batch:', batchId);

    // Fetch batch details
    const { data: batch } = await supabase
      .from('supply_chain_batches')
      .select('*, crops(*)')
      .eq('id', batchId)
      .single();

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Build AI prompt for document verification
    const aiPrompt = `You are an expert document verification specialist for agricultural supply chains. Analyze this document submission:

Batch Information:
- Batch Number: ${batch.batch_number}
- Crop Type: ${batch.crops?.crop_type || 'Unknown'}
- Quantity: ${batch.quantity_kg}kg
- Current Status: ${batch.current_status}

Document Details:
- Type: ${documentType}
- Document Number: ${documentNumber || 'Not provided'}
- Issuer: ${issuer || 'Not provided'}
- Issue Date: ${issueDate || 'Not provided'}
- Expiry Date: ${expiryDate || 'Not provided'}
- Document URL: ${documentUrl}

Additional Metadata: ${JSON.stringify(metadata || {})}

Verification Tasks:
1. **Document Authenticity**: Check if document appears legitimate
2. **Completeness**: Verify all required information is present
3. **Validity**: Check dates, expiration, issuer credentials
4. **Compliance**: Ensure document meets regulatory requirements
5. **Cross-Reference**: Verify document details match batch information

Return ONLY a JSON object:
{
  "verificationStatus": "verified" | "pending" | "rejected",
  "complianceStatus": "compliant" | "non_compliant" | "needs_review",
  "complianceIssues": [],
  "documentAnalysis": {
    "authenticity": "genuine",
    "completeness": 100,
    "readability": "excellent",
    "format": "standard"
  },
  "validityChecks": {
    "documentNumberValid": true,
    "issuerVerified": true,
    "datesConsistent": true,
    "notExpired": true
  },
  "regulatoryCompliance": {
    "phytosanitaryCertificate": true,
    "qualityCertificate": true,
    "originCertificate": true,
    "exportDocumentation": true
  },
  "dataExtraction": {
    "extractedFields": {
      "certificateNumber": "ABC123",
      "inspectionDate": "2025-01-15",
      "inspector": "John Doe"
    }
  },
  "recommendations": [
    "Document verified successfully",
    "Ready for export processing"
  ],
  "aiConfidence": 0.92,
  "requiresHumanReview": false
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
          { role: 'system', content: 'You are an expert document verification specialist. Respond only with valid JSON.' },
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

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('supply_chain_documents')
      .insert({
        batch_id: batchId,
        document_type: documentType,
        document_url: documentUrl,
        document_number: documentNumber,
        issuer: issuer,
        issue_date: issueDate,
        expiry_date: expiryDate,
        verification_status: analysis.verificationStatus,
        verification_method: 'ai_document_processing',
        verified_at: analysis.verificationStatus === 'verified' ? new Date().toISOString() : null,
        compliance_status: analysis.complianceStatus,
        compliance_issues: analysis.complianceIssues,
        ai_analysis: analysis,
        metadata
      })
      .select()
      .single();

    if (documentError) throw documentError;

    console.log('Document verification complete');

    return new Response(
      JSON.stringify({ 
        success: true,
        document,
        analysis,
        message: 'Document verification complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-supply-chain-document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
