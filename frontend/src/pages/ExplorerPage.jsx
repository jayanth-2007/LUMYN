import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import KPICard from '../components/dashboard/KPICard';
import CorrelationMatrix from '../components/explorer/CorrelationMatrix';
import DataPreviewTable from '../components/explorer/DataPreviewTable';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ExplorerPage() {
  const { currentDataset, showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewCols, setPreviewCols] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('columns');

  useEffect(() => {
    if (currentDataset?.id) loadProfileAndPreview(currentDataset.id, 1);
  }, [currentDataset?.id]);

  const loadProfileAndPreview = async (datasetId, pageNum = 1) => {
    setLoading(true);
    try {
      const [profRes, prevRes] = await Promise.all([
        api.profileDataset(datasetId),
        api.previewDataset(datasetId, pageNum, 25),
      ]);
      setProfile(profRes.data.profile);
      setPreviewData(prevRes.data.data);
      setPreviewCols(prevRes.data.columns);
      setPage(prevRes.data.page);
      setTotalPages(prevRes.data.total_pages);
      setTotalRows(prevRes.data.total_rows);
    } catch (err) {
      console.error('Failed to load profile or preview:', err);
      showToast('Could not load profile statistics for dataset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (!currentDataset?.id || newPage < 1 || newPage > totalPages) return;
    try {
      const res = await api.previewDataset(currentDataset.id, newPage, 25);
      setPreviewData(res.data.data);
      setPage(res.data.page);
    } catch (err) {
      showToast('Failed to load page.', 'error');
    }
  };

  if (!currentDataset) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#191927] border border-[#232334] flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-[#717187]" />
        </div>
        <h2 className="text-lg font-bold text-[#F4F4F8]">No Dataset Selected</h2>
        <p className="text-xs text-[#717187] mt-2">
          Please upload or choose a dataset from the sidebar to inspect its statistical profile.
        </p>
      </div>
    );
  }

  const tabStyles = (isActive) =>
    `px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#8B5CF6]/15 text-[#F4F4F8] border border-[#8B5CF6]/30'
        : 'text-[#717187] hover:text-[#A1A1B5] hover:bg-[#191927]'
    }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
            Dataset Explorer & Profiler
          </h1>
          <p className="text-sm text-[#717187] mt-1">
            Pandas-calculated summaries, distribution metrics, outlier diagnostics, and correlation maps.
          </p>
        </div>

        {/* Quality Score */}
        {profile && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#191927] border border-[#232334]">
            <div>
              <div className="text-[10px] font-bold text-[#717187] uppercase tracking-widest">
                Data Quality Score
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#22D3EE]">
                {profile.quality_score}/100
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Records" value={profile.rows.toLocaleString()} subtitle={`${profile.columns_count} detected columns`} icon="Layers" />
          <KPICard title="Missing Values" value={profile.missing_cells.toLocaleString()} subtitle={`${profile.missing_percentage}% total missingness`} icon="AlertTriangle" />
          <KPICard title="Duplicate Rows" value={profile.duplicate_rows.toLocaleString()} subtitle="Identical row occurrences" icon="Layers" />
          <KPICard
            title="Detected Dates"
            value={profile.date_columns?.length ? profile.date_columns.length.toString() : '0'}
            subtitle={profile.date_columns?.length ? profile.date_columns.join(', ') : 'No date columns'}
            icon="Calendar"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#232334] pb-3">
        <button onClick={() => setActiveTab('columns')} className={tabStyles(activeTab === 'columns')}>
          Column Schema & Statistics
        </button>
        <button onClick={() => setActiveTab('preview')} className={tabStyles(activeTab === 'preview')}>
          Raw Data Table
        </button>
        <button onClick={() => setActiveTab('correlations')} className={tabStyles(activeTab === 'correlations')}>
          Correlation Heatmap
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <p className="text-sm text-[#717187]">Loading dataset profile...</p>
        </div>
      )}

      {/* Tab 1: Column Schema */}
      {!loading && activeTab === 'columns' && profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(profile.columns || {}).map(([colName, col]) => (
            <Card key={colName} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h4
                    className="text-sm font-bold text-[#F4F4F8] tracking-tight truncate max-w-[180px]"
                    title={colName}
                  >
                    {colName}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold uppercase border shrink-0 ml-2 ${
                      col.type === 'numeric'
                        ? 'bg-[#22D3EE]/8 text-[#22D3EE] border-[#22D3EE]/20'
                        : col.type === 'datetime'
                        ? 'bg-[#34D399]/8 text-[#34D399] border-[#34D399]/20'
                        : 'bg-[#8B5CF6]/8 text-[#A78BFA] border-[#8B5CF6]/20'
                    }`}
                  >
                    {col.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#A1A1B5] mb-4 font-mono bg-[#191927] p-2.5 rounded-xl border border-[#232334]">
                  <div>
                    <span className="text-[#717187] block text-[10px] uppercase tracking-wide">Missing</span>
                    <span className="text-[#F4F4F8] font-semibold">
                      {col.missing_count} ({col.missing_percentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#717187] block text-[10px] uppercase tracking-wide">Unique</span>
                    <span className="text-[#F4F4F8] font-semibold">{col.unique_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Numeric stats */}
                {col.stats && col.type === 'numeric' && (
                  <div className="space-y-1 text-xs text-[#A1A1B5] font-mono">
                    {[
                      ['Mean', col.stats.mean],
                      ['Median', col.stats.median],
                      ['Std Dev', col.stats.std],
                      ['Min / Max', `${col.stats.min} / ${col.stats.max}`],
                      ['IQR', col.stats.iqr],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between py-1 border-b border-[#232334]/50">
                        <span className="text-[#717187]">{label}:</span>
                        <span className="text-[#F4F4F8]">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1">
                      <span className="text-[#FB7185]">Outliers (IQR):</span>
                      <span className="text-[#FB7185] font-bold">{col.stats.outlier_count}</span>
                    </div>
                  </div>
                )}

                {/* Categorical top values */}
                {col.stats?.top_values && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] text-[#717187] uppercase tracking-widest block font-bold">
                      Top Values
                    </span>
                    {col.stats.top_values.slice(0, 4).map((tv, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#A1A1B5] truncate max-w-[140px]">{tv.label}</span>
                          <span className="text-[#717187] font-mono">{tv.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#232334] rounded-full h-1">
                          <div
                            className="bg-[#8B5CF6] h-1 rounded-full"
                            style={{ width: `${tv.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Datetime stats */}
                {col.stats?.min_date && (
                  <div className="space-y-1 text-xs text-[#A1A1B5] font-mono">
                    <div className="flex justify-between py-1 border-b border-[#232334]/50">
                      <span className="text-[#717187]">Range:</span>
                      <span className="text-[#F4F4F8] text-[10px]">
                        {col.stats.min_date} → {col.stats.max_date}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#717187]">Days Span:</span>
                      <span className="text-[#F4F4F8]">{col.stats.days_span} days</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Data Preview */}
      {!loading && activeTab === 'preview' && (
        <DataPreviewTable
          columns={previewCols}
          data={previewData}
          page={page}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={handlePageChange}
        />
      )}

      {/* Tab 3: Correlations */}
      {!loading && activeTab === 'correlations' && profile && (
        <CorrelationMatrix correlations={profile.correlations} />
      )}
    </div>
  );
}
