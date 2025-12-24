import { UserProfile } from "./UserProfile";
import { ThemeSettings } from "./ThemeSettings";
import { CurrencySettings } from "./CurrencySettings";
import { LanguageSettings } from "./LanguageSettings";
import { motion } from "framer-motion";
import { User, Palette, Settings as SettingsIcon, Globe, MapPin } from "lucide-react";

export function Settings() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 mb-2"
        >
          <SettingsIcon size={24} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-sans text-lg max-w-2xl mx-auto">
          Personalize your experience and manage your account security and appearance from one central place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <User size={20} />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Account Profile</h2>
          </div>
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm hover:shadow-md transition-shadow">
            <UserProfile />
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <Palette size={20} />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Appearance & Theme</h2>
          </div>
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm hover:shadow-md transition-shadow">
            <ThemeSettings />
          </div>
        </section>

        {/* Localization Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <MapPin size={20} />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Business Localization</h2>
          </div>
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm space-y-12">
            <CurrencySettings />
            <div className="pt-8 border-t border-gray-100 dark:border-white/5">
              <LanguageSettings />
            </div>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="pt-8 text-center border-t border-gray-100 dark:border-white/5">
        <p className="text-sm text-gray-400 font-sans">
          All changes are saved automatically to your account.
        </p>
      </div>
    </div>
  );
}
