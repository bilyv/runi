import { useState } from "react";
import { Folder } from "./Folder";
import { Upload } from "./Upload";
import { Files } from "./Files";

type TabType = "folder" | "upload" | "files";

export function Documents() {
  const [activeTab, setActiveTab] = useState<TabType>("folder");
  const [prevTab, setPrevTab] = useState<TabType>("folder");

  const handleTabChange = (tabId: TabType) => {
    setPrevTab(activeTab);
    setActiveTab(tabId);
  };

  const tabs = [
    { id: "folder", label: "Folder" },
    { id: "upload", label: "Upload" },
    { id: "files", label: "Files" },
  ];

  // Determine animation direction
  const getAnimationClass = (tabId: TabType) => {
    if (tabId !== activeTab) return "hidden";

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const prevTabIndex = tabs.findIndex(t => t.id === prevTab);

    if (tabIndex > prevTabIndex) {
      return "animate-fadeInRight";
    } else if (tabIndex < prevTabIndex) {
      return "animate-fadeInLeft";
    }
    return "animate-fadeIn";
  };

    return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-dark-bg/50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Documents
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-sans text-sm mt-1">
            Manage and organize your business files securely
          </p>
        </div>
      </div>
      
      {/* Sub-Tabs Navigation - Modern Pill Style */}
      <div className="space-y-6">
        <div className="flex p-1 bg-gray-100 dark:bg-dark-card/50 rounded-2xl w-fit border border-gray-200 dark:border-dark-border backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out flex items-center gap-2 ${activeTab === tab.id
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-blue-500/50"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content with Smooth Transitions */}
        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
          <div className="overflow-hidden">
            <div className={`${getAnimationClass("folder")}`}>
              <Folder />
            </div>
            <div className={`${getAnimationClass("upload")}`}>
              <Upload />
            </div>
            <div className={`${getAnimationClass("files")}`}>
              <Files />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}