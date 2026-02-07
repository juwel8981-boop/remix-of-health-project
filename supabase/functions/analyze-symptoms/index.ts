import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Robust JSON extraction with truncation handling
function extractJsonFromResponse(response: string): unknown {
  // Step 1: Remove markdown code blocks
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Step 2: Find JSON boundaries
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  // Step 3: Attempt parse with error handling
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Step 4: Try to fix common issues
    cleaned = cleaned
      .replace(/,\s*}/g, "}") // Remove trailing commas
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters

    return JSON.parse(cleaned);
  }
}

// Detect if response was truncated
function detectTruncation(response: string): boolean {
  const text = response.trim();

  // Check for incomplete JSON
  const openBraces = (text.match(/{/g) || []).length;
  const closeBraces = (text.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    return true;
  }

  // Check for common truncation indicators
  const truncationPatterns = [
    /\.\.\.$/,
    /\u2026$/, // ellipsis
    /\[truncated\]/i,
    /\[continued\]/i,
  ];

  return truncationPatterns.some((p) => p.test(text));
}

type Urgency = "low" | "medium" | "high";

type Recommendation = {
  specialty: string;
  specialty_bn?: string;
  reason: string;
  urgency: Urgency;
  related_symptoms?: string[];
};

type InferredSpecialty = {
  specialty: string;
  specialty_bn: string;
  matched: string[];
};

function normalizeText(input: string): string {
  return input.toLowerCase();
}

function containsAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

function inferSpecialties(symptomsRaw: string): InferredSpecialty[] {
  const text = normalizeText(symptomsRaw);

  const rules: Array<{
    specialty: string;
    specialty_bn: string;
    patterns: string[];
    label: string;
  }> = [
    {
      specialty: "General Physician",
      specialty_bn: "সাধারণ চিকিৎসক",
      label: "general",
      patterns: [
        // explicit specialty mentions
        "general physician",
        "general doctor",
        "gp",
        "physician",
        "medicine specialist",
        "internal medicine",
        "family doctor",
        "sadharon chikitsok",
        "সাধারণ চিকিৎসক",
        "জেনারেল ফিজিশিয়ান",
        "জেনারেল ফিজিশিয়ান",
        "মেডিসিন",
        "ডাক্তার",
      ],
    },
    {
      specialty: "Dermatologist",
      specialty_bn: "চর্মরোগ বিশেষজ্ঞ",
      label: "skin",
      patterns: [
        // symptoms
        "rash",
        "skin rash",
        "itch",
        "itching",
        "hives",
        "eczema",
        "acne",
        "hair loss",
        "scalp",
        // explicit specialty/category mentions
        "dermat",
        "dermatologist",
        "skin specialist",
        "চর্মরোগ",
        "ত্বক বিশেষজ্ঞ",
        "ত্বক",
        "র‍্যাশ",
        "র্যাশ",
        "চুলক",
        "ব্রণ",
        "চুল পড়",
      ],
    },
    {
      specialty: "Neurologist",
      specialty_bn: "স্নায়ুরোগ বিশেষজ্ঞ",
      label: "neuro",
      patterns: [
        // symptoms
        "headache",
        "migraine",
        "seiz",
        "numb",
        "tingl",
        "weakness",
        "tremor",
        "memory",
        "dizziness",
        "vertigo",
        "stroke",
        // explicit specialty/category mentions
        "neuro",
        "neurologist",
        "brain specialist",
        "nerve specialist",
        "স্নায়ু",
        "স্নায়ু",
        "স্নায়ুরোগ",
        "স্নায়ুরোগ",
        "মাথা ব্যথা",
        "মাথাব্যথা",
        "খিঁচ",
        "অসাড়",
        "ঝিনঝিনি",
        "কাঁপুনি",
        "স্মৃতি",
        "মাথা ঘোর",
      ],
    },
    {
      specialty: "Cardiologist",
      specialty_bn: "হৃদরোগ বিশেষজ্ঞ",
      label: "cardiac",
      patterns: [
        "chest pain",
        "chest tight",
        "palpitation",
        "shortness of breath",
        "sob",
        "heart",
        "bp",
        "blood pressure",
        "বুকে ব্যথা",
        "বুকে চাপ",
        "বুক ধড়ফড়",
        "শ্বাসকষ্ট",
        "হৃদ",
        "রক্তচাপ",
      ],
    },
    {
      specialty: "Gastroenterologist",
      specialty_bn: "পরিপাকতন্ত্র বিশেষজ্ঞ",
      label: "gi",
      patterns: [
        "stomach",
        "abdominal",
        "abdomen",
        "nausea",
        "vomit",
        "diarr",
        "constip",
        "reflux",
        "heartburn",
        "gas",
        "bloating",
        "পেট",
        "বমি",
        "ডায়রিয়া",
        "ডায়রিয়া",
        "কোষ্ঠ",
        "গ্যাস",
        "অম্বল",
        "পেট ফাঁপা",
      ],
    },
    {
      specialty: "Orthopedic",
      specialty_bn: "হাড় ও জয়েন্ট বিশেষজ্ঞ",
      label: "ortho",
      patterns: [
        "joint",
        "bone",
        "back pain",
        "knee",
        "shoulder",
        "fract",
        "sprain",
        "arthritis",
        "জয়েন্ট",
        "হাড়",
        "পিঠে ব্যথা",
        "ঘাড়ে ব্যথা",
        "হাঁটু",
      ],
    },
    {
      specialty: "ENT Specialist",
      specialty_bn: "নাক, কান, গলা বিশেষজ্ঞ",
      label: "ent",
      patterns: [
        "ear",
        "throat",
        "tonsil",
        "sinus",
        "nose",
        "hearing",
        "tinnitus",
        "sore throat",
        "কান",
        "গলা",
        "টনসিল",
        "সাইনাস",
        "নাক",
        "শুনতে",
      ],
    },
    {
      specialty: "Ophthalmologist",
      specialty_bn: "চক্ষু বিশেষজ্ঞ",
      label: "eye",
      patterns: [
        "eye",
        "vision",
        "blur",
        "blurry",
        "red eye",
        "light sensitivity",
        "চোখ",
        "দৃষ্টি",
        "ঝাপসা",
        "আলো সংবেদন",
      ],
    },
    {
      specialty: "Pulmonologist",
      specialty_bn: "ফুসফুস বিশেষজ্ঞ",
      label: "lung",
      patterns: [
        "cough",
        "wheez",
        "asthma",
        "breath",
        "lung",
        "কাশি",
        "শ্বাস",
        "হাঁপানি",
        "ফুসফুস",
      ],
    },
    {
      specialty: "Pediatrician",
      specialty_bn: "শিশু বিশেষজ্ঞ",
      label: "child",
      patterns: [
        "child",
        "baby",
        "infant",
        "toddler",
        "newborn",
        "শিশু",
        "বাচ্চা",
        "বেবি",
      ],
    },
    {
      specialty: "Psychiatrist",
      specialty_bn: "মানসিক রোগ বিশেষজ্ঞ",
      label: "mental",
      patterns: [
        "anxiety",
        "panic",
        "depress",
        "sleep",
        "insomnia",
        "stress",
        "suic",
        "উদ্বেগ",
        "ডিপ্রেশন",
        "ঘুম",
        "স্ট্রেস",
        "মানসিক",
      ],
    },
  ];

  const inferred: InferredSpecialty[] = [];
  for (const rule of rules) {
    if (containsAny(text, rule.patterns)) {
      // collect a small set of matched hints for UI if needed
      const matched = rule.patterns.filter((p) => text.includes(p)).slice(0, 6);
      inferred.push({ specialty: rule.specialty, specialty_bn: rule.specialty_bn, matched });
    }
  }

  // If nothing matched, at least include a general physician fallback
  if (inferred.length === 0) {
    inferred.push({ specialty: "General Physician", specialty_bn: "সাধারণ চিকিৎসক", matched: [] });
  }

  // Ensure General Physician is included for broad symptoms (fever/fatigue/etc.)
  const generalPatterns = ["fever", "fatigue", "weakness", "weight loss", "j্বর", "জ্বর", "ক্লান্ত", "দুর্বল", "দুর্বলতা"];
  if (containsAny(text, generalPatterns) && !inferred.some((i) => i.specialty === "General Physician")) {
    inferred.unshift({ specialty: "General Physician", specialty_bn: "সাধারণ চিকিৎসক", matched: [] });
  }

  // Deduplicate
  const seen = new Set<string>();
  return inferred.filter((i) => {
    const key = i.specialty.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeRecommendations(
  existing: Recommendation[],
  inferred: InferredSpecialty[],
  inputSymptoms: string
): Recommendation[] {
  const bySpecialty = new Map<string, Recommendation>();

  for (const r of existing || []) {
    if (!r?.specialty) continue;
    bySpecialty.set(r.specialty.toLowerCase(), r);
  }

  for (const inf of inferred) {
    const key = inf.specialty.toLowerCase();
    if (bySpecialty.has(key)) continue;

    const reason =
      inf.matched.length > 0
        ? `Based on symptom keywords detected (${inf.matched.join(", ")}), this specialty may be relevant.`
        : `Based on the overall symptom description, this specialty may be relevant.`;

    bySpecialty.set(key, {
      specialty: inf.specialty,
      specialty_bn: inf.specialty_bn,
      reason,
      urgency: "low",
      related_symptoms: inf.matched.length ? inf.matched : inputSymptoms.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6),
    });
  }

  return Array.from(bySpecialty.values());
}

function computeOverallUrgency(recs: Recommendation[]): Urgency {
  const score = (u?: string) => (u === "high" ? 3 : u === "medium" ? 2 : 1);
  const max = Math.max(...(recs || []).map((r) => score(r.urgency)), 1);
  return max === 3 ? "high" : max === 2 ? "medium" : "low";
}

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

Your task is to analyze ALL the patient's symptoms and recommend the appropriate medical specialist(s). 

CRITICAL INSTRUCTION: If the symptoms indicate MULTIPLE different medical conditions or specialties, you MUST recommend ALL relevant specialists, not just one. For example:
- If a patient has "headache, skin rash, and joint pain" → recommend Neurologist, Dermatologist, AND Orthopedic
- If a patient has "fever, chest pain, and stomach ache" → recommend General Physician, Cardiologist, AND Gastroenterologist

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
- Ophthalmologist (চক্ষু বিশেষজ্ঞ)
- Gastroenterologist (পরিপাকতন্ত্র বিশেষজ্ঞ)
- Pulmonologist (ফুসফুস বিশেষজ্ঞ)

IMPORTANT: 
1. You must understand symptoms written in Bangla (e.g., মাথা ব্যথা, জ্বর, বুকে ব্যথা) as well as English
2. Always respond in a mix that matches the user's input language
3. Be helpful but remind users this is not a medical diagnosis
4. ALWAYS recommend MULTIPLE specialists if symptoms span different medical areas

Respond ONLY with a valid JSON object in this exact format:
{
  "recommendations": [
    {
      "specialty": "The recommended specialty name in English",
      "specialty_bn": "The specialty name in Bangla",
      "reason": "Brief explanation for this specific specialty based on relevant symptoms",
      "urgency": "low" | "medium" | "high",
      "related_symptoms": ["list", "of", "symptoms", "for", "this", "specialty"]
    }
  ],
  "overall_urgency": "low" | "medium" | "high",
  "disclaimer": "A brief medical disclaimer in the same language as the input"
}

Remember: Analyze ALL symptoms and map them to their appropriate specialties. Do NOT combine unrelated symptoms under one specialty.`;

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
          { role: "user", content: `Patient symptoms: ${symptoms}\n\nAnalyze ALL symptoms and recommend ALL appropriate specialists.` },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);

      // Fallback: still return multi-specialty recommendations from deterministic inference
      const inferred = inferSpecialties(String(symptoms || ""));
      const fallbackRecs: Recommendation[] = inferred.map((inf) => ({
        specialty: inf.specialty,
        specialty_bn: inf.specialty_bn,
        reason:
          inf.matched.length > 0
            ? `Based on your symptoms (keywords: ${inf.matched.join(", ")}), this specialist may be relevant.`
            : "Based on your symptom description, this specialist may be relevant.",
        urgency: "low",
        related_symptoms: inf.matched,
      }));

      const fallbackPayload = {
        recommendations: fallbackRecs,
        overall_urgency: computeOverallUrgency(fallbackRecs),
        disclaimer:
          "AI results are temporarily unavailable; these suggestions are based on symptom matching only and are not a diagnosis. Please consult a qualified doctor. / AI সাময়িকভাবে অনুপলব্ধ; এগুলো কেবল লক্ষণ মিলিয়ে দেওয়া পরামর্শ, রোগ নির্ণয় নয়।",
      };

      return new Response(JSON.stringify(fallbackPayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("Raw AI response:", content);

    // Check for truncation
    if (detectTruncation(content)) {
      console.warn("Response may be truncated, attempting to parse anyway");
    }

    // Parse the JSON response using robust extraction
    let recommendation;
    try {
      recommendation = extractJsonFromResponse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response");
    }

    // Validate the response structure
    const rec = recommendation as any;
    if (!rec.recommendations || !Array.isArray(rec.recommendations)) {
      // Handle legacy single-specialty response format
      if (rec.specialty) {
        recommendation = {
          recommendations: [{
            specialty: rec.specialty,
            specialty_bn: rec.specialty_bn || "",
            reason: rec.reason || "",
            urgency: rec.urgency || "low",
            related_symptoms: []
          }],
          overall_urgency: rec.urgency || "low",
          disclaimer: rec.disclaimer || ""
        };
      } else {
        throw new Error("Invalid response structure from AI");
      }
    }

    // Enforce multi-specialty coverage: merge AI output with deterministic inference
    const ensured = recommendation as any;
    const inferred = inferSpecialties(String(symptoms || ""));
    ensured.recommendations = mergeRecommendations(
      ensured.recommendations as Recommendation[],
      inferred,
      String(symptoms || "")
    );
    ensured.overall_urgency = computeOverallUrgency(ensured.recommendations);

    return new Response(JSON.stringify(ensured), {
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
