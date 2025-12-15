import { useState } from "react";
import { Search, Filter, Package, AlertTriangle, Edit } from "lucide-react";
import { Input } from "../../components/ui/Input";

interface LiveStockProps {
    search: string;
    setSearch: (search: string) => void;
    products: any[];
    categories: any[];
    onEditProduct: (product: any) => void;
}

export function LiveStock({
    search,
    setSearch,
    products,
    categories,
    onEditProduct
}: LiveStockProps) {
    const [currentView, setCurrentView] = useState("all");
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

    // Helper to get category name
    const getCategoryName = (categoryId: string) => {
        return categories?.find((c: any) => c._id === categoryId)?.category_name || "Uncategorized";
    };

    // Filter products based on current view
    const filteredProducts = products?.filter((product: any) => {
        // Basic search filter
        if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch = product.name.toLowerCase().includes(searchLower) ||
                (product.sku && product.sku.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
        }

        switch (currentView) {
            case "lowStock":
                return (product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5);
            case "nearingExpiry":
                return (product.days_left || 999) <= 30; // 30 days threshold
            case "damaged":
                return false; // No damaged field in schema yet
            case "stockAdjustment":
                return true; // Show all for now
            default:
                return true;
        }
    });

    const views = [
        { id: "all", label: "All Product View" },
        { id: "lowStock", label: "Low Stock Items View" },
        { id: "damaged", label: "Damaged Products View" },
        { id: "nearingExpiry", label: "Nearing Expiry View" },
        { id: "stockAdjustment", label: "Stock Adjustment View" },
    ];

    const getCurrentViewLabel = () => {
        return views.find(v => v.id === currentView)?.label || "All Product View";
    };

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

                {/* View Switcher Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-dark-card/80 transition-colors"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {getCurrentViewLabel()}
                        </span>
                        <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    </button>

                    {isViewDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsViewDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                                {views.map((view) => (
                                    <button
                                        key={view.id}
                                        onClick={() => {
                                            setCurrentView(view.id);
                                            setIsViewDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${currentView === view.id
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-border/50"
                                            }`}
                                    >
                                        {view.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
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
                                    Stock (Box)
                                </th>
                                {currentView === "nearingExpiry" ? (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Expiry Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Days Left
                                        </th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cost/Box
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Price/Box
                                        </th>
                                    </>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {filteredProducts?.length > 0 ? (
                                filteredProducts.map((product: any, index: number) => (
                                    <tr key={product._id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-200 dark:bg-dark-border rounded-lg flex items-center justify-center">
                                                    <Package size={16} className="text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{product.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                            {product.sku || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                                {getCategoryName(product.category_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5)
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-gray-900 dark:text-dark-text"
                                                    }`}>
                                                    {product.quantity_box || 0}
                                                </span>
                                                {(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5) && (
                                                    <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{product.quantity_kg || 0} kg</div>
                                        </td>

                                        {currentView === "nearingExpiry" ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                                    {product.expiry_date || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${(product.days_left || 999) <= 10
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                        : (product.days_left || 999) <= 30
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                        }`}>
                                                        {product.days_left !== undefined ? `${product.days_left} days` : "-"}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                                    ${(product.cost_per_box || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                                    ${(product.price_per_box || 0).toFixed(2)}
                                                </td>
                                            </>
                                        )}

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEditProduct(product)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                            <p className="font-medium">No products found</p>
                                            <p className="text-sm">
                                                {currentView === "damaged" ? "No damaged products recorded." :
                                                    currentView === "nearingExpiry" ? "No products nearing expiry (30 days)." :
                                                        currentView === "lowStock" ? "No low stock products." :
                                                            "Try adjusting your search terms."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
