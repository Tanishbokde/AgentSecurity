import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RunsListPage } from './pages/RunsListPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import { ArenaPage } from './pages/ArenaPage';
import { CampaignPage } from './pages/CampaignPage';
import { GuardianPage } from './pages/GuardianPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { ReplayPage } from './pages/ReplayPage';
import { ForgotPasswordPlaceholder } from './pages/ForgotPasswordPlaceholder';
import { LegalPagePlaceholder } from './pages/LegalPagePlaceholder';
import { PageTransition } from './components/PageTransition';

function AnimatedAppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <LoginPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPasswordPlaceholder />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <LegalPagePlaceholder
                title="Privacy Policy"
                subtitle="Data protection & zero-trust confidentiality"
              />
            </PageTransition>
          }
        />
        <Route
          path="/terms"
          element={
            <PageTransition>
              <LegalPagePlaceholder
                title="Terms of Service"
                subtitle="Enterprise terms & acceptable usage criteria"
              />
            </PageTransition>
          }
        />

        {/* Protected Security Operations Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/runs"
          element={
            <ProtectedRoute>
              <PageTransition>
                <RunsListPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/runs/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <RunDetailPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluations"
          element={
            <ProtectedRoute>
              <PageTransition>
                <EvaluationsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ArenaPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CampaignPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/guardian"
          element={
            <ProtectedRoute>
              <PageTransition>
                <GuardianPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/benchmarks"
          element={
            <ProtectedRoute>
              <PageTransition>
                <BenchmarksPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/replay/:runId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ReplayPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Root and Fallback redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedAppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
