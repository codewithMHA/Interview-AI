import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { ScrollToTop } from '@/components/common/ScrollToTop';

const lazyPage = <T extends Record<string, React.ComponentType<any>>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K
) => lazy(() => loader().then((m) => ({ default: m[exportName] })));

const LoginPage = lazyPage(() => import('@/pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('@/pages/RegisterPage'), 'RegisterPage');
const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage');
const ProfilePage = lazyPage(() => import('@/pages/ProfilePage'), 'ProfilePage');
const CareerSetupPage = lazyPage(() => import('@/pages/CareerSetupPage'), 'CareerSetupPage');
const QuestionBankPage = lazyPage(() => import('@/pages/QuestionBankPage'), 'QuestionBankPage');
const PlacementModulesPage = lazyPage(() => import('@/pages/PlacementModulesPage'), 'PlacementModulesPage');
const CodingPracticePage = lazyPage(() => import('@/pages/CodingPracticePage'), 'CodingPracticePage');
const ProblemWorkspacePage = lazyPage(() => import('@/pages/ProblemWorkspacePage'), 'ProblemWorkspacePage');
const MockInterviewSetupPage = lazyPage(() => import('@/pages/MockInterviewSetupPage'), 'MockInterviewSetupPage');
const MockInterviewSessionPage = lazyPage(() => import('@/pages/MockInterviewSessionPage'), 'MockInterviewSessionPage');
const MockInterviewResultPage = lazyPage(() => import('@/pages/MockInterviewResultPage'), 'MockInterviewResultPage');
const PracticeSandboxPage = lazyPage(() => import('@/pages/PracticeSandboxPage'), 'PracticeSandboxPage');
const RoadmapPage = lazyPage(() => import('@/pages/RoadmapPage'), 'RoadmapPage');
const AnalyticsPage = lazyPage(() => import('@/pages/AnalyticsPage'), 'AnalyticsPage');
const ResumeScannerPage = lazyPage(() => import('@/pages/ResumeScannerPage'), 'ResumeScannerPage');
const AIChatPage = lazyPage(() => import('@/pages/AIChatPage'), 'AIChatPage');
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'), 'NotFoundPage');

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route element={<MainLayout />}>
              {/* Public Exploration & Practice Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/questions" element={<QuestionBankPage />} />
              <Route path="/placement-modules" element={<PlacementModulesPage />} />
              <Route path="/doubt-solver" element={<Navigate to="/chat" replace />} />
              <Route path="/ask-ai" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<AIChatPage />} />
              <Route path="/ai-mentor" element={<AIChatPage />} />
              <Route path="/coding" element={<CodingPracticePage />} />
              <Route path="/practice" element={<CodingPracticePage />} />
              <Route path="/practice-sandbox" element={<PracticeSandboxPage />} />
              <Route path="/playground" element={<PracticeSandboxPage />} />
              <Route path="/problems/:idOrSlug" element={<ProblemWorkspacePage />} />

              {/* Private Protected Student Routes (Requires Sign In / Sign Up) */}
              {/* AI Interview Experience (Voice & Text) */}
              <Route
                path="/ai-interview"
                element={
                  <ProtectedRoute>
                    <MockInterviewSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-interview"
                element={
                  <ProtectedRoute>
                    <MockInterviewSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-interview"
                element={
                  <ProtectedRoute>
                    <MockInterviewSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews"
                element={
                  <ProtectedRoute>
                    <MockInterviewSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-interview/:id"
                element={
                  <ProtectedRoute>
                    <MockInterviewSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/:id"
                element={
                  <ProtectedRoute>
                    <MockInterviewSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-interview/:id/result"
                element={
                  <ProtectedRoute>
                    <MockInterviewResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-interview/:id/results"
                element={
                  <ProtectedRoute>
                    <MockInterviewResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-interview/:id/report"
                element={
                  <ProtectedRoute>
                    <MockInterviewResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/:id/results"
                element={
                  <ProtectedRoute>
                    <MockInterviewResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/:id/result"
                element={
                  <ProtectedRoute>
                    <MockInterviewResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-scanner"
                element={
                  <ProtectedRoute>
                    <ResumeScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <ProtectedRoute>
                    <ResumeScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireOnboarded={true}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roadmap"
                element={
                  <ProtectedRoute requireOnboarded={true}>
                    <RoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requireOnboarded={true}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-setup"
                element={
                  <ProtectedRoute>
                    <CareerSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
