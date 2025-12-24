import { useState, useEffect } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const languages = [
    { id: "en", name: "English", flag: "🇺🇸", native: "English" },
    { id: "fr", name: "French", flag: "🇫🇷", native: "Français" },
    { id: "rw", name: "Kinyarwanda", flag: "🇷🇼", native: "Ikinyarwanda" },
    { id: "sw", name: "Swahili", flag: "🇰🇪", native: "Kiswahili" },
    { id: "es", name: "Spanish", flag: "🇪🇸", native: "Español" },
];

export function LanguageSettings() {
    const [selectedLang, setSelectedLang] = useState(localStorage.getItem("app_language") || "en");
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (id: string) => {
        setSelectedLang(id);
        localStorage.setItem("app_language", id);
        setIsOpen(false);
        // In a real app, you would trigger a translation refresh here (e.g., i18next.changeLanguage)
    };

    const currentLang = languages.find((l) => l.id === selectedLang) || languages[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Interface Language</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language for the dashboard</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-between w-full md:w-64 px-4 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-500/50 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{currentLang.flag}</span>
                            <div className="text-left">
                                <div className="leading-none">{currentLang.name}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{currentLang.native}</div>
                            </div>
                        </div>
                        <ChevronDown size={18} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-2 space-y-1">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.id}
                                            onClick={() => handleLanguageChange(lang.id)}
                                            className={cn(
                                                "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all",
                                                selectedLang === lang.id
                                                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{lang.flag}</span>
                                                <div className="text-left">
                                                    <div className="font-medium">{lang.name}</div>
                                                    <div className="text-[10px] opacity-70">{lang.native}</div>
                                                </div>
                                            </div>
                                            {selectedLang === lang.id && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
