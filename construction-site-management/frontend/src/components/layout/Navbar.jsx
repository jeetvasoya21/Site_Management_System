/**
 * Navbar Component
 * Dark Theme Header
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Bell, LogOut, Search, Check } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { projects, tasks, workers, inventory, vendors, notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useContext(AppContext);
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
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
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const pool = [
      ...projects.map(item => ({ id: item.id, type: 'Project', label: item.project_name, path: '/projects' })),
      ...tasks.map(item => ({ id: item.id, type: 'Task', label: item.task_name, path: '/tasks' })),
      ...workers.map(item => ({ id: item.id, type: 'Worker', label: item.name, path: '/workforce' })),
      ...inventory.map(item => ({ id: item.id, type: 'Inventory', label: item.item_name, path: '/inventory' })),
      ...vendors.map(item => ({ id: item.id, type: 'Vendor', label: item.vendor_name, path: '/vendors' })),
    ];
    return pool.filter(entry => entry.label.toLowerCase().includes(query)).slice(0, 6);
  }, [inventory, projects, searchQuery, tasks, vendors, workers]);

  const recentNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 z-40 flex items-center justify-between px-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold font-sans tracking-tight text-white drop-shadow-md hidden md:block">
          Site<span className="text-primary-500">OS</span>
        </h1>
        <p className="text-sm text-slate-400 hidden sm:block font-medium">{today}</p>
      </div>

      {/* Right side - Global Search, Notifications and User Menu */}
      <div className="flex items-center gap-5">
        <div className="relative hidden lg:block">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-100 outline-none w-64 placeholder-slate-500"
              placeholder="Global search projects, tasks, workers..."
            />
          </div>

          {globalResults.length > 0 && (
            <div className="absolute mt-2 w-full bg-slate-900 border border-slate-700/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-50">
              {globalResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition-colors"
                  onClick={() => { navigate(result.path); setSearchQuery(''); }}
                >
                  <p className="text-slate-200 font-medium text-sm">{result.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{result.type}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            className="relative p-2 text-slate-400 hover:text-primary-400 transition-all hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsUserMenuOpen(false); }}
          >
            <Bell size={20} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 border-2 border-slate-950 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 max-h-[420px] bg-slate-900 border border-slate-700/50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                <p className="text-slate-100 font-semibold text-sm">Notifications</p>
                {unreadNotificationCount > 0 && (
                  <button
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    onClick={() => markAllNotificationsRead()}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto max-h-[320px] scrollbar-thin">
                {recentNotifications.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">No notifications</p>
                ) : (
                  recentNotifications.map(note => (
                    <div
                      key={note.id}
                      className={`px-4 py-3 border-b border-slate-800 last:border-b-0 ${
                        note.read ? '' : 'bg-slate-800/40 relative before:constent-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{note.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{note.message}</p>
                        </div>
                        {!note.read && (
                          <button
                            className="p-1 text-primary-400 hover:text-primary-300 flex-shrink-0"
                            onClick={() => markNotificationRead(note.id)}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-800 bg-slate-800/20">
                <button
                  className="w-full text-center text-xs text-primary-400 hover:text-primary-300 py-1 transition-colors font-medium"
                  onClick={() => { navigate('/notifications'); setIsNotifOpen(false); }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-[#7c3aed] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(79,70,229,0.5)]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-300 hidden sm:block">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700/50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
              <div className="px-4 py-4 bg-slate-800/30 border-b border-slate-800">
                <p className="text-slate-100 font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                <span className="inline-block px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded text-[10px] uppercase font-bold mt-3 tracking-wider shadow-[0_0_8px_rgba(79,70,229,0.2)]">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition-colors font-medium border-t border-slate-800"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isNotifOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setIsUserMenuOpen(false); setIsNotifOpen(false); }}
        />
      )}
    </nav>
  );
};

export default Navbar;
