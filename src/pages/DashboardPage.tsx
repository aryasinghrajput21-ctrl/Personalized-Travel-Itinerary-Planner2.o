import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Calendar, Users, Wallet, Trash2, Eye, Pencil, Plus,
  Loader2, AlertCircle, Clock, Compass
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Trip } from '@/types';
import ConfirmDialog from '@/components/ConfirmDialog';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onViewTrip: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
}

export default function DashboardPage({ onNavigate, onViewTrip, onEditTrip }: DashboardPageProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError('Failed to load trips. Please try again.');
    } else {
      setTrips((data ?? []) as Trip[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('trips').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      setError('Failed to delete trip. Please try again.');
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#faf9f6]">
        <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#faf9f6] px-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={loadTrips} className="px-5 py-2 rounded-lg bg-forest-600 text-white font-medium hover:bg-forest-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest-800 tracking-tight">My Trips</h1>
            <p className="mt-1 text-gray-600">
              {trips.length === 0 ? 'No trips yet — start planning!' : `${trips.length} saved trip${trips.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="px-5 py-2.5 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-forest-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips planned yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first AI-powered itinerary and it will appear here for easy access.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="px-6 py-3 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Plan My First Trip
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onView={() => onViewTrip(trip)}
                onEdit={() => onEditTrip(trip)}
                onDelete={() => setDeleteTarget(trip)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this trip?"
          message={`Are you sure you want to delete your trip to ${deleteTarget.destination}? This cannot be undone.`}
          confirmLabel="Delete Trip"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, onView, onEdit, onDelete }: {
  trip: Trip;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const days = trip.itinerary?.tripDurationDays ?? 0;
  const totalCost = trip.itinerary?.budgetBreakdown.total ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="bg-gradient-to-br from-forest-600 to-forest-700 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{trip.destination}</h3>
            {trip.country && <p className="text-sm text-white/70">{trip.country}</p>}
          </div>
          {trip.itinerary?.isDemo ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 text-xs font-medium border border-amber-300/30">
              Demo
            </span>
          ) : trip.itinerary ? (
            <span className="px-2 py-0.5 rounded-full bg-sage-400/30 text-sage-100 text-xs font-medium border border-sage-300/30">
              AI
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest-600" />
            <span>{trip.start_date} → {trip.end_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-600" />
            <span>{days} day{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-forest-600" />
            <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-forest-600" />
            <span>Budget: ₹{trip.budget.toLocaleString('en-IN')}</span>
          </div>
          {trip.interests.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <MapPin className="w-4 h-4 text-forest-600 flex-shrink-0" />
              {trip.interests.slice(0, 3).map((i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-sage-100 text-forest-700 text-xs font-medium">{i}</span>
              ))}
              {trip.interests.length > 3 && <span className="text-xs text-gray-400">+{trip.interests.length - 3}</span>}
            </div>
          )}
        </div>

        {totalCost > 0 && (
          <div className="px-3 py-2 rounded-lg bg-sage-50 border border-sage-100 mb-4 text-sm">
            <span className="text-gray-500">Est. Total: </span>
            <span className="font-semibold text-forest-700">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={onView}
            className="flex-1 py-2 rounded-lg bg-forest-600 text-white text-sm font-medium hover:bg-forest-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            title="Edit trip"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
            title="Delete trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
