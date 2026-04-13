import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Package,
  BarChart3,
  Truck,
  ClipboardList,
  ArrowLeftRight,
  CalendarClock,
  UserCheck,
  BellRing,
  FileSpreadsheet,
  Menu,
  X,
  IndianRupee,
  FileText,
  HardHat,
} from 'lucide-react';

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return '';
  return role.trim().replace(/\s+/g, '_');
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const currentRole = normalizeRole(user?.role);

  // Role-based navigation visibility
  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: FolderOpen,
      roles: ['Admin', 'Project_Manager'],
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: CheckSquare,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Workers',
      path: '/workforce',
      icon: Users,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarClock,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Assignments',
      path: '/assignments',
      icon: UserCheck,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Package,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Vendors',
      path: '/vendors',
      icon: Truck,
      roles: ['Admin', 'Project_Manager'],
    },
    {
      label: 'Procurement',
      path: '/procurement',
      icon: ClipboardList,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Material Issue',
      path: '/material-issue',
      icon: ArrowLeftRight,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Project Team',
      path: '/project-team',
      icon: Users,
      roles: ['Admin', 'Project_Manager'],
    },
    {
      label: 'Finance',
      path: '/finance',
      icon: BarChart3,
      roles: ['Admin', 'Project_Manager'],
    },
    {
      label: 'Leave Requests',
      path: '/leaves',
      icon: FileText,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: BellRing,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileSpreadsheet,
      roles: ['Admin', 'Project_Manager', 'Site_Engineer'],
    },

    // Worker-only navigation
    {
      label: 'Dashboard',
      path: '/worker',
      icon: LayoutDashboard,
      roles: ['Worker'],
    },
    {
      label: 'Attendance',
      path: '/worker/attendance',
      icon: CalendarClock,
      roles: ['Worker'],
    },
    {
      label: 'Leave Application',
      path: '/worker/leave',
      icon: FileText,
      roles: ['Worker'],
    },
    {
      label: 'Salary',
      path: '/worker/salary',
      icon: IndianRupee,
      roles: ['Worker'],
    },
  ];

  // Filter items based on user role
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  const isActive = (path) => {
    if (path === '/' || path === '/worker') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-slate-900 p-2 rounded-lg border border-slate-800 text-primary-500"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800/60 pt-20 md:pt-0 transition-transform duration-300 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto pb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-[#7c3aed] rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white drop-shadow-md">
              Site<span className="text-primary-500">OS</span>
            </h1>
          </div>

          <nav className="space-y-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-slate-800/80 text-primary-400 font-semibold shadow-inner border border-slate-700/50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent hover:border-slate-800/50'
                  }`}
                >
                  <Icon size={20} className={active ? 'drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]' : ''} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
          <div className="text-sm">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Logged in as</p>
            <p className="text-slate-200 font-medium">{user?.name}</p>
            <p className="text-xs text-primary-500/80 mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
