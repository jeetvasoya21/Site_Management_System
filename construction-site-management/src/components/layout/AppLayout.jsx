/**
 * AppLayout Component
 * Main layout wrapper with Sidebar, Navbar, and content area
 * Provides consistent layout structure across all authenticated pages
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
