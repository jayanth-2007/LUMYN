import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  FolderArchive,
  FileSpreadsheet,
  PieChart,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';

export default function LibraryPage() {
  const { datasets, dashboards, refreshAll, selectDataset, showToast, loadDemoData } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('datasets');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDashId, setEditingDashId] = useState(null);
  const [editingDashTitle, setEditingDashTitle] = useState('');

  const filteredDatasets = datasets.filter((d) =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDashboards = dashboards.filter((d) =>
    (d.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteDataset = async (datasetId, name) => {
    if (!window.confirm(`Delete dataset "${name}"?`)) return;
    try {
      await api.deleteDataset(datasetId);
      await refreshAll();
      showToast(`Dataset "${name}" deleted.`, 'info');
    } catch (err) {
      showToast('Failed to delete dataset.', 'error');
    }
  };

  const handleDeleteDashboard = async (dashboardId, title) => {
    if (!window.confirm(`Delete dashboard "${title}"?`)) return;
    try {
      await api.deleteDashboard(dashboardId);
      await refreshAll();
      showToast(`Dashboard "${title}" deleted.`, 'info');
    } catch (err) {
      showToast('Failed to delete dashboard.', 'error');
    }
  };

  const handleRenameDashboard = async (dashboardId) => {
    if (!editingDashTitle.trim()) return;
    try {
      await api.updateDashboard(dashboardId, { title: editingDashTitle });
      setEditingDashId(null);
      await refreshAll();
      showToast('Dashboard renamed successfully.', 'success');
    } catch (err) {
      showToast('Failed to rename dashboard.', 'error');
    }
  };

  const tabStyles = (isActive, color = 'violet') =>
    `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? color === 'cyan'
          ? 'bg-[#22D3EE]/10 text-[#F4F4F8] border border-[#22D3EE]/25'
          : 'bg-[#8B5CF6]/15 text-[#F4F4F8] border border-[#8B5CF6]/25'
        : 'text-[#717187] hover:text-[#A1A1B5] hover:bg-[#191927]'
    }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
            Workspace Library
          </h1>
          <p className="text-sm text-[#717187] mt-1">
            Manage your uploaded datasets and saved dashboard configurations.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/app/upload')} icon={FileSpreadsheet}>
          Upload New File
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232334] pb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('datasets')} className={tabStyles(activeTab === 'datasets')}>
            Datasets ({datasets.length})
          </button>
          <button onClick={() => setActiveTab('dashboards')} className={tabStyles(activeTab === 'dashboards', 'cyan')}>
            Dashboards ({dashboards.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#717187] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#191927] border border-[#232334] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F4F8] placeholder-[#717187] focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/25 transition-colors"
          />
        </div>
      </div>

      {/* Datasets Tab */}
      {activeTab === 'datasets' && (
        <div className="space-y-3">
          {filteredDatasets.length > 0 ? (
            filteredDatasets.map((d) => (
              <Card key={d.id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F8] flex items-center gap-2 flex-wrap">
                      <span>{d.name}</span>
                      {d.is_demo && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20 font-semibold">
                          Demo
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#717187] mt-1 font-mono">
                      <span>{d.rows?.toLocaleString()} rows</span>
                      <span>·</span>
                      <span>{d.columns_count} columns</span>
                      <span>·</span>
                      <span>{formatBytes(d.size_bytes)}</span>
                      <span>·</span>
                      <span>{formatDate(d.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { selectDataset(d); navigate('/app/explorer'); }}
                  >
                    Explore
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { selectDataset(d); navigate('/app/dashboard'); }}
                    icon={Sparkles}
                  >
                    Generate
                  </Button>
                  <button
                    onClick={() => handleDeleteDataset(d.id, d.name)}
                    title="Delete Dataset"
                    className="p-2 text-[#717187] hover:text-[#FB7185] rounded-lg hover:bg-[#FB7185]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-[#191927] border border-[#232334] flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-[#717187]" />
              </div>
              <h3 className="text-sm font-bold text-[#F4F4F8] mb-1">No Datasets Found</h3>
              <p className="text-xs text-[#717187] mb-4">
                {searchQuery ? 'No datasets match your search.' : 'You have not uploaded any datasets yet.'}
              </p>
              <Button variant="secondary" size="sm" onClick={loadDemoData} icon={Sparkles}>
                Load Demo Sales Dataset
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Dashboards Tab */}
      {activeTab === 'dashboards' && (
        <div className="space-y-3">
          {filteredDashboards.length > 0 ? (
            filteredDashboards.map((dash) => (
              <Card key={dash.id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] shrink-0">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    {editingDashId === dash.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingDashTitle}
                          onChange={(e) => setEditingDashTitle(e.target.value)}
                          className="bg-[#191927] border border-[#22D3EE]/50 rounded-lg px-2 py-0.5 text-xs text-[#F4F4F8] focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameDashboard(dash.id)}
                        />
                        <Button variant="cyan" size="sm" onClick={() => handleRenameDashboard(dash.id)}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingDashId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#F4F4F8]">{dash.title}</h3>
                        <button
                          onClick={() => { setEditingDashId(dash.id); setEditingDashTitle(dash.title); }}
                          className="p-1 text-[#717187] hover:text-[#F4F4F8] rounded hover:bg-[#191927] transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#717187] mt-1 font-mono">
                      <span>{dash.charts?.length || 0} charts</span>
                      <span>·</span>
                      <span>{dash.kpi_cards?.length || 0} KPIs</span>
                      <span>·</span>
                      <span>Updated {formatDate(dash.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/app/dashboard?id=${dash.id}`)}
                    icon={ExternalLink}
                  >
                    Open
                  </Button>
                  <button
                    onClick={() => handleDeleteDashboard(dash.id, dash.title)}
                    title="Delete Dashboard"
                    className="p-2 text-[#717187] hover:text-[#FB7185] rounded-lg hover:bg-[#FB7185]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-[#191927] border border-[#232334] flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-6 h-6 text-[#717187]" />
              </div>
              <h3 className="text-sm font-bold text-[#F4F4F8] mb-1">No Saved Dashboards</h3>
              <p className="text-xs text-[#717187]">
                Generate a dashboard from any dataset and click "Save Dashboard".
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
