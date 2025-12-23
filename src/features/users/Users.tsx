import { useState } from "react";

import { AllStaff } from "./AllStaff";
import { RolesAndPermissions } from "./RolesAndPermissions";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "all" | "roles";

export function Users() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs = [
    { id: "all", label: "All Staff" },
    { id: "roles", label: "Permissions" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
          Staff & Roles
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-body text-lg">
          Manage your team members, their roles, and system permissions.
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
            {activeTab === "all" && <AllStaff />}
            {activeTab === "roles" && <RolesAndPermissions />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
