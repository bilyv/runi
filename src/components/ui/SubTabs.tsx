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
    <div className={`flex justify-center w-full mb-8 ${className}`}>
      <div className="flex items-center gap-1 p-1.5 bg-gray-100/80 dark:bg-dark-card/80 rounded-2xl border border-gray-200/50 dark:border-dark-border/50 backdrop-blur-md shadow-lg shadow-gray-200/20 dark:shadow-black/20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative px-6 py-2.5 text-sm font-semibold transition-all duration-500 rounded-xl font-display tracking-tight
                ${isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-dark-border shadow-md rounded-xl"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
