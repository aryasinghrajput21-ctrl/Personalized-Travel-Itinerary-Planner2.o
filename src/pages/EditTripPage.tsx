import { useState, useMemo, useEffect } from 'react';
import { MapPin, Calendar, Users, Wallet, Clock, Loader2, Sparkles, Utensils, BedDouble, Compass, Save } from 'lucide-react';
import type { TripFormValues, TravelStyle, Interest, Trip, Itinerary } from '@/types';
import { generateItinerary } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface EditTripPageProps {
  trip: Trip;
  onNavigate: (page: string) => void;
  onTripUpdated: (trip: Trip) => void;
}

const TRAVEL_STYLES: { value: TravelStyle; label: string; desc: string }[] = [
  { value: 'relaxed', label: 'Relaxed', desc: '2 activities/day' },
  { value: 'balanced', label: 'Balanced', desc: '3 activities/day' },
  { value: 'packed', label: 'Packed', desc: '4 activities/day' },
];
const INTERESTS: Interest[] = ['Food', 'Sightseeing', 'Nature', 'Adventure', 'Culture', 'Shopping'];
const FOOD_PREFS = ['Any cuisine', 'Vegetarian', 'Non-vegetarian', 'Vegan'];
const ACCOMMODATIONS = ['MidRange', 'Budget', 'Luxury', 'Homestay'];
const ACCOMMODATION_LABELS: Record<string, string> = {
  MidRange: 'Mid-range Hotel', Budget: 'Budget Hostel', Luxury: 'Luxury Resort', Homestay: 'Local Homestay',
};

export default function EditTripPage({ trip, onNavigate, onTripUpdated }: EditTripPageProps) {
  const [values, setValues] = useState<TripFormValues>({
    destination: trip.destination,
    country: trip.country ?? '',
    startDate: trip.start_date,
    endDate: trip.end_date,
    travelers: trip.travelers,
    budget: trip.budget,
    travelStyle: trip.travel_style,
    interests: trip.interests,
    foodPreference: trip.food_preference ?? 'Any cuisine',
    accommodationPreference: trip.accommodation_preference ?? 'MidRange',
    additionalInstructions: trip.additional_instructions ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [regeneratedItinerary, setRegeneratedItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    if (regeneratedItinerary) {
      setRegeneratedItinerary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

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
    if (values.startDate && values.endDate && new Date(values.endDate) < new Date(values.startDate)) {
      e.endDate = 'End date must be after start date';
    }
    if (values.travelers < 1) e.travelers = 'At least 1 traveler';
    if (values.budget < 1000) e.budget = 'Budget must be at least ₹1,000';
    if (values.interests.length === 0) e.interests = 'Select at least one interest';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const itin = await generateItinerary(values);
      setRegeneratedItinerary(itin);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setGenError(null);

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
        itinerary: regeneratedItinerary ?? trip.itinerary,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trips')
        .update(payload)
        .eq('id', trip.id)
        .select()
        .single();

      if (error) throw error;
      onTripUpdated(data as Trip);
      onNavigate('dashboard');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all';
  const borderClass = (field: string) => errors[field] ? 'border-red-300' : 'border-gray-200';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-sm text-gray-500 hover:text-forest-700 transition-colors mb-2"
          >
            ← Back to My Trips
          </button>
          <h1 className="text-3xl font-bold text-forest-800 tracking-tight">Edit Trip</h1>
          <p className="mt-2 text-gray-600">Update your trip details and optionally regenerate the itinerary.</p>
        </div>

        {genError && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {genError}
          </div>
        )}

        {regeneratedItinerary && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-forest-50 border border-forest-200 text-sm text-forest-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">New itinerary generated!</p>
              <p className="mt-0.5">Estimated total: ₹{regeneratedItinerary.budgetBreakdown.total.toLocaleString('en-IN')}. Save your changes to apply it.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegenerate} className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><MapPin className="w-4 h-4 inline mr-1 text-forest-600" />Destination *</label>
              <input type="text" value={values.destination} onChange={(e) => update('destination', e.target.value)} className={`${inputClass} ${borderClass('destination')}`} />
              {errors.destination && <p className="mt-1 text-xs text-red-500">{errors.destination}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Compass className="w-4 h-4 inline mr-1 text-forest-600" />Country</label>
              <input type="text" value={values.country} onChange={(e) => update('country', e.target.value)} className={`${inputClass} border-gray-200`} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Calendar className="w-4 h-4 inline mr-1 text-forest-600" />Start Date *</label>
              <input type="date" value={values.startDate} onChange={(e) => update('startDate', e.target.value)} className={`${inputClass} ${borderClass('startDate')}`} />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Calendar className="w-4 h-4 inline mr-1 text-forest-600" />End Date *</label>
              <input type="date" value={values.endDate} min={values.startDate} onChange={(e) => update('endDate', e.target.value)} className={`${inputClass} ${borderClass('endDate')}`} />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {tripDays > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sage-50 border border-sage-200 text-sm text-forest-700">
              <Clock className="w-4 h-4" /> Trip duration: <span className="font-semibold">{tripDays} day{tripDays !== 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Users className="w-4 h-4 inline mr-1 text-forest-600" />Travelers *</label>
              <input type="number" min={1} max={20} value={values.travelers} onChange={(e) => update('travelers', parseInt(e.target.value) || 1)} className={`${inputClass} ${borderClass('travelers')}`} />
              {errors.travelers && <p className="mt-1 text-xs text-red-500">{errors.travelers}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Wallet className="w-4 h-4 inline mr-1 text-forest-600" />Budget (INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                <input type="number" min={1000} step={500} value={values.budget} onChange={(e) => update('budget', parseInt(e.target.value) || 0)} className={`${inputClass} pl-8 ${borderClass('budget')}`} />
              </div>
              {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style *</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => (
                <button key={style.value} type="button" onClick={() => update('travelStyle', style.value)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all ${values.travelStyle === style.value ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500/20' : 'border-gray-200 hover:border-sage-300'}`}>
                  <div className="font-semibold text-sm text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests *</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${values.interests.includes(interest) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-700 border-gray-200 hover:border-sage-300'}`}>
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && <p className="mt-1 text-xs text-red-500">{errors.interests}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Utensils className="w-4 h-4 inline mr-1 text-forest-600" />Food Preference</label>
              <select value={values.foodPreference} onChange={(e) => update('foodPreference', e.target.value)} className={`${inputClass} border-gray-200`}>
                {FOOD_PREFS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><BedDouble className="w-4 h-4 inline mr-1 text-forest-600" />Accommodation</label>
              <select value={values.accommodationPreference} onChange={(e) => update('accommodationPreference', e.target.value)} className={`${inputClass} border-gray-200`}>
                {ACCOMMODATIONS.map((a) => <option key={a} value={a}>{ACCOMMODATION_LABELS[a]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Instructions</label>
            <textarea value={values.additionalInstructions} onChange={(e) => update('additionalInstructions', e.target.value)} rows={3} className={`${inputClass} border-gray-200 resize-none`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-700 font-semibold hover:bg-forest-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Regenerating...' : 'Regenerate Itinerary'}
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
