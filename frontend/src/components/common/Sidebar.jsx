import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  PieChart,
  MessageSquareText,
  FolderArchive,
  Sparkles,
  RefreshCw,
  HardDrive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { datasets, currentDataset, selectDataset, loadDemoData, resetAllData, loading } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Overview',         to: '/app/overview',   icon: LayoutDashboard },
    { name: 'Upload Dataset',   to: '/app/upload',     icon: UploadCloud },
    { name: 'Dataset Explorer', to: '/app/explorer',   icon: FileSpreadsheet },
    { name: 'Auto Dashboard',   to: '/app/dashboard',  icon: PieChart },
    { name: 'AI Data Chat',     to: '/app/chat',       icon: MessageSquareText },
    { name: 'Library',          to: '/app/library',    icon: FolderArchive },
  ];

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-[#0B0B12] border-r border-[#232334] flex flex-col shrink-0 min-h-screen transition-all duration-300 relative z-10`}
    >
      {/* Brand */}
      <div className={`h-16 flex items-center border-b border-[#232334] ${collapsed ? 'px-3 justify-center' : 'px-5'}`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6D28D9] to-[#22D3EE] shadow-glow-violet flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="white" fillOpacity="0.25" stroke="white" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        ) : (
          <Logo showTagline={true} />
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[4.25rem] w-6 h-6 rounded-full bg-[#191927] border border-[#232334] text-[#717187] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/40 flex items-center justify-center transition-colors z-20 shadow-md"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Dataset Selector */}
      {!collapsed && (
        <div className="p-4 border-b border-[#232334]">
          <label className="text-[10px] font-bold text-[#717187] uppercase tracking-widest block mb-2">
            Active Dataset
          </label>
          {datasets.length > 0 ? (
            <select
              value={currentDataset?.id || ''}
              onChange={(e) => selectDataset(e.target.value)}
              className="w-full bg-[#191927] border border-[#232334] rounded-xl px-3 py-2 text-xs text-[#F4F4F8] focus:outline-none focus:border-[#8B5CF6]/60 font-medium truncate transition-colors cursor-pointer"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rows} rows)
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={async () => {
                await loadDemoData();
                navigate('/app/dashboard');
              }}
              disabled={loading}
              className="w-full text-left bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 hover:border-[#8B5CF6]/40 rounded-xl p-2.5 transition-all group"
            >
              <div className="flex items-center gap-2 text-[#A78BFA] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Load Demo Sales Data</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={`${collapsed ? 'p-2' : 'p-3'} space-y-1 flex-1`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#8B5CF6]/15 text-white border border-[#8B5CF6]/30 shadow-sm'
                    : 'text-[#717187] hover:text-[#F4F4F8] hover:bg-[#191927]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-[#717187] group-hover:text-[#A1A1B5]'}`} />
                  {!collapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[#232334] bg-[#08080D]/40 space-y-3">
          <div className="flex items-start gap-2.5 text-xs text-[#717187]">
            <HardDrive className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#A1A1B5]">Active Workspace</div>
              <div className="text-[11px] text-[#717187]">Private Local Session</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#717187] bg-[#191927] px-2 py-0.5 rounded-lg border border-[#232334] font-mono">
              Ready
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset all session datasets and dashboards?')) {
                  resetAllData();
                }
              }}
              title="Reset workspace session"
              className="text-[11px] text-[#717187] hover:text-[#FB7185] transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
