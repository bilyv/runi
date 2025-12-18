import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { AddCategoryModal } from "./AddCategoryModal";
import { ProductCategory } from "./ProductCategory";
import { ProductAdding } from "./ProductAdding";
import { LiveStock } from "./LiveStock";

type TabType = "category" | "adding" | "liveStock";

export function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("liveStock");
  const [prevTab, setPrevTab] = useState<TabType>("liveStock");

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
      // Show user-friendly error message for categories with products
      if (error.message && error.message.includes("Cannot delete category that has products")) {
        toast.error("Cannot delete category that has products. Please move or delete all products in this category first.");
      } else if (error.message && error.message.includes("[CONVEX M")) {
        // Hide raw Convex error messages
        toast.error("CANNOT DELETE THE CATEGORY WITH PRODUCTS IN.");
      } else {
        toast.error(error.message || "Failed to delete category");
      }
    }
  };

  const handleTabChange = (tabId: TabType) => {
    setPrevTab(activeTab);
    setActiveTab(tabId);
  };

  const tabs = [
    { id: "category", label: "Category" },
    { id: "adding", label: "Adding" },
    { id: "liveStock", label: "Live Stock" },
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Product Inventory</h1>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-dark-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-6 py-4 text-sm font-medium relative transition-all duration-300 ease-in-out ${activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-card/50"
                }`}
              style={{
                borderTopLeftRadius: tab.id === tabs[0].id ? '0.75rem' : '0',
                borderTopRightRadius: tab.id === tabs[tabs.length - 1].id ? '0.75rem' : '0'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content with Slide Animation */}
        <div className="p-6 overflow-hidden">
          <div className={`${getAnimationClass("category")}`}>
            <ProductCategory
              categories={categories}
              onAddCategory={() => setShowCategoryModal(true)}
              onEditCategory={setEditingCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
          <div className={`${getAnimationClass("adding")}`}>
            <ProductAdding
            />
          </div>
          <div className={`${getAnimationClass("liveStock")}`}>
            <LiveStock
              search={search}
              setSearch={setSearch}
              products={products || []}
              categories={categories}
            />
          </div>
        </div>
      </div>



      {/* Add/Edit Category Modal */}
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
