import { StaffProfile } from "./StaffProfile";
import { ThemeSettings } from "./ThemeSettings";
import { LanguageSettings } from "./LanguageSettings";
import { motion } from "framer-motion";
import { User, Palette, Settings as SettingsIcon, ShieldCheck, Globe } from "lucide-react";

interface StaffSettingsProps {
    staffUser: any;
}

export function StaffSettings({ staffUser }: StaffSettingsProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex p-4 bg-blue-500/10 rounded-3xl text-blue-600 dark:text-blue-400 mb-2 border border-blue-500/20 shadow-lg shadow-blue-500/10"
                >
                    <SettingsIcon size={28} />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight"
                >
                    Staff Settings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 font-sans text-lg max-w-2xl mx-auto"
                >
                    Manage your personal profile and customize your workspace appearance.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Profile Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-6"
                >
                    <div className="flex items-center space-x-3 px-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <User size={22} />
                        </div>
                        <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Account Profile</h2>
                    </div>
                    <StaffProfile staffUser={staffUser} />
                </motion.section>

                {/* Appearance Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="space-y-6"
                >
                    <div className="flex items-center space-x-3 px-4">
                        <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Palette size={22} />
                        </div>
                        <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Appearance & Theme</h2>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-1 shadow-sm overflow-hidden">
                        <ThemeSettings />
                    </div>
                </motion.section>

                {/* Localization Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="space-y-6"
                >
                    <div className="flex items-center space-x-3 px-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Globe size={22} />
                        </div>
                        <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Localization</h2>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm">
                        <LanguageSettings />
                    </div>
                </motion.section>

                {/* Security Info Card */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-500/20"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <h3 className="text-2xl font-bold font-display">Security Notice</h3>
                        <p className="text-blue-100 font-sans leading-relaxed">
                            To change your password or update sensitive information not listed here, please contact your administrator. All login attempts and sessions are monitored for security purposes.
                        </p>
                    </div>
                </motion.section>
            </div>

            {/* Footer Info */}
            <div className="pt-12 text-center border-t border-gray-200/50 dark:border-white/5">
                <p className="text-sm text-gray-400 font-sans">
                    Preferences are stored locally and synced with your staff account.
                </p>
            </div>
        </div>
    );
}
