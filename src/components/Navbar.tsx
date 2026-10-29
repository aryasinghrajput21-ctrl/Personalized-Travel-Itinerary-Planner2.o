import { Compass, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user
    ? [
        { label: 'Home', page: 'landing' },
        { label: 'Plan a Trip', page: 'create' },
        { label: 'My Trips', page: 'dashboard' },
      ]
    : [
        { label: 'Home', page: 'landing' },
        { label: 'Plan a Trip', page: 'create' },
      ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#faf9f6]/95 backdrop-blur-sm border-b border-sage-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('landing')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-600 to-forest-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-forest-800 tracking-tight">
              TripWise <span className="text-sage-600">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'text-forest-700 bg-sage-100'
                    : 'text-gray-600 hover:text-forest-700 hover:bg-sage-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="ml-2 px-5 py-2 rounded-lg text-sm font-medium bg-forest-600 text-white hover:bg-forest-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-sage-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  currentPage === item.page
                    ? 'text-forest-700 bg-sage-100'
                    : 'text-gray-600 hover:bg-sage-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-left text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-left bg-forest-600 text-white"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
