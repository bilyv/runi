import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./features/auth/SignInForm";
import { SignUpForm } from "./features/auth/SignUpForm";
import { ForgotPasswordForm } from "./features/auth/ForgotPasswordForm";
import { Toaster } from "sonner";
import { BusinessDashboard } from "./components/layout/BusinessDashboard";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { StaffLoginForm } from "./features/auth/StaffLoginForm";
import { StaffDashboard } from "./features/staff/StaffDashboard";
import { StaffDashboardSkeleton } from "./features/staff/StaffDashboardSkeleton";
import NotFound from "./pages/NotFound";

function AppContent() {
  const [authView, setAuthView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [staffUser, setStaffUser] = useState<any | null>(null);
  const [staffToken, setStaffToken] = useState<string | null>(localStorage.getItem('staff_session_token'));

  const navigate = useNavigate();
  const location = useLocation();

  // Validate session if token exists
  const validatedStaff = useQuery(api.staff.validateSession, staffToken ? { token: staffToken } : "skip");
  const isStaffLoading = staffToken !== null && validatedStaff === undefined;

  useEffect(() => {
    if (validatedStaff) {
      setStaffUser(validatedStaff);
      // Valid session found, if we are on login OR root, go to dashboard
      if (location.pathname === '/staff/login' || location.pathname === '/') {
        navigate('/staff/dashboard', { replace: true });
      }
    } else if (staffToken && validatedStaff === null) {
      // Token invalid or expired
      localStorage.removeItem('staff_session_token');
      setStaffToken(null);
      setStaffUser(null);
      // If we were on dashboard, go to login
      if (location.pathname.startsWith('/staff/dashboard')) {
        navigate('/staff/login');
      }
    }
  }, [validatedStaff, staffToken, location.pathname, navigate]);

  const AuthForm = () => {
    if (authView === 'signUp') {
      return <SignUpForm onSwitchToSignIn={() => setAuthView('signIn')} />;
    }
    if (authView === 'forgotPassword') {
      return <ForgotPasswordForm onSwitchToSignIn={() => setAuthView('signIn')} />;
    }
    return <SignInForm
      onSwitchToSignUp={() => setAuthView('signUp')}
      onSwitchToForgotPassword={() => setAuthView('forgotPassword')}
      onSwitchToStaffLogin={() => navigate('/staff/login')}
    />;
  };

  if (isStaffLoading) {
    return <StaffDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-card dark:text-dark-text">
      <Routes>
        {/* Business/Admin Routes */}
        {/* Staff Routes */}
        <Route path="/staff/login" element={
          <div className="min-h-screen flex items-center justify-center p-4">
            <StaffLoginForm
              onSwitchToBusinessLogin={() => navigate('/')}
              onLogin={(token) => setStaffToken(token)}
            />
          </div>
        } />

        <Route path="/staff/dashboard" element={
          staffUser ? (
            <StaffDashboard
              staffUser={staffUser}
              onLogout={() => {
                localStorage.removeItem('staff_session_token');
                setStaffToken(null);
                setStaffUser(null);
                navigate('/staff/login');
              }}
            />
          ) : (
            <Navigate to="/staff/login" replace />
          )
        } />

        {/* Home / Login Route */}
        <Route path="/" element={
          <>
            <Authenticated>
              <BusinessDashboard />
            </Authenticated>
            <Unauthenticated>
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Runi</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your business operations efficiently</p>
                  </div>
                  <AuthForm />
                </div>
              </div>
            </Unauthenticated>
          </>
        } />

        {/* Business Sub-routes - ONLY match if authenticated */}
        <Route path="/:module" element={
          <>
            <Authenticated>
              <BusinessDashboard />
            </Authenticated>
            <Unauthenticated>
              <NotFound />
            </Unauthenticated>
          </>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}