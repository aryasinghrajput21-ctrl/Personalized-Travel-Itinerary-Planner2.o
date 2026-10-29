import type { Itinerary, ItineraryDay, TripFormValues } from '@/types';

const INTEREST_ACTIVITIES: Record<string, string[]> = {
  Food: ['Local food market tour', 'Street food tasting walk', 'Cooking class with a local chef', 'Fine dining experience'],
  Sightseeing: ['Historic landmark visit', 'City walking tour', 'Sunset viewpoint hike', 'Museum and gallery tour'],
  Nature: ['National park excursion', 'Botanical garden stroll', 'Lake or beach visit', 'Scenic nature trail'],
  Adventure: ['Zip-lining adventure', 'Kayaking or canoeing', 'Rock climbing session', 'Paragliding experience'],
  Culture: ['Temple and shrine tour', 'Local festival experience', 'Traditional art workshop', 'Heritage site visit'],
  Shopping: ['Local artisan market', 'Boutique shopping district', 'Antique hunting street', 'Mall and designer outlet'],
};

const FOOD_PREFS: Record<string, string[]> = {
  Vegetarian: ['Vegetarian thali restaurant', 'Plant-based cafe', 'Vegetarian street food stall', 'Farm-to-table veggie bistro'],
  'Non-vegetarian': ['Local seafood grill', 'BBQ and grill house', 'Traditional meat curry restaurant', 'Popular local diner'],
  Vegan: ['Vegan fusion restaurant', 'Plant-based juice bar', 'Vegan bakery', 'Organic vegan cafe'],
  'Any cuisine': ['Popular local restaurant', 'Regional specialty eatery', 'Fusion cuisine cafe', 'Authentic local diner'],
};

const ACCOMMODATIONS: Record<string, { name: string; type: string; desc: string }> = {
  Budget: { name: 'City Backpacker Hostel', type: 'Hostel / Guesthouse', desc: 'Clean, social, dorm-style accommodation near the city center.' },
  MidRange: { name: 'Comfort Inn & Suites', type: '3-star Hotel', desc: 'Comfortable private rooms with breakfast and central location.' },
  Luxury: { name: 'Grand Plaza Resort', type: '5-star Hotel', desc: 'Premium rooms, spa, pool, and concierge service.' },
  Homestay: { name: 'Local Heritage Homestay', type: 'Homestay', desc: 'Stay with a local family for an authentic cultural experience.' },
};

const ACCOMMODATION_COSTS: Record<string, number> = { Budget: 1200, MidRange: 3500, Luxury: 8000, Homestay: 2000 };

function pickActivities(interests: string[], dayIndex: number): string[] {
  const pool: string[] = [];
  interests.forEach((interest) => {
    const acts = INTEREST_ACTIVITIES[interest];
    if (acts) pool.push(...acts);
  });
  if (pool.length === 0) pool.push(...INTEREST_ACTIVITIES.Sightseeing);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[dayIndex % shuffled.length], shuffled[(dayIndex + 1) % shuffled.length], shuffled[(dayIndex + 2) % shuffled.length]];
}

