import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical specialty recommendation assistant for a healthcare platform in Bangladesh. You understand both English and Bangla (বাংলা) languages fluently.

Your task is to analyze the patient's symptoms and recommend the most appropriate medical specialist.

Available specialties:
- General Physician (সাধারণ চিকিৎসক)
- Cardiologist (হৃদরোগ বিশেষজ্ঞ)
- Neurologist (স্নায়ুরোগ বিশেষজ্ঞ)
- Pediatrician (শিশু বিশেষজ্ঞ)
- Dermatologist (চর্মরোগ বিশেষজ্ঞ)
- Orthopedic (হাড় ও জয়েন্ট বিশেষজ্ঞ)
- Gynecologist (স্ত্রীরোগ বিশেষজ্ঞ)
- ENT Specialist (নাক, কান, গলা বিশেষজ্ঞ)
- Psychiatrist (মানসিক রোগ বিশেষজ্ঞ)

IMPORTANT: 
1. You must understand symptoms written in Bangla (e.g., মাথা ব্যথা, জ্বর, বুকে ব্যথা) as well as English
2. Always respond in a mix that matches the user's input language
3. Be helpful but remind users this is not a medical diagnosis

Respond ONLY with a valid JSON object in this exact format:
{
  "specialty": "The recommended specialty name in English",
  "specialty_bn": "The specialty name in Bangla",
  "reason": "Brief explanation in the same language as the input (English or Bangla)",
  "urgency": "low" | "medium" | "high",
  "disclaimer": "A brief medical disclaimer in the same language as the input"
}`;

    // DeepSeek API (OpenAI-compatible endpoint)
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1t2-chimera",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Patient symptoms: ${symptoms}` },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(JSON.stringify({ error: "API authentication failed. Please check your API key." }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const recommendation = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(recommendation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
