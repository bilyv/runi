import { useState } from "react";
import { AllTransactions } from "./AllTransactions";
import { Deposited } from "./Deposited";
import { Debtors } from "./Debtors";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "all" | "deposited" | "debtors";

export function Transactions() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs = [
    { id: "all", label: "All Transactions" },
    { id: "deposited", label: "Deposited" },
    { id: "debtors", label: "Unpaid/Debtors" },
  ];

    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-body text-lg">
            Monitor all your business financial flows in one place.
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
            {activeTab === "all" && <AllTransactions />}
            {activeTab === "deposited" && <Deposited />}
            {activeTab === "debtors" && <Debtors />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
