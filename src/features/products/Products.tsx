import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { AddCategoryModal } from "./AddCategoryModal";
import { ProductCategory } from "./ProductCategory";
import { ProductAdding } from "./ProductAdding";
import { LiveStock } from "./LiveStock";
import { SubTabs } from "../../components/ui/SubTabs";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "category" | "adding" | "liveStock";

export function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("liveStock");

  const products = useQuery(api.products.list, {
    search: search || undefined,
    category_id: (category as any) || undefined
  });
  const categories = useQuery(api.productCategories.list) || [];
  const deleteCategory = useMutation(api.productCategories.remove);

  const handleDeleteCategory = async (categoryId: any) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory({ id: categoryId });
      toast.success("Category deleted successfully");
    } catch (error: any) {
      if (error.message && error.message.includes("Cannot delete category that has products")) {
        toast.error("Cannot delete category that has products. Please move or delete all products in this category first.");
      } else if (error.message && error.message.includes("[CONVEX M")) {
        toast.error("CANNOT DELETE THE CATEGORY WITH PRODUCTS IN.");
      } else {
        toast.error(error.message || "Failed to delete category");
      }
    }
  };

  const tabs = [
    { id: "category", label: "Categories" },
    { id: "adding", label: "Add Product" },
    { id: "liveStock", label: "Live Stock" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
            Inventory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-body">
            Manage your product catalog and monitor stock levels.
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
            {activeTab === "category" && (
              <ProductCategory
                categories={categories}
                onAddCategory={() => setShowCategoryModal(true)}
                onEditCategory={setEditingCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}
            {activeTab === "adding" && <ProductAdding />}
            {activeTab === "liveStock" && (
              <LiveStock
                search={search}
                setSearch={setSearch}
                products={products || []}
                categories={categories}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AddCategoryModal
        isOpen={showCategoryModal || !!editingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
}
