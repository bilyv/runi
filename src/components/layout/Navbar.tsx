import { UserCircle, Menu, LogOut, User, ChevronDown } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnimatedTimeDisplay } from "./AnimatedTimeDisplay";
import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const user = useQuery(api.auth.loggedInUser);
    const { signOut } = useAuthActions();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleViewProfile = () => {
        setDropdownOpen(false);
        navigate("/settings");
    };

    const handleLogout = () => {
        setDropdownOpen(false);
        void signOut();
    };

    // Get user's full name or fallback
    const fullName = user?.fullName || user?.name || user?.businessName || "User";

    // Extract initials from the full name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const initials = getInitials(fullName);

    return (
        <div className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-30 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-6">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden sm:block">
                    <AnimatedTimeDisplay />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300 group relative overflow-hidden"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <div className="relative z-10">
                        {theme === "dark" ? (
                            <Sun size={19} className="group-hover:rotate-45 transition-transform duration-500 text-yellow-500" />
                        ) : (
                            <Moon size={19} className="group-hover:-rotate-12 transition-transform duration-500 text-blue-600" />
                        )}
                    </div>
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all duration-300 border-2 ${
                            dropdownOpen 
                                ? "bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/30" 
                                : "hover:bg-gray-50 dark:hover:bg-white/5 border-transparent"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <span className="text-xs font-bold text-white tracking-wider">
                                {initials}
                            </span>
                        </div>
                        <div className="text-left hidden lg:block">
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-none mb-0.5">
                                {fullName}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {user?.role || "Administrator"}
                            </p>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/5 py-2 z-40 animate-in fade-in zoom-in duration-200">
                            <div className="px-4 py-3 mb-1 border-b border-gray-50 dark:border-white/5 lg:hidden">
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{fullName}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{user?.role || "Administrator"}</p>
                            </div>
                            
                            <button
                                onClick={handleViewProfile}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                            >
                                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                                    <User size={16} />
                                </div>
                                Account Settings
                            </button>
                            
                            <div className="my-1 border-t border-gray-50 dark:border-white/5"></div>
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                            >
                                <div className="p-1.5 rounded-lg bg-red-50/50 dark:bg-red-500/5 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                                    <LogOut size={16} />
                                </div>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
