import { useState } from "react";
import { ExpenseCategoryManager } from "./ExpenseCategoryManager";
import { ExpenseCreator } from "./ExpenseCreator";
import { ExpenseList } from "./ExpenseList";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "category" | "createExpenses" | "all";

export function Expenses() {
  const [activeTab, setActiveTab] = useState<TabType>("category");

  const tabs = [
    { id: "category", label: "Categories" },
    { id: "createExpenses", label: "Create Expense" },
    { id: "all", label: "All Expenses" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Expenses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-body">
            Track and manage your business expenses and categories.
          </p>
        </div>
        
        <SubTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(id) => setActiveTab(id as TabType)} 
        />
      </div>
      
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "category" && <ExpenseCategoryManager />}
            {activeTab === "createExpenses" && <ExpenseCreator />}
            {activeTab === "all" && <ExpenseList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
