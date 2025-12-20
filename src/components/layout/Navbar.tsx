import { UserCircle, Menu } from "lucide-react";
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
        <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white/40 dark:bg-dark-card/40 backdrop-blur-md border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-1.5 text-gray-500 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-colors"
                >
                    <Menu size={18} />
                </button>
                <AnimatedTimeDisplay />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-1.5 text-gray-500 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-colors"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-all"
                    >
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {initials}
                            </span>
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                                {fullName}
                            </p>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 z-20">
                            <button
                                onClick={handleViewProfile}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card/50 transition-colors"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card/50 transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}