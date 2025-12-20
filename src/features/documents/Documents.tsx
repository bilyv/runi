import { useState } from "react";
import { Folder } from "./Folder";
import { Upload } from "./Upload";
import { Files } from "./Files";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "folder" | "upload" | "files";

export function Documents() {
  const [activeTab, setActiveTab] = useState<TabType>("folder");

  const tabs = [
    { id: "folder", label: "Folders" },
    { id: "upload", label: "Upload" },
    { id: "files", label: "All Files" },
  ];

    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Documents
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-body text-lg">
            Manage your business files and folders efficiently.
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
            {activeTab === "folder" && <Folder />}
            {activeTab === "upload" && <Upload />}
            {activeTab === "files" && <Files />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
