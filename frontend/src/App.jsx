import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import UploadPage from './pages/UploadPage';
import ExplorerPage from './pages/ExplorerPage';
import DashboardGeneratorPage from './pages/DashboardGeneratorPage';
import ChatPage from './pages/ChatPage';
import LibraryPage from './pages/LibraryPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* SaaS Application Protected Scope */}
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Navigate to="/app/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="dashboard" element={<DashboardGeneratorPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="library" element={<LibraryPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
