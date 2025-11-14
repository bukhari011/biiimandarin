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
    const { sentence, availableWords } = await req.json();
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
            content: `Kamu adalah ahli bahasa Mandarin yang membantu memvalidasi kalimat yang disusun dari kata-kata yang tersedia.
Periksa apakah kalimat yang dirangkai sudah benar secara grammar dan makna.
Berikan respons dalam format JSON dengan struktur:
{
  "isCorrect": true/false,
  "correctSentence": "kalimat yang benar jika salah, atau kalimat yang sama jika benar",
  "feedback": "penjelasan detail tentang kalimat dalam bahasa Indonesia, termasuk arti dan struktur",
  "errors": ["daftar kesalahan jika ada"]
}`
          },
          {
            role: "user",
            content: `Kata yang tersedia: ${availableWords.join(", ")}
Kalimat yang dirangkai: ${sentence}

Validasi apakah kalimat ini benar dan berikan feedback.`
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

    // Award points if sentence is correct
    if (result.isCorrect) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        // Get or create user points
        const { data: existingPoints } = await supabaseClient
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const newTotal = (existingPoints?.total_points || 0) + 15;
        const newCount = (existingPoints?.sentence_builds_count || 0) + 1;

        await supabaseClient
          .from('user_points')
          .upsert({
            user_id: user.id,
            total_points: newTotal,
            sentence_builds_count: newCount,
          }, { onConflict: 'user_id' });

        // Log activity
        await supabaseClient
          .from('point_activities')
          .insert({
            user_id: user.id,
            activity_type: 'sentence_builder',
            points_earned: 15,
            description: 'Berhasil rangkai kalimat dengan benar!',
          });

        result.pointsEarned = 15;
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
