import { UserCircle } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnimatedTimeDisplay } from "./AnimatedTimeDisplay";

export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const user = useQuery(api.auth.loggedInUser);

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <AnimatedTimeDisplay />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-1.5 text-gray-500 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-colors"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-all">
                    <div className="w-7 h-7 bg-blue-100 dark:bg-dark-card text-blue-600 dark:text-dark-text rounded-full flex items-center justify-center">
                        <UserCircle size={18} />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                            {user?.fullName || user?.name || user?.businessName || "User"}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}