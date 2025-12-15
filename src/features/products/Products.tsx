import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { toast } from "sonner";
import { AddCategoryModal } from "./AddCategoryModal";
import { ProductCategory } from "./ProductCategory";
import { ProductAdding } from "./ProductAdding";
import { LiveStock } from "./LiveStock";

type TabType = "category" | "adding" | "liveStock";

export function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
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
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteCategory = useMutation(api.productCategories.remove);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...formData });
        toast.success("Product updated successfully");
        setEditingProduct(null);
      } else {
        await createProduct(formData);
        toast.success("Product created successfully");
        setShowAddModal(false);
      }
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleDeleteCategory = async (categoryId: any) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory({ id: categoryId });
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
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
        {activeTab === "adding" && (
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </Button>
        )}
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
              onAddProduct={() => setShowAddModal(true)}
            />
          </div>
          <div className={`${getAnimationClass("liveStock")}`}>
            <LiveStock
              search={search}
              setSearch={setSearch}
              products={products || []}
              categories={categories}
              onEditProduct={setEditingProduct}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
      />

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

function ProductModal({ isOpen, onClose, onSubmit, product }: any) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    cost_per_box: 0,
    price_per_box: 0,
    quantity_box: 0,
    boxed_low_stock_threshold: 0,
  });

  // Update form data when product changes
  useState(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "", // Note: This might need to be ID based on schema, assuming legacy string for now or handled upstream
        description: product.description || "",
        cost_per_box: product.cost_per_box || product.costPrice || 0,
        price_per_box: product.price_per_box || product.price_per_box || 0, // Typo in replacement, fixing directly here or careful copy paste
        quantity_box: product.quantity_box || product.stock || 0,
        boxed_low_stock_threshold: product.boxed_low_stock_threshold || product.minStock || 0,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        description: "",
        cost_per_box: 0,
        price_per_box: 0,
        quantity_box: 0,
        boxed_low_stock_threshold: 0,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add Product"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            value={formData.category} // TODO: Update to Category Select for valid ID
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost Price (Per Box)"
            type="number"
            step="0.01"
            value={formData.cost_per_box}
            onChange={(e) => setFormData({ ...formData, cost_per_box: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Selling Price (Per Box)"
            type="number"
            step="0.01"
            value={formData.price_per_box}
            onChange={(e) => setFormData({ ...formData, price_per_box: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock Quantity (Boxes)"
            type="number"
            value={formData.quantity_box}
            onChange={(e) => setFormData({ ...formData, quantity_box: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            value={formData.boxed_low_stock_threshold}
            onChange={(e) => setFormData({ ...formData, boxed_low_stock_threshold: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {product ? "Update Product" : "Add Product"}
          </Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
