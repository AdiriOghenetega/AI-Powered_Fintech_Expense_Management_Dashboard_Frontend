import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ReportsPage } from "@/pages/Reports";
import { BudgetsPage } from "@/pages/Budgets";
import { AnalyticsPage } from "@/pages/Analytics";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackendWarmup } from "@/components/common/BackendWarmup";
import { useBackendWarmup } from "@/hooks/useBackendWarmup";
import { onBackendWarmupNeeded } from "@/services/api";
import { CreditCard } from "lucide-react";

// Configure React Query with custom error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry if backend needs warmup
        if (error?.needsWarmup) return false;
        // Otherwise retry once
        return failureCount < 1;
      },
      // Show error notifications
      throwOnError: false,
    },
    mutations: {
      retry: (error: any) => {
        // Don't retry if backend needs warmup
        if (error?.needsWarmup) return false;
        return false; // Don't retry mutations by default
      },
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 float-animation">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center float-animation">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const authState = useAuthState();
  const { isWarming, handleRequestError, startWarmup } = useBackendWarmup({
    pingInterval: 3000,
    timeout: 120000,
  });

  // Listen for warmup events from the API layer
  useEffect(() => {
    const unsubscribe = onBackendWarmupNeeded((needsWarmup) => {
      if (needsWarmup) {
        startWarmup();
      }
    });

    return unsubscribe;
  }, [startWarmup]);

  // Add global error handler for React Query
  useEffect(() => {
    const errorHandler = (error: any) => {
      if (error?.needsWarmup || error?.isBackendDown) {
        handleRequestError(error);
      }
    };

    // Listen to query client errors
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'observerResultsUpdated') {
        const query = event.query;
        if (query.state.error) {
          errorHandler(query.state.error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleRequestError]);

  return (
    <AuthContext.Provider value={authState}>
      {/* Backend Warmup Overlay */}
      <BackendWarmup isWarming={isWarming} />

      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordForm />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordForm />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpenseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <BudgetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">404</span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Page not found
                  </h1>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Return to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;