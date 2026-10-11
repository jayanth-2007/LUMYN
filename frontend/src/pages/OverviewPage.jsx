import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import KPICard from '../components/dashboard/KPICard';
import { useApp } from '../context/AppContext';
import { formatDate, formatBytes } from '../utils/formatters';
import {
  UploadCloud,
  FileSpreadsheet,
  PieChart,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function OverviewPage() {
  const { stats, datasets, dashboards, refreshAll, selectDataset, loadDemoData, loading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAll();
  }, []);

  const totalDatasets = stats?.dataset_count ?? datasets.length;
  const totalRows = stats?.total_rows_analyzed ?? 0;
  const totalDashboards = stats?.saved_dashboards_count ?? dashboards.length;
  const recentActivities = stats?.recent_activity ?? [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-sm text-[#717187] mt-1">
            Real-time analytics metrics derived from your active workspace datasets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadDemoData} loading={loading} icon={Sparkles}>
            Load Demo Data
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/app/upload')} icon={UploadCloud}>
            Upload File
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KPICard title="Datasets Managed" value={totalDatasets.toString()} subtitle="Active in your workspace" icon="Layers" />
        <KPICard title="Total Rows Analyzed" value={totalRows.toLocaleString()} subtitle="Processed and indexed" icon="TrendingUp" />
        <KPICard title="Saved Dashboards" value={totalDashboards.toString()} subtitle="Configured interactive views" icon="BarChart3" />
      </div>

      {/* Empty State Onboarding */}
      {totalDatasets === 0 && (
        <div className="relative rounded-2xl border border-dashed border-[#8B5CF6]/35 bg-[#8B5CF6]/5 p-10 text-center overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-[#8B5CF6]/8 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center mx-auto mb-4 text-[#22D3EE] shadow-glow-violet">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#F4F4F8] mb-2">No Datasets Available Yet</h2>
            <p className="text-sm text-[#717187] max-w-md mx-auto mb-6">
              Upload your first CSV or Excel file to get started, or explore the pre-built global
              retail demo dataset instantly.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button variant="primary" size="md" onClick={() => navigate('/app/upload')} icon={UploadCloud}>
                Upload Dataset
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={async () => {
                  await loadDemoData();
                  navigate('/app/dashboard');
                }}
                icon={Sparkles}
              >
                Load Demo Dataset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      {totalDatasets > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Datasets */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#8B5CF6]" />
                <h2 className="text-sm font-bold text-[#F4F4F8]">Recent Datasets</h2>
              </div>
              <Link to="/app/library" className="text-xs text-[#22D3EE] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {datasets.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  onClick={() => { selectDataset(d); navigate('/app/explorer'); }}
                  className="p-3 rounded-xl bg-[#191927] hover:bg-[#202032] border border-[#232334] hover:border-[#8B5CF6]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-[#F4F4F8] group-hover:text-[#22D3EE] transition-colors">
                      {d.name}
                    </h3>
                    <div className="text-[11px] text-[#717187] flex items-center gap-2 mt-0.5 font-mono">
                      <span>{d.rows?.toLocaleString()} rows</span>
                      <span>·</span>
                      <span>{d.columns_count} cols</span>
                      <span>·</span>
                      <span>{formatBytes(d.size_bytes)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#232334] group-hover:text-[#8B5CF6] transition-colors" />
                </div>
              ))}
              {datasets.length === 0 && (
                <p className="text-xs text-[#717187] py-6 text-center italic">No datasets uploaded yet.</p>
              )}
            </div>
          </Card>

          {/* Recent Dashboards */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#22D3EE]" />
                <h2 className="text-sm font-bold text-[#F4F4F8]">Saved Dashboards</h2>
              </div>
              <Link to="/app/library" className="text-xs text-[#22D3EE] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {dashboards.slice(0, 5).map((dash) => (
                <div
                  key={dash.id}
                  onClick={() => navigate(`/app/dashboard?id=${dash.id}`)}
                  className="p-3 rounded-xl bg-[#191927] hover:bg-[#202032] border border-[#232334] hover:border-[#22D3EE]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-[#F4F4F8] group-hover:text-[#8B5CF6] transition-colors">
                      {dash.title}
                    </h3>
                    <div className="text-[11px] text-[#717187] flex items-center gap-2 mt-0.5 font-mono">
                      <span>{dash.charts?.length || 0} charts</span>
                      <span>·</span>
                      <span>{dash.kpi_cards?.length || 0} KPIs</span>
                      <span>·</span>
                      <span>{formatDate(dash.updated_at)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#232334] group-hover:text-[#22D3EE] transition-colors" />
                </div>
              ))}
              {dashboards.length === 0 && (
                <p className="text-xs text-[#717187] py-6 text-center italic">
                  No saved dashboards yet. Generate one from any dataset!
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Activity Timeline */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#717187]" />
          <h2 className="text-sm font-bold text-[#F4F4F8]">Workspace Activity Stream</h2>
        </div>

        <div className="divide-y divide-[#232334]">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shrink-0" />
                  <span className="font-mono text-[#A1A1B5] text-[11px]">{act.action}</span>
                  <span className="text-[#717187] truncate max-w-sm">
                    {act.details?.name || act.details?.title || act.details?.query || ''}
                  </span>
                </div>
                <span className="text-[#717187] font-mono text-[11px]">{formatDate(act.timestamp)}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#717187] py-4 italic">No activity recorded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
