import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ToastContainer from './components/ui/ToastContainer';
import Navbar from './components/ui/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { Loader } from 'lucide-react';

// Route protection for Authenticated Users
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isLoading, addToast } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10">
          <Loader className="w-10 h-10 text-[#264653] animate-spin" />
        </div>
        <p className="text-xs font-serif font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
          Opening Security Vault...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    addToast('Forbidden: Admin privilege required', 'error');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// App Layout Wrapper to selectively render Navbar
function AppContent() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 font-sans antialiased">
      <Navbar />
      <ToastContainer />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}
