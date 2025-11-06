import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real user role from database
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const userRole = roleData?.role || 'customer';

    const { messages, context } = await req.json();
    // Use the single, server-side LOVABLE_API_KEY for all users.
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If any message includes an attached file URL or storage path, try to fetch and summarize the file
    const fileMessages = messages.filter((m: any) => typeof m.content === 'string' && (m.content.startsWith('Attached file:') || m.content.startsWith('Attached file path:')));
    const extraSystemMessages: Array<{ role: string; content: string }> = [];

    for (const fm of fileMessages) {
      try {
        let url: string | null = null;
        if (fm.content.startsWith('Attached file:')) {
          url = fm.content.replace('Attached file:', '').trim();
        } else if (fm.content.startsWith('Attached file path:')) {
          const filePath = fm.content.replace('Attached file path:', '').trim();
          // Create signed URL using service role
          const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          if (!SERVICE_ROLE) {
            console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; cannot generate signed URL');
            continue;
          }
          const serviceClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', SERVICE_ROLE);
          const { data: signed, error: signedErr } = await serviceClient.storage.from('uploads').createSignedUrl(filePath, 60);
          if (signedErr || !signed?.signedUrl) {
            console.warn('Failed to create signed URL', signedErr);
            continue;
          }
          url = signed.signedUrl;
        }
        if (!url) continue;
        const resp = await fetch(url);
        if (!resp.ok) continue;

        const contentType = resp.headers.get('content-type') || '';
        
        // Handle PDF files
        if (url.endsWith('.pdf') || contentType.includes('application/pdf')) {
          // For PDF, we'll need to extract text
          // Since Deno doesn't have native PDF parsing, we'll read as binary and extract text crudely
          // In production, you might want to use a PDF parsing library
          const arrayBuffer = await resp.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          // Simple text extraction from PDF (very basic - in production use a proper PDF parser)
          let pdfText = '';
          for (let i = 0; i < Math.min(uint8Array.length, 50000); i++) {
            if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
              pdfText += String.fromCharCode(uint8Array[i]);
            }
          }
          // Extract readable text patterns (numbers, dates, common sales terms)
          const salesData = pdfText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\$?\d+\.?\d*|month|revenue|sales|total)/gi) || [];
          extraSystemMessages.push({ 
            role: 'system', 
            content: `File ${url} is a PDF. Extracted text patterns: ${salesData.slice(0, 100).join(', ')}. Full text (first 5000 chars): ${pdfText.slice(0, 5000)}` 
          });
        } else {
          const text = await resp.text();
          
          // CSV detection and parsing
          if (url.endsWith('.csv') || contentType.includes('text/csv') || (text.split('\n').length > 1 && (text.indexOf(',') !== -1 || text.indexOf(';') !== -1))) {
            // Parse CSV with better handling
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            const delimiter = text.indexOf(',') !== -1 ? ',' : (text.indexOf(';') !== -1 ? ';' : '\t');
            const headerLine = lines[0];
            const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
            
            // Parse data rows
            const dataRows = lines.slice(1, 51).map(line => {
              const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
              const row: any = {};
              headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
              });
              return row;
            });
            
            extraSystemMessages.push({ 
              role: 'system', 
              content: `File ${url} is a CSV file with ${lines.length} rows. Headers: ${JSON.stringify(headers)}. Sample data (first ${Math.min(20, dataRows.length)} rows): ${JSON.stringify(dataRows)}` 
            });
          } else {
            // Try JSON
            try {
              const parsed = JSON.parse(text);
              const sample = Array.isArray(parsed) ? parsed.slice(0, 10) : parsed;
              extraSystemMessages.push({ role: 'system', content: `File ${url} parsed as JSON. Sample: ${JSON.stringify(sample)}`});
            } catch {
              // fallback to including a short text excerpt
              const excerpt = text.slice(0, 2000);
              extraSystemMessages.push({ role: 'system', content: `File ${url} contents (excerpt): ${excerpt}`});
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch/parse attached file', e);
      }
    }

    console.log(`Processing chat request for ${userRole || 'unknown'} user`);

    // Determine system prompt based on user role
    let systemPrompt = "You are a helpful assistant for ForkCastAI. Keep responses brief and concise (2-3 sentences max).";
    
    if (userRole === 'customer') {
      systemPrompt = "You are a friendly restaurant recommendation assistant for ForkCastAI. Help users find great restaurants, recommend meals based on their preferences, and analyze food photos. Keep all responses brief and concise (2-3 sentences max). Be helpful but keep it short.";
    } else if (userRole === 'business_owner') {
      systemPrompt = `You are a business analytics assistant for ForkCastAI restaurant owners. When users upload sales reports (CSV or PDF) and ask for analysis, you should:

1. Analyze the data and provide insights
2. Create visualizations when requested (charts, graphs)
3. Calculate statistics and percent changes from previous periods
4. Return structured data in JSON format when creating visualizations or statistics

When creating a chart, return JSON in this format:
{
  "type": "chart",
  "title": "Chart Title",
  "chartType": "bar" | "line" | "pie" | "area",
  "data": [{"name": "Label", "value": number}, ...],
  "description": "Brief description of the chart"
}

When creating statistics, return JSON in this format:
{
  "type": "statistics",
  "title": "Statistics Title",
  "statistics": [
    {"label": "Metric Name", "value": number | string, "change": number, "changeType": "increase" | "decrease"},
    ...
  ],
  "description": "Brief description of the statistics"
}

You can include multiple JSON objects in your response for multiple analyses. Always provide a brief text explanation along with the JSON.

For regular questions, keep responses brief and concise (2-3 sentences max).`;
    }

    // Add context if provided
    if (context) {
      systemPrompt += `\n\nNearby restaurant context:\n${context}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...extraSystemMessages,
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Chat failed to respond' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
