import type { Itinerary, TripFormValues } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateDemoItinerary } from '@/lib/itineraryGenerator';

export async function generateItinerary(values: TripFormValues): Promise<Itinerary> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('You must be signed in to generate an itinerary.');
  }

  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-itinerary`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        trip: {
          destination: values.destination,
          country: values.country,
          startDate: values.startDate,
          endDate: values.endDate,
          travelers: values.travelers,
          budget: values.budget,
          travelStyle: values.travelStyle,
          interests: values.interests,
          foodPreference: values.foodPreference,
          accommodationPreference: values.accommodationPreference,
          additionalInstructions: values.additionalInstructions,
        },
        sessionId: accessToken,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed (${response.status})`);
    }

    const data = await response.json();

    if (data.useDemo) {
      return generateDemoItinerary(values);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.itinerary) {
      throw new Error('AI returned an invalid response.');
    }

    return data.itinerary as Itinerary;
  } catch (err) {
    // Network or parse error — fall back to demo so the user still gets output
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      return generateDemoItinerary(values);
    }
    throw err;
  }
}

export function validateItinerary(itin: unknown): itin is Itinerary {
  if (!itin || typeof itin !== 'object') return false;
  const obj = itin as Record<string, unknown>;
  if (typeof obj.destination !== 'string') return false;
  if (!Array.isArray(obj.days)) return false;
  if (!obj.budgetBreakdown || typeof obj.budgetBreakdown !== 'object') return false;
  return true;
}
