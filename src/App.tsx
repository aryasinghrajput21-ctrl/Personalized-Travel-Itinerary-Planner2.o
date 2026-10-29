import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import CreateTripPage from '@/pages/CreateTripPage';
import ItineraryPage from '@/pages/ItineraryPage';
import DashboardPage from '@/pages/DashboardPage';
import EditTripPage from '@/pages/EditTripPage';
import Toast from '@/components/Toast';
import type { TripFormValues, Itinerary, Trip } from '@/types';

type Page = 'landing' | 'auth' | 'create' | 'itinerary' | 'dashboard' | 'edit';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [formValues, setFormValues] = useState<TripFormValues | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Redirect logic: if page requires auth and user isn't signed in, send to auth
  useEffect(() => {
    if (loading) return;
    if (!user && (page === 'dashboard' || page === 'edit' || page === 'itinerary')) {
      setPage('auth');
    }
  }, [user, loading, page]);

  const handleNavigate = (target: string) => {
    const targetPage = target as Page;
    if ((targetPage === 'dashboard' || targetPage === 'edit' || targetPage === 'itinerary') && !user) {
      setPage('auth');
      return;
    }
    setPage(targetPage);
  };

  const handleItineraryGenerated = (values: TripFormValues, itin: Itinerary) => {
    setFormValues(values);
    setItinerary(itin);
    setViewingTrip(null);
    setPage('itinerary');
  };

  const handleTripSaved = (trip: Trip) => {
    setViewingTrip(trip);
    setToast({ message: 'Trip saved successfully!', type: 'success' });
  };

  const handleViewTrip = (trip: Trip) => {
    setViewingTrip(trip);
    if (trip.itinerary) {
      setItinerary(trip.itinerary);
      setFormValues({
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
      setPage('itinerary');
    } else {
      setPage('dashboard');
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setPage('edit');
  };

  const handleTripUpdated = (trip: Trip) => {
    setToast({ message: 'Trip updated successfully!', type: 'success' });
    setEditingTrip(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar currentPage={page} onNavigate={handleNavigate} />

      {page === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {page === 'auth' && <AuthPage onNavigate={handleNavigate} />}
      {page === 'create' && (
        user ? (
          <CreateTripPage onItineraryGenerated={handleItineraryGenerated} onNavigate={handleNavigate} />
        ) : (
          <AuthPrompt onNavigate={handleNavigate} />
        )
      )}
      {page === 'itinerary' && formValues && itinerary && (
        <ItineraryPage
          values={formValues}
          itinerary={itinerary}
          onNavigate={handleNavigate}
          onTripSaved={handleTripSaved}
          existingTrip={viewingTrip}
        />
      )}
      {page === 'dashboard' && user && (
        <DashboardPage onNavigate={handleNavigate} onViewTrip={handleViewTrip} onEditTrip={handleEditTrip} />
      )}
      {page === 'edit' && user && editingTrip && (
        <EditTripPage trip={editingTrip} onNavigate={handleNavigate} onTripUpdated={handleTripUpdated} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function AuthPrompt({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-forest-800 mb-3">Sign in to plan a trip</h2>
        <p className="text-gray-600 mb-6">Create a free account or sign in to start generating personalized AI itineraries.</p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors"
        >
          Sign In / Sign Up
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
