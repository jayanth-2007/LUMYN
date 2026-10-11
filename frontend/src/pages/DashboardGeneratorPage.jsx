import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import KPICard from '../components/dashboard/KPICard';
import ChartCard from '../components/dashboard/ChartCard';
import FilterBar from '../components/dashboard/FilterBar';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { triggerPrint } from '../utils/exportUtils';
import {
  Sparkles,
  Save,
  Printer,
  Edit2,
  Trash2,
  Lightbulb,
  PieChart,
  UploadCloud,
} from 'lucide-react';

export default function DashboardGeneratorPage() {
  const [searchParams] = useSearchParams();
  const dashboardIdFromUrl = searchParams.get('id');
  const navigate = useNavigate();

  const { currentDataset, showToast, refreshAll, dashboards } = useApp();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    if (dashboardIdFromUrl) {
      loadSavedDashboard(dashboardIdFromUrl);
    } else if (currentDataset?.id) {
      generateFreshDashboard(currentDataset.id);
    }
  }, [dashboardIdFromUrl, currentDataset?.id]);

  const loadSavedDashboard = async (id) => {
    setLoading(true);
    try {
      const res = await api.getDashboard(id);
      const dash = res.data.dashboard;
      setDashboard(dash);
      setCustomTitle(dash.title);
    } catch (err) {
      showToast('Could not load requested dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateFreshDashboard = async (datasetId) => {
    setLoading(true);
    try {
      const res = await api.generateDashboard(datasetId);
      const dash = res.data.dashboard;
      setDashboard(dash);
      setCustomTitle(dash.title);
      setActiveFilters({});
    } catch (err) {
      showToast('Dashboard auto-generation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDashboard = async () => {
    if (!dashboard) return;
    setSaving(true);
    try {
      const payload = { ...dashboard, title: customTitle || dashboard.title };
      let res;
      if (dashboard.id && !dashboard.id.startsWith('temp_')) {
        res = await api.updateDashboard(dashboard.id, { title: customTitle });
      } else {
        res = await api.saveDashboard(payload);
      }
      setDashboard(res.data.dashboard);
      await refreshAll();
      showToast('Dashboard configuration saved successfully!', 'success');
      navigate(`/app/dashboard?id=${res.data.dashboard.id}`, { replace: true });
    } catch (err) {
      showToast('Failed to save dashboard.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDashboard = async () => {
    if (!dashboard?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${dashboard.title}"?`)) return;
    try {
      await api.deleteDashboard(dashboard.id);
      await refreshAll();
      showToast('Dashboard deleted.', 'info');
      navigate('/app/overview');
    } catch (err) {
      showToast('Failed to delete dashboard.', 'error');
    }
  };

  const handleFilterChange = (col, val) => {
    setActiveFilters((prev) => ({ ...prev, [col]: val }));
  };

  const handleResetFilters = () => setActiveFilters({});

  const filteredCharts = (dashboard?.charts || []).map((chart) => {
    if (!chart.data || !Array.isArray(chart.data)) return chart;
    let filteredData = [...chart.data];
    Object.entries(activeFilters).forEach(([col, filterVal]) => {
      if (filterVal && filterVal !== 'all') {
        filteredData = filteredData.filter((item) => {
          if (item[col] !== undefined) return String(item[col]) === String(filterVal);
          if (item.label !== undefined && String(item.label) === String(filterVal)) return true;
          return true;
        });
      }
    });
    return { ...chart, data: filteredData };
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center mb-5 shadow-glow-violet animate-pulse">
          <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <h3 className="text-lg font-bold text-[#F4F4F8] mb-2">Synthesizing Dashboard</h3>
        <p className="text-xs text-[#717187] max-w-sm">
          Analyzing distributions, calculating aggregated metrics, and plotting tailored visualizations...
        </p>
      </div>
    );
  }

  // No dashboard state
  if (!dashboard) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#191927] border border-[#232334] flex items-center justify-center mx-auto mb-4">
          <PieChart className="w-8 h-8 text-[#717187]" />
        </div>
        <h2 className="text-lg font-bold text-[#F4F4F8]">No Dashboard Loaded</h2>
        <p className="text-xs text-[#717187] mt-2 mb-5">
          Select an active dataset or open a saved dashboard from the Library.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/app/upload')} icon={UploadCloud}>
          Upload New Dataset
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {isEditingTitle ? (
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="text-2xl font-extrabold text-[#F4F4F8] bg-[#191927] border border-[#8B5CF6]/50 rounded-xl px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 w-full max-w-lg"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
                {dashboard.title}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                title="Rename Dashboard"
                className="p-1.5 text-[#717187] hover:text-[#F4F4F8] rounded-lg hover:bg-[#191927] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={triggerPrint} icon={Printer}>
            Print View
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveDashboard} loading={saving} icon={Save}>
            Save Dashboard
          </Button>
          {dashboard.id && !dashboard.id.startsWith('temp_') && (
            <Button variant="danger" size="sm" onClick={handleDeleteDashboard} icon={Trash2}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Insights Alert */}
      {dashboard.insights && dashboard.insights.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#8B5CF6]/6 border border-[#8B5CF6]/20">
          <div className="p-2 rounded-xl bg-[#8B5CF6]/15 text-[#22D3EE] shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F4F4F8] uppercase tracking-widest mb-1.5">
              Automated Data Insights
            </h4>
            <ul className="space-y-1 text-xs text-[#A1A1B5]">
              {dashboard.insights.map((insight, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={dashboard.filter_dimensions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* KPI Cards */}
      {dashboard.kpi_cards && dashboard.kpi_cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard.kpi_cards.map((kpi) => (
            <KPICard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCharts.map((chart) => (
          <ChartCard key={chart.id} chart={chart} />
        ))}
      </div>
    </div>
  );
}
