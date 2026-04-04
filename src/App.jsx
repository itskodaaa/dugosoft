import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LangProvider } from '@/lib/i18n';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import PricingSettings from './pages/PricingSettings';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from './pages/Landing';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
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
import CareerMentor from './pages/CareerMentor';
import DocumentMerger from './pages/DocumentMerger';
import LinkedInOptimizer from './pages/LinkedInOptimizer';
import Analytics from './pages/Analytics';
import MyDocuments from './pages/MyDocuments';
import ResumeBuilderV2 from './pages/ResumeBuilderV2';
import OCRTools from './pages/OCRTools';
import CareerMatcher from './pages/CareerMatcher';
import Workspaces from './pages/Workspaces';
import CVVault from './pages/CVVault';
import ChatWithDocument from './pages/ChatWithDocument';
import LinkedInImport from './pages/LinkedInImport';
import CoverLetterArchitect from './pages/CoverLetterArchitect';
import JobTracker from './pages/JobTracker';
import InterviewPrep from './pages/InterviewPrep';


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
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="ats-checker" element={<ATSChecker />} />
        <Route path="translator" element={<Translator />} />
        <Route path="pdf-to-excel" element={<PdfToExcel />} />
        <Route path="file-converter" element={<FileConverter />} />
        <Route path="file-sharing" element={<FileSharing />} />
        <Route path="career-performance" element={<CareerPerformance />} />
        <Route path="cover-letter" element={<CoverLetterBuilder />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="pricing" element={<PricingSettings />} />
        <Route path="career-mentor" element={<CareerMentor />} />
        <Route path="document-merger" element={<DocumentMerger />} />
        <Route path="linkedin-optimizer" element={<LinkedInOptimizer />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="my-documents" element={<MyDocuments />} />
        <Route path="resume-builder-v2" element={<ResumeBuilderV2 />} />
        <Route path="ocr-tools" element={<OCRTools />} />
        <Route path="career-matcher" element={<CareerMatcher />} />
        <Route path="workspaces" element={<Workspaces />} />
        <Route path="cv-vault" element={<CVVault />} />
        <Route path="chat-with-document" element={<ChatWithDocument />} />
        <Route path="linkedin-import" element={<LinkedInImport />} />
        <Route path="cover-letter-architect" element={<CoverLetterArchitect />} />
        <Route path="job-tracker" element={<JobTracker />} />
        <Route path="interview-prep" element={<InterviewPrep />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LangProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </LangProvider>
    </AuthProvider>
  )
}

export default App