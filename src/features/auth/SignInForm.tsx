import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm({ onSwitchToSignUp, onSwitchToForgotPassword }: { onSwitchToSignUp: () => void, onSwitchToForgotPassword: () => void }) {
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
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text text-center">
                    Sign In
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="businessEmail" className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                        Business Email
                    </label>
                    <input
                        type="email"
                        id="businessEmail"
                        name="businessEmail"
                        className="auth-input-field text-sm dark:bg-dark-card dark:text-dark-text dark:border-dark-border"
                        placeholder="your@business.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="auth-input-field text-sm dark:bg-dark-card dark:text-dark-text dark:border-dark-border"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                    type="submit"
                    className="auth-button text-sm py-2"
                    disabled={loading}
                >
                    {loading
                        ? "Processing..."
                        : "Sign In"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                >
                    Don't have an account? Sign up
                </button>
            </div>
        </div>
    );
}