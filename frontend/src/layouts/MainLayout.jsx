import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Toast from '../components/common/Toast';
import { useApp } from '../context/AppContext';
import { Sparkles, HardDrive } from 'lucide-react';

const PAGE_TITLES = {
  '/app/overview': 'Workspace Overview',
  '/app/upload': 'Upload Dataset',
  '/app/explorer': 'Dataset Explorer',
  '/app/dashboard': 'Dashboard Generator',
  '/app/chat': 'AI Data Chat',
  '/app/library': 'Workspace Library',
};

export default function MainLayout() {
  const { toast, hideToast, currentDataset } = useApp();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'LUMYN';

  return (
    <div className="flex min-h-screen bg-[#08080D] text-[#F4F4F8]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#232334] bg-[#08080D]/85 backdrop-blur-xl px-6 flex items-center justify-between z-20 sticky top-0">
          {/* Page title + dataset context */}
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-[#F4F4F8] tracking-tight">{pageTitle}</h2>

            {currentDataset && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-px h-4 bg-[#232334]" />
                <div className="flex items-center gap-1.5 text-xs bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                  <span className="font-semibold text-[#A78BFA]">{currentDataset.name}</span>
                  <span className="text-[#717187] font-mono">({currentDataset.rows?.toLocaleString()} rows)</span>
                </div>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11111B] border border-[#232334] text-[#717187] font-mono text-[11px]">
              <HardDrive className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Active Workspace</span>
            </div>

            <Link
              to="/app/upload"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/25 hover:border-[#8B5CF6]/50 font-semibold text-xs transition-all shadow-[0_0_16px_rgba(139,92,246,0.25)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Upload</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#08080D]">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
