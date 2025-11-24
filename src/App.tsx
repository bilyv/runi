import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BusinessDashboard } from "./components/BusinessDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <BusinessDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Manager</h1>
              <p className="text-gray-600">Manage your business operations efficiently</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Toaster />
    </div>
  );
}