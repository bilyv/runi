import React from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
}

interface SubTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function SubTabs({ tabs, activeTab, onChange, className = "" }: SubTabsProps) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-dark-card/50 rounded-xl w-fit border border-gray-200/50 dark:border-dark-border/50 backdrop-blur-sm ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-5 py-2 text-sm font-medium transition-all duration-300 rounded-lg
              ${isActive 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-dark-border shadow-sm rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
