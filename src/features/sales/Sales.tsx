import { useState } from "react";
import { AddSale } from "./AddSale";
import { ManageSales } from "./ManageSales";
import { AuditSales } from "./AuditSales";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

import { DebtorsList } from "../../components/DebtorsList";

type TabType = "add" | "manage" | "audit" | "debtors";

export function Sales() {
  const [activeTab, setActiveTab] = useState<TabType>("add");

  const tabs = [
    { id: "add", label: "Add Sale" },
    { id: "manage", label: "Manage Sales" },
    { id: "audit", label: "Audit Sales" },
    { id: "debtors", label: "Debtors" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
          Sales
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-body text-lg">
          Record and manage your business sales transactions.
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
            {activeTab === "add" && <AddSale />}
            {activeTab === "manage" && <ManageSales />}
            {activeTab === "audit" && <AuditSales />}
            {activeTab === "debtors" && <DebtorsList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
