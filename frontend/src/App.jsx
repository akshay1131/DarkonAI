import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AssetsInventory from './pages/AssetsInventory';
import NewScan from './pages/NewScan';
import ScanResults from './pages/ScanResults';
import History from './pages/History';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center font-mono text-xs tracking-[0.25em] text-cyan-400">
        VALIDATING SOC CREDENTIALS...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-[#07090E] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetsInventory />} />
            <Route path="/scan/new" element={<NewScan />} />
            <Route path="/scan/results" element={<ScanResults />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#07090E]" />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
