import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
    const { signIn } = useAuthActions();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // Multi-step signup

    // Form data state
    const [formData, setFormData] = useState({
        businessName: "",
        businessEmail: "",
        fullName: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const nextStep = () => {
        if (step < 4) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Create a FormData object with all the collected data
            const signUpData = new FormData();
            signUpData.append("businessName", formData.businessName);
            signUpData.append("businessEmail", formData.businessEmail);
            signUpData.append("fullName", formData.fullName);
            signUpData.append("phoneNumber", formData.phoneNumber);
            signUpData.append("password", formData.password);

            // Sign up with business information
            signUpData.append("flow", "signUp");
            await signIn("password", signUpData);
            toast.success("Account created successfully!");
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error("Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Business Name
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Business Information</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Let's start by knowing your business name</p>
            </div>

            <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Business Name
                </label>
                <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="Enter your business name"
                    required
                />
            </div>
        </div>
    );

    // Step 2: Business Email
    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Business Email</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">We'll use this to contact your business</p>
            </div>

            <div>
                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Business Email
                </label>
                <input
                    type="email"
                    id="businessEmail"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="your@business.com"
                    required
                />
            </div>
        </div>
    );

    // Step 3: Full Name and Phone Number
    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Personal Information</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Tell us about yourself</p>
            </div>

            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Full Name
                </label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="Enter your full name"
                    required
                />
            </div>

            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Phone Number
                </label>
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="+1 (555) 000-0000"
                    required
                />
            </div>
        </div>
    );

    // Step 4: Password and Confirm Password
    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Create Password</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Secure your account with a strong password</p>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="Create a secure password"
                    required
                />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    Confirm Password
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="auth-input-field text-base dark:bg-dark-card dark:text-dark-text dark:border-dark-border w-full px-4 py-3 rounded-lg"
                    placeholder="Confirm your password"
                    required
                />
            </div>
        </div>
    );

    // Progress bar component
    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step {step} of 4</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>
            <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {step === 1 && "Business Information"}
                    {step === 2 && "Business Email"}
                    {step === 3 && "Personal Information"}
                    {step === 4 && "Password Setup"}
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8 max-w-md w-full mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text text-center">
                    Create Account
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mt-2">Join us to manage your business operations</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <ProgressBar />

                {/* Render the current step */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {/* Navigation buttons */}
                <div className="flex justify-between pt-4">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-5 py-2.5 rounded-lg text-base border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text font-medium hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto px-5 py-2.5 rounded-lg bg-primary dark:bg-blue-700 text-white text-base font-medium hover:bg-primary-hover dark:hover:bg-blue-800 transition-all duration-200 hover:shadow-md"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="ml-auto px-5 py-2.5 rounded-lg auth-button text-base font-semibold transition-all duration-200 hover:shadow-md"
                            disabled={loading || formData.password !== formData.confirmPassword}
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    )}
                </div>

                {/* Password confirmation error */}
                {step === 4 && formData.password !== formData.confirmPassword && (
                    <div className="text-red-500 dark:text-red-400 text-sm text-center py-2">
                        Passwords do not match
                    </div>
                )}
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignIn}
                        className="font-semibold text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}