export type TravelStyle = 'relaxed' | 'balanced' | 'packed';

export type Interest =
  | 'Food'
  | 'Sightseeing'
  | 'Nature'
  | 'Adventure'
  | 'Culture'
  | 'Shopping';

export interface TripFormValues {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  travelStyle: TravelStyle;
  interests: Interest[];
  foodPreference: string;
  accommodationPreference: string;
  additionalInstructions: string;
}

export interface ItineraryActivity {
  time: string;
  name: string;
  type: string;
  duration: string;
  description: string;
  cost: number;
  location: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    breakfastCost: number;
    lunchCost: number;
    dinnerCost: number;
  };
  accommodation: {
    name: string;
    type: string;
    description: string;
    cost: number;
  };
  transportation: {
    method: string;
    description: string;
    cost: number;
  };
  dailyCost: number;
}

export interface ItineraryBudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  total: number;
}

export interface Itinerary {
  destination: string;
  summary: string;
  tripDurationDays: number;
  days: ItineraryDay[];
  budgetBreakdown: ItineraryBudgetBreakdown;
  tips: string[];
  isDemo: boolean;
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  country: string | null;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: number;
  travel_style: TravelStyle;
  interests: Interest[];
  food_preference: string | null;
  accommodation_preference: string | null;
  additional_instructions: string | null;
  itinerary: Itinerary | null;
  created_at: string;
  updated_at: string;
}
