import { useState } from "react";
import { toast } from "sonner";
import { User, Lock, Mail, ChevronLeft } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

interface StaffLoginFormProps {
    onSwitchToBusinessLogin: () => void;
}

export function StaffLoginForm({ onSwitchToBusinessLogin }: StaffLoginFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        // UI Only implementation
        setTimeout(() => {
            toast.info("Staff login is currently UI-only. Backend integration coming soon!");
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl p-8 max-w-md w-full mx-auto border border-gray-100 dark:border-white/5">
            <div className="text-center mb-8">
                <button
                    onClick={onSwitchToBusinessLogin}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 group"
                >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                    Back to Business Login
                </button>

                <div className="mx-auto bg-blue-50 dark:bg-blue-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-blue-600 rounded-2xl p-3 shadow-lg shadow-blue-500/30">
                        <User className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text font-display">Staff Login</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-sans">Enter your credentials to access your terminal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Staff Email"
                    placeholder="staff@runi.com"
                    type="email"
                    icon={<Mail size={18} />}
                    required
                    disabled={loading}
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        required
                        disabled={loading}
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                    {loading ? "Authenticating..." : "Access Terminal"}
                </Button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-6">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                    Secure Internal Access
                </p>
            </div>
        </div>
    );
}
