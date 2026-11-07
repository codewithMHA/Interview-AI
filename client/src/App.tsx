import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CareerSetupPage } from '@/pages/CareerSetupPage';
import { QuestionBankPage } from '@/pages/QuestionBankPage';
import { PlacementModulesPage } from '@/pages/PlacementModulesPage';
import { CodingPracticePage } from '@/pages/CodingPracticePage';
import { ProblemWorkspacePage } from '@/pages/ProblemWorkspacePage';
import { MockInterviewSetupPage } from '@/pages/MockInterviewSetupPage';
import { MockInterviewSessionPage } from '@/pages/MockInterviewSessionPage';
import { MockInterviewResultPage } from '@/pages/MockInterviewResultPage';
import { PracticeSandboxPage } from '@/pages/PracticeSandboxPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ResumeScannerPage } from '@/pages/ResumeScannerPage';
import { AIChatPage } from '@/pages/AIChatPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
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
              {/* AI Resume Interview Experience (thita.ai Engine) */}
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
