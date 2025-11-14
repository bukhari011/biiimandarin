import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Kamu adalah ahli bahasa Mandarin yang membantu mengecek grammar dan struktur kalimat.
Analisis kalimat yang diberikan dan identifikasi kesalahan grammar, posisi kata, dan penggunaan kata yang tidak tepat.
Berikan respons dalam format JSON dengan struktur:
{
  "correctedText": "kalimat yang sudah diperbaiki",
  "errors": [
    {
      "type": "error" | "warning" | "suggestion",
      "position": posisi karakter kesalahan,
      "length": panjang teks yang salah,
      "message": "penjelasan kesalahan dalam bahasa Indonesia",
      "correction": "perbaikan yang disarankan"
    }
  ],
  "explanation": "penjelasan lengkap tentang kesalahan dan perbaikan dalam bahasa Indonesia"
}`
          },
          {
            role: "user",
            content: `Cek grammar kalimat ini: ${text}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit tercapai, coba lagi nanti" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit habis, silakan top up" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Award points if no errors found (perfect grammar)
    if (result.errors.length === 0) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        // Get or create user points
        const { data: existingPoints } = await supabaseClient
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const newTotal = (existingPoints?.total_points || 0) + 10;
        const newCount = (existingPoints?.grammar_checks_count || 0) + 1;

        await supabaseClient
          .from('user_points')
          .upsert({
            user_id: user.id,
            total_points: newTotal,
            grammar_checks_count: newCount,
          }, { onConflict: 'user_id' });

        // Log activity
        await supabaseClient
          .from('point_activities')
          .insert({
            user_id: user.id,
            activity_type: 'grammar_check',
            points_earned: 10,
            description: 'Grammar check sempurna!',
          });

        result.pointsEarned = 10;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
