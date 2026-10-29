import { Compass, MapPin, Wallet, Sparkles, Calendar, Users } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const heroImage = 'https://images.pexels.com/photos/34408978/pexels-photo-34408978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Planning',
    desc: 'Get personalized day-by-day itineraries tailored to your interests, budget, and travel style in seconds.',
  },
  {
    icon: Wallet,
    title: 'Budget-Aware',
    desc: 'Every itinerary includes estimated costs for accommodation, food, transport, and activities — all in INR.',
  },
  {
    icon: MapPin,
    title: 'Smart Routing',
    desc: 'Nearby attractions are grouped together to minimize travel time and maximize your experience.',
  },
  {
    icon: Calendar,
    title: 'Flexible Schedules',
    desc: 'Choose a relaxed, balanced, or packed itinerary — the AI adjusts activity count to match your pace.',
  },
];

const showcaseImages = [
  {
    url: 'https://images.pexels.com/photos/2549017/pexels-photo-2549017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'Beach Getaways',
    desc: 'Sun-soaked tropical escapes',
  },
  {
    url: 'https://images.pexels.com/photos/37718865/pexels-photo-37718865.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'City Breaks',
    desc: 'Explore historic streets and culture',
  },
  {
    url: 'https://images.pexels.com/photos/13985982/pexels-photo-13985982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    title: 'Mountain Treks',
    desc: 'Adventure in the great outdoors',
  },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Mountain landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-900/50 to-forest-800/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-sage-200" />
              <span className="text-sm text-white/90 font-medium">Powered by AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight">
              Your Next Adventure,<br />Planned by AI.
            </h1>
            <p className="mt-6 text-lg text-white/85 leading-relaxed max-w-xl">
              Create personalized travel itineraries that match your budget, interests, and travel style.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('create')}
                className="px-7 py-3.5 rounded-xl bg-forest-500 text-white font-semibold hover:bg-forest-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Plan My Trip
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-7 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold border border-white/30 hover:bg-white/20 transition-all"
              >
                View My Trips
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
              Travel planning, reimagined
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              TripWise AI takes the guesswork out of travel planning with intelligent, personalized itineraries.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-forest-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
              Where will you go?
            </h2>
            <p className="mt-4 text-gray-600">From beaches to mountains to historic cities — AI plans it all.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {showcaseImages.map((item) => (
              <div
                key={item.title}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onNavigate('create')}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest-700 to-forest-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Compass className="w-12 h-12 text-sage-300 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to start planning?
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Tell us where you want to go, and let AI craft the perfect itinerary for you.
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="mt-8 px-8 py-3.5 rounded-xl bg-white text-forest-700 font-semibold hover:bg-sage-50 transition-all shadow-lg"
          >
            Plan My Trip
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-forest-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sage-300" />
            <span className="text-sm text-white/70">TripWise AI</span>
          </div>
          <p className="text-xs text-white/50">
            All itinerary costs are estimates. Verify availability and prices locally.
          </p>
        </div>
      </footer>
    </div>
  );
}
