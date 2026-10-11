import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { formatBytes } from '../utils/formatters';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedDataset, setUploadedDataset] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { showToast, refreshAll, selectDataset, loadDemoData, loading: globalLoading } = useApp();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateAndSetFile = (file) => {
    setUploadError(null);
    setUploadedDataset(null);
    if (!file) return;

    const validExts = ['.csv', '.xlsx', '.xls'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExts.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt) {
      setUploadError('Invalid file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`File exceeds 25 MB limit (your file: ${formatBytes(file.size)}).`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.uploadDataset(formData, (percent) => setUploadProgress(percent));
      const dataset = res.data.dataset;
      setUploadedDataset(dataset);
      selectDataset(dataset);
      await refreshAll();
      showToast(`Dataset "${dataset.name}" uploaded and indexed!`, 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      const msg =
        err.actionableMessage || err.response?.data?.error || err.message || 'Failed to upload dataset.';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
          Upload Dataset
        </h1>
        <p className="text-sm text-[#717187] mt-1">
          Upload CSV or Excel files up to 25 MB for instant statistical profiling and AI dashboard generation.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <Card className="p-8">
        <form
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
            dragActive
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/8 shadow-glow-violet'
              : 'border-[#232334] bg-[#191927]/40 hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => validateAndSetFile(e.target.files[0])}
            className="hidden"
          />

          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
            dragActive
              ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6] shadow-glow-violet'
              : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]'
          }`}>
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-[#F4F4F8] mb-1">
            {dragActive ? 'Drop your file here' : 'Drag and drop your dataset here'}
          </h3>
          <p className="text-xs text-[#717187] max-w-sm mx-auto mb-6">
            Supports <span className="text-[#A1A1B5] font-semibold">CSV</span>,{' '}
            <span className="text-[#A1A1B5] font-semibold">XLSX</span>, and{' '}
            <span className="text-[#A1A1B5] font-semibold">XLS</span> formats with standard comma or
            delimiter separation.
          </p>

          <Button
            variant="secondary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Browse Local Files
          </Button>
        </form>

        {/* Selected file card */}
        {selectedFile && (
          <div className="mt-5 p-4 rounded-xl bg-[#191927] border border-[#232334] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F4F4F8] truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-[#717187] font-mono">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isUploading && !uploadedDataset && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 text-[#717187] hover:text-[#F4F4F8] rounded-lg hover:bg-[#232334] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!uploadedDataset && (
                <Button variant="primary" size="sm" onClick={handleUpload} loading={isUploading} icon={UploadCloud}>
                  Upload & Analyze
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-[#717187] font-mono">
              <span>Uploading & Parsing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#232334] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#FB7185]/8 border border-[#FB7185]/25 flex items-start gap-3 text-xs text-[#FB7185]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{uploadError}</span>
          </div>
        )}

        {/* Success Preview */}
        {uploadedDataset && (
          <div className="mt-5 p-5 rounded-xl bg-[#34D399]/5 border border-[#34D399]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                <h4 className="text-sm font-bold text-[#F4F4F8]">Dataset Indexed Successfully!</h4>
              </div>
              <span className="text-xs font-mono text-[#22D3EE]">
                {uploadedDataset.rows?.toLocaleString()} rows
              </span>
            </div>

            <div className="text-xs text-[#A1A1B5] space-y-1 font-mono mb-4">
              <p>Filename: {uploadedDataset.name}</p>
              <p>
                Columns ({uploadedDataset.columns_count}):{' '}
                {uploadedDataset.columns?.slice(0, 8).join(', ')}
                {uploadedDataset.columns_count > 8 ? '...' : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" onClick={() => navigate('/app/dashboard')} icon={Sparkles}>
                Generate Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/explorer')} icon={ArrowRight}>
                Inspect Data Profile
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Demo Option */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#11111B] border border-[#232334]">
        <div>
          <h4 className="text-sm font-bold text-[#F4F4F8]">No file at hand right now?</h4>
          <p className="text-xs text-[#717187] mt-0.5">
            Load our pre-built 300-row global retail sales sample dataset with zero friction.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const d = await loadDemoData();
              if (d) navigate('/app/dashboard');
            } catch (e) {
              // Actionable toast already shown
            }
          }}
          loading={globalLoading}
          icon={Sparkles}
        >
          Load Demo Dataset
        </Button>
      </div>
    </div>
  );
}
