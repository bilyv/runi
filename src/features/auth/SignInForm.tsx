import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";

export function SignInForm({
    onSwitchToSignUp,
    onSwitchToForgotPassword,
    onSwitchToStaffLogin
}: {
    onSwitchToSignUp: () => void,
    onSwitchToForgotPassword: () => void,
    onSwitchToStaffLogin: () => void
}) {
    const { signIn } = useAuthActions();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Sign in with business email and password
            const formData = new FormData(event.currentTarget);
            formData.append("flow", "signIn");
            await signIn("password", formData);
            toast.success("Signed in successfully!");
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error("Invalid business email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8 max-w-md w-full mx-auto">
            <div className="text-center mb-8">
                <div className="mx-auto bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Welcome back</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your business account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        Business Email
                    </label>
                    <input
                        type="email"
                        id="businessEmail"
                        name="businessEmail"
                        className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                        placeholder="your@business.com"
                        required
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={onSwitchToForgotPassword}
                            className="text-sm text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            Forgot?
                        </button>
                    </div>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="auth-button text-base py-3 rounded-lg w-full font-semibold transition-all duration-200 hover:shadow-md"
                    disabled={loading}
                >
                    {loading
                        ? "Signing in..."
                        : "Sign In"}
                </button>
            </form>

            <div className="mt-6 space-y-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignUp}
                        className="font-semibold text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Sign up
                    </button>
                </p>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="button"
                        onClick={onSwitchToStaffLogin}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-2 mx-auto"
                    >
                        <User className="w-4 h-4" />
                        Staff Member? Login here
                    </button>
                </div>
            </div>
        </div>
    );
}