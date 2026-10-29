import { useState } from 'react';
import {
  Clock, MapPin, Utensils, BedDouble, Bus, Wallet,
  Save, ArrowLeft, Calendar, Users, Lightbulb, Info, Loader2, CheckCircle, Sparkles, Pencil
} from 'lucide-react';
import type { Itinerary, TripFormValues, Trip } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface ItineraryPageProps {
  values: TripFormValues;
  itinerary: Itinerary;
  onNavigate: (page: string) => void;
  onTripSaved: (trip: Trip) => void;
  existingTrip?: Trip | null;
}

export default function ItineraryPage({ values, itinerary, onNavigate, onTripSaved, existingTrip }: ItineraryPageProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!existingTrip);
  const [saveError, setSaveError] = useState<string | null>(null);

  const remaining = values.budget - itinerary.budgetBreakdown.total;
  const overBudget = remaining < 0;

  const handleSave = async () => {
    if (!user) {
      onNavigate('auth');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        destination: values.destination,
        country: values.country || null,
        start_date: values.startDate,
        end_date: values.endDate,
        travelers: values.travelers,
        budget: values.budget,
        travel_style: values.travelStyle,
        interests: values.interests,
        food_preference: values.foodPreference || null,
        accommodation_preference: values.accommodationPreference || null,
        additional_instructions: values.additionalInstructions || null,
        itinerary: itinerary,
      };

      if (existingTrip) {
        const { data, error } = await supabase
          .from('trips')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', existingTrip.id)
          .select()
          .single();
        if (error) throw error;
        onTripSaved(data as Trip);
      } else {
        const { data, error } = await supabase
          .from('trips')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        onTripSaved(data as Trip);
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save trip.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => onNavigate(existingTrip ? 'dashboard' : 'create')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-700 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {existingTrip ? 'Back to My Trips' : 'Back to Form'}
            </button>
            <h1 className="text-3xl font-bold text-forest-800 tracking-tight">
              {itinerary.destination}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-forest-600" />{values.startDate} → {values.endDate}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-forest-600" />{itinerary.tripDurationDays} days</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-forest-600" />{values.travelers} traveler{values.travelers !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || (saved && !existingTrip)}
            className="px-5 py-2.5 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Trip'}
          </button>
        </div>

        {saveError && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Demo mode notice */}
        {itinerary.isDemo && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Demo Mode</p>
              <p className="text-sm text-amber-700 mt-0.5">
                This is a sample itinerary generated without an AI API key. To get AI-powered personalized itineraries, add an OpenAI API key as a Supabase edge function secret named <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">OPENAI_API_KEY</code>.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{itinerary.summary}</p>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Wallet className="w-5 h-5 text-forest-600" />
            <h2 className="text-lg font-semibold text-gray-900">Budget Summary</h2>
            <span className="text-xs text-gray-400">(estimates)</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <BudgetCard icon={BedDouble} label="Accommodation" amount={itinerary.budgetBreakdown.accommodation} color="forest" />
            <BudgetCard icon={Utensils} label="Food" amount={itinerary.budgetBreakdown.food} color="sage" />
            <BudgetCard icon={Bus} label="Transportation" amount={itinerary.budgetBreakdown.transportation} color="forest" />
            <BudgetCard icon={MapPin} label="Activities" amount={itinerary.budgetBreakdown.activities} color="sage" />
            <BudgetCard icon={Wallet} label="Total Estimated" amount={itinerary.budgetBreakdown.total} color="forest" highlight />
            <div className={`rounded-xl p-4 border ${overBudget ? 'bg-red-50 border-red-200' : 'bg-sage-50 border-sage-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${overBudget ? 'text-red-600' : 'text-forest-700'}`}>Remaining Budget</span>
              </div>
              <p className={`text-xl font-bold ${overBudget ? 'text-red-700' : 'text-forest-800'}`}>
                ₹{Math.abs(remaining).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {overBudget ? 'Over budget by' : 'Under budget by'} ₹{Math.abs(remaining).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
            <Info className="w-3.5 h-3.5" />
            Your stated budget: ₹{values.budget.toLocaleString('en-IN')}. All costs are estimates — verify locally.
          </div>
        </div>

        {/* Day-by-day */}
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-sage-100 overflow-hidden">
              <div className="bg-gradient-to-r from-forest-700 to-forest-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Day {day.day} — {day.theme}</h3>
                    <p className="text-sm text-white/70">{day.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">Daily Cost</p>
                    <p className="text-lg font-bold text-white">₹{day.dailyCost.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Activities */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Activities</h4>
                  <div className="space-y-3">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg bg-sage-50/50 border border-sage-100">
                        <div className="flex-shrink-0 w-20 text-right">
                          <p className="text-sm font-semibold text-forest-700">{activity.time}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{activity.duration}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {activity.location}
                          </p>
                          <p className="text-sm text-gray-600 mt-1.5">{activity.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-forest-700">₹{activity.cost.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">est.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meals */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Meals</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <MealCard label="Breakfast" name={day.meals.breakfast} cost={day.meals.breakfastCost} />
                    <MealCard label="Lunch" name={day.meals.lunch} cost={day.meals.lunchCost} />
                    <MealCard label="Dinner" name={day.meals.dinner} cost={day.meals.dinnerCost} />
                  </div>
                </div>

                {/* Accommodation & Transport */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-forest-50/50 border border-forest-100">
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="w-4 h-4 text-forest-600" />
                      <span className="text-sm font-semibold text-gray-700">Accommodation</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{day.accommodation.name}</p>
                    <p className="text-xs text-gray-500">{day.accommodation.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{day.accommodation.description}</p>
                    <p className="text-sm font-semibold text-forest-700 mt-2">₹{day.accommodation.cost.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-normal">est.</span></p>
                  </div>
                  <div className="p-4 rounded-lg bg-sage-50/50 border border-sage-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="w-4 h-4 text-sage-600" />
                      <span className="text-sm font-semibold text-gray-700">Transportation</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{day.transportation.method}</p>
                    <p className="text-sm text-gray-600 mt-1">{day.transportation.description}</p>
                    <p className="text-sm font-semibold text-forest-700 mt-2">₹{day.transportation.cost.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-normal">est.</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        {itinerary.tips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Travel Tips</h2>
            </div>
            <ul className="space-y-2">
              {itinerary.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-500 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => onNavigate('create')}
            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Plan Another Trip
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex-1 py-3 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors flex items-center justify-center gap-2"
          >
            View My Trips
          </button>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({ icon: Icon, label, amount, color, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  amount: number;
  color: 'forest' | 'sage';
  highlight?: boolean;
}) {
  const bgClass = highlight ? 'bg-forest-600 border-forest-600' : color === 'forest' ? 'bg-forest-50 border-forest-100' : 'bg-sage-50 border-sage-100';
  const textClass = highlight ? 'text-white' : 'text-gray-900';
  const labelClass = highlight ? 'text-white/70' : 'text-gray-500';

  return (
    <div className={`rounded-xl p-4 border ${bgClass}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? 'text-white/80' : color === 'forest' ? 'text-forest-600' : 'text-sage-600'}`} />
        <span className={`text-xs font-medium ${labelClass}`}>{label}</span>
      </div>
      <p className={`text-xl font-bold ${textClass}`}>
        ₹{amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function MealCard({ label, name, cost }: { label: string; name: string; cost: number }) {
  return (
    <div className="p-3 rounded-lg bg-sage-50/50 border border-sage-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{name}</p>
      <p className="text-sm font-semibold text-forest-700 mt-1">₹{cost.toLocaleString('en-IN')}</p>
    </div>
  );
}
