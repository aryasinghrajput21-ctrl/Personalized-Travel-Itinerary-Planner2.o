import { useState, useMemo } from 'react';
import { MapPin, Calendar, Users, Wallet, Clock, Loader2, Sparkles, Utensils, BedDouble, Compass } from 'lucide-react';
import type { TripFormValues, TravelStyle, Interest } from '@/types';
import { generateItinerary } from '@/lib/api';
import type { Itinerary } from '@/types';

interface CreateTripPageProps {
  onItineraryGenerated: (values: TripFormValues, itinerary: Itinerary) => void;
  onNavigate: (page: string) => void;
}

const TRAVEL_STYLES: { value: TravelStyle; label: string; desc: string }[] = [
  { value: 'relaxed', label: 'Relaxed', desc: '2 activities/day, more free time' },
  { value: 'balanced', label: 'Balanced', desc: '3 activities/day, steady pace' },
  { value: 'packed', label: 'Packed', desc: '4 activities/day, see it all' },
];

const INTERESTS: Interest[] = ['Food', 'Sightseeing', 'Nature', 'Adventure', 'Culture', 'Shopping'];
const FOOD_PREFS = ['Any cuisine', 'Vegetarian', 'Non-vegetarian', 'Vegan'];
const ACCOMMODATIONS = ['MidRange', 'Budget', 'Luxury', 'Homestay'];

const ACCOMMODATION_LABELS: Record<string, string> = {
  MidRange: 'Mid-range Hotel',
  Budget: 'Budget Hostel',
  Luxury: 'Luxury Resort',
  Homestay: 'Local Homestay',
};

export default function CreateTripPage({ onItineraryGenerated, onNavigate }: CreateTripPageProps) {
  const [values, setValues] = useState<TripFormValues>({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 50000,
    travelStyle: 'balanced',
    interests: [],
    foodPreference: 'Any cuisine',
    accommodationPreference: 'MidRange',
    additionalInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const tripDays = useMemo(() => {
    if (!values.startDate || !values.endDate) return 0;
    const s = new Date(values.startDate);
    const e = new Date(values.endDate);
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
  }, [values.startDate, values.endDate]);

  const update = (field: keyof TripFormValues, value: string | number | Interest[]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleInterest = (interest: Interest) => {
    setValues((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.destination.trim()) e.destination = 'Destination is required';
    if (!values.startDate) e.startDate = 'Start date is required';
    if (!values.endDate) e.endDate = 'End date is required';
    if (values.startDate && values.endDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        e.endDate = 'End date must be after start date';
      }
    }
    if (values.travelers < 1) e.travelers = 'At least 1 traveler';
    if (values.budget < 1000) e.budget = 'Budget must be at least ₹1,000';
    if (values.interests.length === 0) e.interests = 'Select at least one interest';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const itinerary = await generateItinerary(values);
      onItineraryGenerated(values, itinerary);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all';
  const borderClass = (field: string) => errors[field] ? 'border-red-300' : 'border-gray-200';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 text-forest-700 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            AI Itinerary Generator
          </div>
          <h1 className="text-3xl font-bold text-forest-800 tracking-tight">Plan Your Trip</h1>
          <p className="mt-2 text-gray-600">Fill in the details below and let AI craft your perfect itinerary.</p>
        </div>

        {genError && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {genError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 sm:p-8 space-y-6">
          {/* Destination */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 text-forest-600" />
                Destination *
              </label>
              <input
                type="text"
                value={values.destination}
                onChange={(e) => update('destination', e.target.value)}
                placeholder="e.g. Jaipur, Goa, Bali"
                className={`${inputClass} ${borderClass('destination')}`}
              />
              {errors.destination && <p className="mt-1 text-xs text-red-500">{errors.destination}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Compass className="w-4 h-4 inline mr-1 text-forest-600" />
                Country <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={values.country}
                onChange={(e) => update('country', e.target.value)}
                placeholder="e.g. India"
                className={`${inputClass} border-gray-200`}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1 text-forest-600" />
                Start Date *
              </label>
              <input
                type="date"
                value={values.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className={`${inputClass} ${borderClass('startDate')}`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1 text-forest-600" />
                End Date *
              </label>
              <input
                type="date"
                value={values.endDate}
                min={values.startDate}
                onChange={(e) => update('endDate', e.target.value)}
                className={`${inputClass} ${borderClass('endDate')}`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {tripDays > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sage-50 border border-sage-200 text-sm text-forest-700">
              <Clock className="w-4 h-4" />
              Trip duration: <span className="font-semibold">{tripDays} day{tripDays !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Travelers & Budget */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Users className="w-4 h-4 inline mr-1 text-forest-600" />
                Number of Travelers *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={values.travelers}
                onChange={(e) => update('travelers', parseInt(e.target.value) || 1)}
                className={`${inputClass} ${borderClass('travelers')}`}
              />
              {errors.travelers && <p className="mt-1 text-xs text-red-500">{errors.travelers}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Wallet className="w-4 h-4 inline mr-1 text-forest-600" />
                Total Budget (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={values.budget}
                  onChange={(e) => update('budget', parseInt(e.target.value) || 0)}
                  className={`${inputClass} pl-8 ${borderClass('budget')}`}
                />
              </div>
              {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style *</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => update('travelStyle', style.value)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all ${
                    values.travelStyle === style.value
                      ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/20'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests * (select one or more)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    values.interests.includes(interest)
                      ? 'bg-forest-600 text-white border-forest-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-sage-300'
                  } border`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && <p className="mt-1 text-xs text-red-500">{errors.interests}</p>}
          </div>

          {/* Food & Accommodation */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Utensils className="w-4 h-4 inline mr-1 text-forest-600" />
                Food Preference
              </label>
              <select
                value={values.foodPreference}
                onChange={(e) => update('foodPreference', e.target.value)}
                className={`${inputClass} border-gray-200`}
              >
                {FOOD_PREFS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <BedDouble className="w-4 h-4 inline mr-1 text-forest-600" />
                Accommodation Preference
              </label>
              <select
                value={values.accommodationPreference}
                onChange={(e) => update('accommodationPreference', e.target.value)}
                className={`${inputClass} border-gray-200`}
              >
                {ACCOMMODATIONS.map((a) => <option key={a} value={a}>{ACCOMMODATION_LABELS[a]}</option>)}
              </select>
            </div>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Instructions <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={values.additionalInstructions}
              onChange={(e) => update('additionalInstructions', e.target.value)}
              rows={3}
              placeholder="e.g. Avoid crowded places, include kid-friendly activities, prefer walking tours..."
              className={`${inputClass} border-gray-200 resize-none`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Your Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
