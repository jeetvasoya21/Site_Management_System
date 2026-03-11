/**
 * Navbar Component
 * Top header with branding, date, notifications, and user menu
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Bell, LogOut, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { projects, tasks, workers, inventory, vendors, unreadNotificationCount } = useContext(AppContext);
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const globalResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const pool = [
      ...projects.map((item) => ({
        id: item.id,
        type: 'Project',
        label: item.project_name,
        path: '/projects',
      })),
      ...tasks.map((item) => ({
        id: item.id,
        type: 'Task',
        label: item.task_name,
        path: '/tasks',
      })),
      ...workers.map((item) => ({
        id: item.id,
        type: 'Worker',
        label: item.name,
        path: '/workforce',
      })),
      ...inventory.map((item) => ({
        id: item.id,
        type: 'Inventory',
        label: item.item_name,
        path: '/inventory',
      })),
      ...vendors.map((item) => ({
        id: item.id,
        type: 'Vendor',
        label: item.vendor_name,
        path: '/vendors',
      })),
    ];

    return pool.filter((entry) => entry.label.toLowerCase().includes(query)).slice(0, 6);
  }, [inventory, projects, searchQuery, tasks, vendors, workers]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-40 flex items-center justify-between px-6">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-amber-500 hidden md:block">
          SiteOS Enterprise
        </h1>
        <p className="text-sm text-slate-400">{today}</p>
      </div>

      {/* Right side - Global Search, Notifications and User Menu */}
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <Search size={16} className="text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-50 outline-none w-64"
              placeholder="Global search projects, tasks, workers..."
            />
          </div>

          {globalResults.length > 0 && (
            <div className="absolute mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
              {globalResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800 last:border-b-0"
                  onClick={() => {
                    navigate(result.path);
                    setSearchQuery('');
                  }}
                >
                  <p className="text-slate-50 text-sm">{result.label}</p>
                  <p className="text-xs text-slate-500">{result.type}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-50 transition-colors" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-slate-50 hidden sm:block">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-lg z-50">
              {/* Profile */}
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-slate-50 font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <p className="text-xs text-amber-500 mt-1 font-medium">{user?.role?.replace('_', ' ')}</p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
