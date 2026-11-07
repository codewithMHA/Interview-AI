import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PlacementAIChatWidget } from '@/components/chat/PlacementAIChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060609] text-slate-900 dark:text-slate-100 transition-colors relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Global Floating AI Placement Mentor Widget */}
      <PlacementAIChatWidget />
    </div>
  );
};
