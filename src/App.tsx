import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./features/auth/SignInForm";
import { SignUpForm } from "./features/auth/SignUpForm";
import { ForgotPasswordForm } from "./features/auth/ForgotPasswordForm";
import { SignOutButton } from "./features/auth/SignOutButton";
import { Toaster } from "sonner";
import { BusinessDashboard } from "./components/layout/BusinessDashboard";
import { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Routes, Route } from "react-router-dom";

export default function App() {
  const [authView, setAuthView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');

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
    />;
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-card dark:text-dark-text">
        <Authenticated>
          <Routes>
            <Route path="/" element={<BusinessDashboard />} />
            <Route path="/:module" element={<BusinessDashboard />} />
          </Routes>
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

        <Toaster position="top-right" richColors />
      </div>
    </ThemeProvider>
  );
}