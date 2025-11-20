// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Load local env for development (optional). If a .env.local file exists at repo root
// it will be loaded into Deno.env so the function can access LOVABLE_API_KEY locally.
// In production (Supabase Edge Functions) environment variables set in the platform
// will still take precedence.
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";
try {
  const _env = config({ path: ".env.local" });
  for (const [k, v] of Object.entries(_env)) {
    // don't overwrite already-set environment variables
    if (!Deno.env.get(String(k))) Deno.env.set(String(k), String(v));
  }
} catch (e) {
  // If dotenv isn't present or .env.local doesn't exist, ignore silently.
}

// Dev helpers: allow skipping auth during local development and log whether the
// LOVABLE_API_KEY is present (masked). Set SKIP_AUTH=true in .env.local to
// bypass Supabase auth checks for quick local testing. Do NOT enable in prod.
const SKIP_AUTH = Deno.env.get('SKIP_AUTH') === 'true';
const _lovable = Deno.env.get('LOVABLE_API_KEY');
if (_lovable) {
  // show only last 4 chars so the key itself isn't exposed in logs
  const masked = '***' + String(_lovable).slice(-4);
  console.log('LOVABLE_API_KEY present (masked):', masked);
} else {
  console.log('LOVABLE_API_KEY not set');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication (can be skipped in local dev with SKIP_AUTH=true)
    let user;
    let userRole = 'customer';
    let supabaseClient;
    if (!SKIP_AUTH) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user: fetchedUser }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !fetchedUser) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      user = fetchedUser;

      // Fetch real user role from database
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      userRole = roleData?.role || 'customer';
    } else {
      // Local dev: skip auth and use a fake user
      user = { id: 'local-test' } as any;
      userRole = 'customer';
      console.log('SKIP_AUTH enabled — skipping Supabase auth checks');
    }

    const { messages, context } = await req.json();
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

    console.log(`Processing chat request for ${userRole || 'unknown'} user`);

    // Determine system prompt based on user role
    let systemPrompt = "You are a helpful assistant for ForkCastAI. Keep responses brief and concise (2-3 sentences max).";
    
    if (userRole === 'customer') {
      systemPrompt = "You are a friendly restaurant recommendation assistant for ForkCastAI. Help users find great restaurants, recommend meals based on their preferences, and analyze food photos. Keep all responses brief and concise (2-3 sentences max). Be helpful but keep it short.";
    } else if (userRole === 'business_owner') {
      systemPrompt = "You are a business analytics assistant for ForkCastAI restaurant owners. Help restaurant owners understand their performance metrics, respond to reviews professionally, analyze customer feedback, and provide insights to improve their business. Keep all responses brief and concise (2-3 sentences max).";
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
