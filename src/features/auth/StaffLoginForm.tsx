import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StaffLoginFormProps {
    onSwitchToBusinessLogin: () => void;
    onLogin: (token: string) => void;
}

export function StaffLoginForm({ onSwitchToBusinessLogin, onLogin }: StaffLoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const staffLogin = useMutation(api.staff.login);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const user = await staffLogin({
                email,
                password,
            });

            toast.success("Login successful");
            if (user.session_token) {
                localStorage.setItem("staff_session_token", user.session_token);
                // Update parent state immediately
                onLogin(user.session_token);
            }

            // Redirect to dashboard
            navigate("/staff/dashboard");

        } catch (error: any) {
            const errorMessage = error.data || error.message || "Failed to login. Please check your credentials.";
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-8">
                <button
                    onClick={onSwitchToBusinessLogin}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Staff Login</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Access your terminal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                    <Input
                        type="email"
                        placeholder="staff@runi.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-12"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <button
                            type="button"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-12"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-2"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin w-5 h-5" />
                            <span>Authenticating...</span>
                        </div>
                    ) : (
                        "Access Terminal"
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-6">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                    Secure Internal Access Only
                </p>
            </div>
        </div>
    );
}
