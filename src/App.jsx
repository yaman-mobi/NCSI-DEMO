import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PersonaProvider } from './context/PersonaContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRedirect from './components/AuthRedirect';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DatasetsPage from './pages/DatasetsPage';
import MyQueriesPage from './pages/MyQueriesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HelpPage from './pages/HelpPage';
import SearchPage from './pages/SearchPage';
import AddIndicatorPage from './pages/AddIndicatorPage';
import AdminPersonasPage from './pages/AdminPersonasPage';
import ReportsListPage from './pages/ReportsListPage';
import ReportBuilderPage from './pages/ReportBuilderPage';
import InsightDetailPage from './pages/InsightDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <PersonaProvider>
         <BrowserRouter basename="/ncsi_demo/">
          <ErrorBoundary>
            <AuthRedirect>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route element={<Layout />}>
                  <Route path="/datasets" element={<DatasetsPage />} />
                  <Route path="/datasets/add-indicator" element={<AddIndicatorPage />} />
                  <Route path="/reports" element={<ReportsListPage />} />
                  <Route path="/my-queries" element={<MyQueriesPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/admin/personas" element={<AdminPersonasPage />} />
                  <Route path="/insights/:id" element={<InsightDetailPage />} />
                </Route>
                <Route path="/report/:id" element={<ReportBuilderPage />} />
              </Routes>
            </AuthRedirect>
          </ErrorBoundary>
        </BrowserRouter>
      </PersonaProvider>
    </AuthProvider>
  );
}
