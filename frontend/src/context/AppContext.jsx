import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [datasets, setDatasets] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const hideToast = () => setToast({ show: false, message: '', type: 'info' });

  const fetchDatasets = async () => {
    try {
      const res = await api.listDatasets();
      setDatasets(res.data.datasets || []);
      // Auto-select latest dataset if none selected
      if (!currentDataset && res.data.datasets && res.data.datasets.length > 0) {
        setCurrentDataset(res.data.datasets[0]);
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
    }
  };

  const fetchDashboards = async () => {
    try {
      const res = await api.listDashboards();
      setDashboards(res.data.dashboards || []);
    } catch (err) {
      console.error('Error fetching dashboards:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.getOverviewStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchDatasets(), fetchDashboards(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const selectDataset = (datasetOrId) => {
    if (typeof datasetOrId === 'string') {
      const found = datasets.find((d) => d.id === datasetOrId);
      if (found) setCurrentDataset(found);
    } else {
      setCurrentDataset(datasetOrId);
    }
  };

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const res = await api.loadSampleDataset();
      await refreshAll();
      setCurrentDataset(res.data.dataset);
      showToast('Demo dataset loaded successfully!', 'success');
      return res.data.dataset;
    } catch (err) {
      console.warn('Backend load-sample failed, trying local sample asset upload fallback...', err);
      try {
        const assetRes = await fetch('/sample_data/sample_sales.csv');
        if (assetRes.ok) {
          const blob = await assetRes.blob();
          const file = new File([blob], 'sample_sales.csv', { type: 'text/csv' });
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await api.uploadDataset(formData);
          await refreshAll();
          setCurrentDataset(uploadRes.data.dataset);
          showToast('Demo dataset loaded successfully!', 'success');
          return uploadRes.data.dataset;
        }
      } catch (fallbackErr) {
        console.error('Fallback upload also failed:', fallbackErr);
      }

      const msg =
        err.actionableMessage ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load demo dataset.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    try {
      setLoading(true);
      await api.resetStorage();
      setCurrentDataset(null);
      setCurrentDashboard(null);
      await refreshAll();
      showToast('All development storage reset successfully.', 'info');
    } catch (err) {
      showToast('Failed to reset storage.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        datasets,
        dashboards,
        currentDataset,
        currentDashboard,
        setCurrentDashboard,
        setCurrentDataset,
        stats,
        loading,
        setLoading,
        toast,
        showToast,
        hideToast,
        selectDataset,
        refreshAll,
        loadDemoData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
