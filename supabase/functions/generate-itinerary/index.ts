import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TripInput {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  travelStyle: string;
  interests: string[];
  foodPreference: string;
  accommodationPreference: string;
  additionalInstructions: string;
}

const SYSTEM_PROMPT = `You are a expert travel planner AI. Generate a personalized day-by-day travel itinerary as structured JSON.
Consider the destination, dates, budget (in INR), number of travelers, interests, travel style, and preferences.
Keep nearby attractions together on the same day. Avoid overlapping schedules. Include realistic timings and durations.

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "destination": "string",
  "summary": "string — 2-3 sentence overview",
  "tripDurationDays": number,
  "days": [
    {
      "day": number,
      "date": "string — formatted date",
      "theme": "string — short theme for the day",
      "activities": [
        {
          "time": "string — e.g. 09:00 AM",
          "name": "string",
          "type": "string — interest category",
          "duration": "string — e.g. 2 hours",
          "description": "string",
          "cost": number,
          "location": "string — area name"
        }
      ],
      "meals": {
        "breakfast": "string — restaurant name + dish",
        "lunch": "string",
        "dinner": "string",
        "breakfastCost": number,
        "lunchCost": number,
        "dinnerCost": number
      },
      "accommodation": {
        "name": "string",
        "type": "string",
        "description": "string",
        "cost": number
      },
      "transportation": {
        "method": "string",
        "description": "string",
        "cost": number
      },
      "dailyCost": number
    }
  ],
  "budgetBreakdown": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "total": number
  },
  "tips": ["string", "string"]
}

All costs are in INR and are ESTIMATES only. Do not claim real-time prices or confirmed bookings.
The "relaxed" style means 2 activities/day, "balanced" means 3, "packed" means 4.
Multiply per-person costs by the number of travelers for total costs.
Ensure the total estimated cost stays within or close to the stated budget.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { trip, sessionId } = await req.json() as { trip: TripInput; sessionId: string };

    // Authenticate the user via their session token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessionId}` } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      // No API key — return demo flag so the frontend uses its own demo generator
      return new Response(JSON.stringify({ useDemo: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Generate a travel itinerary:
Destination: ${trip.destination}${trip.country ? `, ${trip.country}` : ""}
Dates: ${trip.startDate} to ${trip.endDate}
Travelers: ${trip.travelers}
Budget: ₹${trip.budget} INR
Travel style: ${trip.travelStyle}
Interests: ${trip.interests.join(", ") || "General sightseeing"}
Food preference: ${trip.foodPreference || "Any"}
Accommodation preference: ${trip.accommodationPreference || "Mid-range"}
Additional instructions: ${trip.additionalInstructions || "None"}

Return ONLY the JSON itinerary object.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "AI returned empty response." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let itinerary;
    try {
      itinerary = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    itinerary.isDemo = false;

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Unexpected server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
