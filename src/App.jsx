import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from './pages/Landing';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ResumeBuilder from './pages/ResumeBuilder';
import ATSChecker from './pages/ATSChecker';
import Translator from './pages/Translator';
import PdfToExcel from './pages/PdfToExcel';
import History from './pages/History';
import SettingsPage from './pages/SettingsPage';
import FileConverter from './pages/FileConverter';
import FileSharing from './pages/FileSharing';
import CareerPerformance from './pages/CareerPerformance';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="ats-checker" element={<ATSChecker />} />
        <Route path="translator" element={<Translator />} />
        <Route path="pdf-to-excel" element={<PdfToExcel />} />
        <Route path="file-converter" element={<FileConverter />} />
        <Route path="file-sharing" element={<FileSharing />} />
        <Route path="career-performance" element={<CareerPerformance />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App