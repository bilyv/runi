import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Plus, Search, Filter, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { toast } from "sonner";
import { AddCategoryModal } from "./AddCategoryModal";

type TabType = "category" | "adding" | "liveStock";

export function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("liveStock");
  const [prevTab, setPrevTab] = useState<TabType>("liveStock");

  const products = useQuery(api.products.list, {
    search: search || undefined,
    category: category || undefined
  });
  const categories = useQuery(api.productCategories.list) || [];
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

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
            <CategoryTab
              categories={categories}
              onAddCategory={() => setShowCategoryModal(true)}
            />
          </div>
          <div className={`${getAnimationClass("adding")}`}>
            <AddingTab
              onAddProduct={() => setShowAddModal(true)}
            />
          </div>
          <div className={`${getAnimationClass("liveStock")}`}>
            <LiveStockTab
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              products={products}
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
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
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 0,
  });

  // Update form data when product changes
  useState(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        description: product.description || "",
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        stock: product.stock || 0,
        minStock: product.minStock || 0,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        description: "",
        costPrice: 0,
        sellingPrice: 0,
        stock: 0,
        minStock: 0,
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
            value={formData.category}
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
            label="Cost Price"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Selling Price"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Minimum Stock"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
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

// Category Tab Component
function CategoryTab({
  categories,
  onAddCategory
}: {
  categories: Array<{ _id: any; category_name: string; _creationTime: number }>;
  onAddCategory: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Product Categories</h2>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={onAddCategory}
        >
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-dark-text">{cat.category_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No categories found. Click "Add Category" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

// Adding Tab Component
function AddingTab({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <Plus size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
          Add New Product
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Click the button below to add a new product to your inventory. You can specify details like name, SKU, category, pricing, and stock levels.
        </p>
        <Button
          variant="primary"
          onClick={onAddProduct}
          className="flex items-center gap-2 mx-auto"
        >
          <Plus size={16} />
          Add New Product
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-dark-border">
        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Import Products</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Bulk import products from CSV or Excel file
          </p>
          <Button variant="secondary" className="w-full text-sm">
            Import File
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Bulk Update</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Update multiple products at once
          </p>
          <Button variant="secondary" className="w-full text-sm">
            Bulk Edit
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Templates</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Use product templates for faster entry
          </p>
          <Button variant="secondary" className="w-full text-sm">
            View Templates
          </Button>
        </div>
      </div>
    </div>
  );
}

// Live Stock Tab Component
function LiveStockTab({
  search,
  setSearch,
  category,
  setCategory,
  products,
  categories,
  onEditProduct
}: any) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
        >
          <option value="">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat.category_name}>{cat.category_name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
              {products?.map((product: any, index: number) => (
                <tr key={product._id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-dark-border rounded-lg flex items-center justify-center">
                        <Package size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-dark-text">{product.stock}</span>
                      {product.stock <= product.minStock && (
                        <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                    ${product.costPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                    ${product.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