function formatDate(dateStr: string, offset: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

export function generateDemoItinerary(values: TripFormValues): Itinerary {
  const days = calcDays(values.startDate, values.endDate);
  const styleActivityCount = values.travelStyle === 'relaxed' ? 2 : values.travelStyle === 'balanced' ? 3 : 4;
  const foodKey = values.foodPreference || 'Any cuisine';
  const foodList = FOOD_PREFS[foodKey] ?? FOOD_PREFS['Any cuisine'];
  const accKey = values.accommodationPreference || 'MidRange';
  const acc = ACCOMMODATIONS[accKey] ?? ACCOMMODATIONS.MidRange;
  const accCost = ACCOMMODATION_COSTS[accKey] ?? 3500;

  const perPersonAccommodation = accCost;
  const perPersonTransport = 800;
  const perPersonActivityCost = 600;

  const itineraryDays: ItineraryDay[] = [];

  for (let i = 0; i < days; i++) {
    const activities = pickActivities(values.interests, i);
    const dayActivities = activities.slice(0, styleActivityCount).map((name, idx) => {
      const times = ['09:00 AM', '12:30 PM', '03:00 PM', '06:00 PM'];
      const durations = ['2 hours', '1.5 hours', '2.5 hours', '3 hours'];
      return {
        time: times[idx] ?? '05:00 PM',
        name,
        type: values.interests[idx % values.interests.length] ?? 'Sightseeing',
        duration: durations[idx] ?? '2 hours',
        description: `Enjoy ${name.toLowerCase()} — a recommended experience based on your interest in ${values.interests[idx % Math.max(values.interests.length, 1)] || 'sightseeing'}. This is an estimate; verify availability locally.`,
        cost: perPersonActivityCost * values.travelers,
        location: `${values.destination} — ${['Central', 'Old Town', 'Riverside', 'Uptown'][idx % 4]} area`,
      };
    });

    const breakfastCost = 300 * values.travelers;
    const lunchCost = 500 * values.travelers;
    const dinnerCost = 700 * values.travelers;

    const activityTotal = dayActivities.reduce((s, a) => s + a.cost, 0);
    const transportCost = perPersonTransport * values.travelers;
    const accomCost = perPersonAccommodation * values.travelers;
    const dailyCost = activityTotal + transportCost + accomCost + breakfastCost + lunchCost + dinnerCost;

    itineraryDays.push({
      day: i + 1,
      date: formatDate(values.startDate, i),
      theme: ['Arrival & Exploration', 'Local Highlights', 'Nature & Culture', 'Food & Adventure', 'Hidden Gems', 'Leisure & Shopping', 'Farewell Day'][i % 7],
      activities: dayActivities,
      meals: {
        breakfast: foodList[i % foodList.length],
        lunch: foodList[(i + 1) % foodList.length],
        dinner: foodList[(i + 2) % foodList.length],
        breakfastCost,
        lunchCost,
        dinnerCost,
      },
      accommodation: {
        name: acc.name,
        type: acc.type,
        description: acc.desc,
        cost: accomCost,
      },
      transportation: {
        method: i === 0 ? 'Airport/station transfer + local taxi' : 'Public transit + walking',
        description: `Get around ${values.destination} using local transit and taxis. Cost is an estimate for ${values.travelers} traveler(s).`,
        cost: transportCost,
      },
      dailyCost,
    });
  }

  const accommodation = itineraryDays.reduce((s, d) => s + d.accommodation.cost, 0);
  const food = itineraryDays.reduce((s, d) => s + d.meals.breakfastCost + d.meals.lunchCost + d.meals.dinnerCost, 0);
  const transportation = itineraryDays.reduce((s, d) => s + d.transportation.cost, 0);
  const activities = itineraryDays.reduce((s, d) => s + d.activities.reduce((ss, a) => ss + a.cost, 0), 0);
  const total = accommodation + food + transportation + activities;

  return {
    destination: values.destination,
    summary: `A ${days}-day ${values.travelStyle} trip to ${values.destination} for ${values.travelers} traveler(s), focused on ${values.interests.join(', ').toLowerCase() || 'sightseeing'}. Estimated total: ₹${total.toLocaleString('en-IN')} (within your budget of ₹${values.budget.toLocaleString('en-IN')}). All costs are estimates — verify locally.`,
    tripDurationDays: days,
    days: itineraryDays,
    budgetBreakdown: { accommodation, food, transportation, activities, total },
    tips: [
      `Carry local currency for small vendors in ${values.destination}.`,
      'Book accommodations in advance for better rates.',
      'Keep digital and physical copies of important documents.',
      `Tip: ${values.travelStyle === 'relaxed' ? 'Leave buffer time between activities to rest.' : values.travelStyle === 'packed' ? 'Group nearby attractions to save transit time.' : 'Balance sightseeing with leisure breaks.'}`,
    ],
    isDemo: true,
  };
}
