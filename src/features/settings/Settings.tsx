import { useState } from "react";
import { UserProfile } from "./UserProfile";
import { ThemeSettings } from "./ThemeSettings";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "profile" | "appearance";

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "appearance", label: "Appearance" },
  ];

    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-body text-lg">
            Manage your personal preferences and account details.
          </p>
        </div>
        
        <SubTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(id) => setActiveTab(id as TabType)} 
        />
        
        <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "profile" && <UserProfile />}
            {activeTab === "appearance" && <ThemeSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
