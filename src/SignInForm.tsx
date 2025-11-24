import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
    const { signIn } = useAuthActions();
    const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
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
            if (flow === "signUp") {
                // Create a FormData object with all the collected data
                const signUpData = new FormData();
                signUpData.append("businessName", formData.businessName);
                signUpData.append("businessEmail", formData.businessEmail);
                signUpData.append("fullName", formData.fullName);
                signUpData.append("phoneNumber", formData.phoneNumber);
                signUpData.append("password", formData.password);
                
                // Sign up with business information
                await signIn("password", signUpData);
                toast.success("Account created successfully!");
            } else {
                // Sign in with business email and password
                const formData = new FormData(event.currentTarget);
                await signIn("password", formData);
                toast.success("Signed in successfully!");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error(
                flow === "signUp"
                    ? "Failed to create account. Please try again."
                    : "Invalid business email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Business Name
    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-500 mt-1">Let's start by knowing your business name</p>
            </div>
            
            <div>
                <label htmlFor="businessName" className="block text-xs font-medium text-gray-700 mb-1">
                    Business Name
                </label>
                <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="Enter your business name"
                    required
                />
            </div>
        </div>
    );

    // Step 2: Business Email
    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Business Email</h3>
                <p className="text-sm text-gray-500 mt-1">We'll use this to contact your business</p>
            </div>
            
            <div>
                <label htmlFor="businessEmail" className="block text-xs font-medium text-gray-700 mb-1">
                    Business Email
                </label>
                <input
                    type="email"
                    id="businessEmail"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="your@business.com"
                    required
                />
            </div>
        </div>
    );

    // Step 3: Full Name and Phone Number
    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500 mt-1">Tell us about yourself</p>
            </div>
            
            <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                </label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="Enter your full name"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                </label>
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="+1 (555) 000-0000"
                    required
                />
            </div>
        </div>
    );

    // Step 4: Password and Confirm Password
    const renderStep4 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Create Password</h3>
                <p className="text-sm text-gray-500 mt-1">Secure your account with a strong password</p>
            </div>
            
            <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="Create a secure password"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="auth-input-field text-sm"
                    placeholder="Confirm your password"
                    required
                />
            </div>
        </div>
    );

    // Progress bar component
    const ProgressBar = () => (
        <div className="mb-6">
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Step {step} of 4</span>
                <span className="text-xs font-medium text-gray-500">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 text-center">
                    {flow === "signUp" ? "Create Account" : "Sign In"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {flow === "signUp" ? (
                    <>
                        <ProgressBar />
                        
                        {/* Render the current step */}
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        
                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-2">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 rounded text-sm border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="ml-auto px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="ml-auto px-4 py-2 rounded auth-button text-sm"
                                    disabled={loading || formData.password !== formData.confirmPassword}
                                >
                                    {loading ? "Creating..." : "Create Account"}
                                </button>
                            )}
                        </div>
                        
                        {/* Password confirmation error */}
                        {step === 4 && formData.password !== formData.confirmPassword && (
                            <div className="text-red-500 text-xs text-center">
                                Passwords do not match
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div>
                            <label htmlFor="businessEmail" className="block text-xs font-medium text-gray-700 mb-1">
                                Business Email
                            </label>
                            <input
                                type="email"
                                id="businessEmail"
                                name="businessEmail"
                                className="auth-input-field text-sm"
                                placeholder="your@business.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="auth-input-field text-sm"
                                placeholder="Enter your password"
                                required
                            />
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
                    </>
                )}
            </form>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={() => {
                        setFlow(flow === "signUp" ? "signIn" : "signUp");
                        setStep(1); // Reset step when switching flows
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                    {flow === "signUp"
                        ? "Already have an account? Sign in"
                        : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    );
}