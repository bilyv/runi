import { useState } from "react";
import { Search, Filter, Package, AlertTriangle, Edit3, Trash2, Check, X } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductDetailModal } from "./ProductDetailModal";

interface LiveStockProps {
    search: string;
    setSearch: (search: string) => void;
    products: any[];
    categories: any[];
}

export function LiveStock({
    search,
    setSearch,
    products,
    categories,
}: LiveStockProps) {
    const [currentView, setCurrentView] = useState("all");
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProductForDetail, setSelectedProductForDetail] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        box_to_kg_ratio: "",
        cost_per_box: "",
        price_per_box: "",
        reason: ""
    });
    const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch damaged products, stock movements, and restock records
    const damagedProducts = useQuery(api.products.getDamagedProducts) || [];
    const stockMovements = useQuery(api.products.getStockMovements) || [];
    const restockRecords = useQuery(api.products.getRestockRecords) || [];
    const updateProduct = useMutation(api.products.update);
    const deleteProduct = useMutation(api.products.deleteProduct);
    const recordStockMovement = useMutation(api.products.recordStockMovement);
    const approveProductDeletion = useMutation(api.products.approveProductDeletion);
    const rejectProductDeletion = useMutation(api.products.rejectProductDeletion);
    const approveProductEdit = useMutation(api.products.approveProductEdit);
    const rejectProductEdit = useMutation(api.products.rejectProductEdit);

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
                return false; // We'll use damagedProducts data instead
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
        { id: "restock", label: "Restock Records View" },
    ];

    const getCurrentViewLabel = () => {
        return views.find(v => v.id === currentView)?.label || "All Product View";
    };

    // Render All Products View
    const renderAllProductsView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Boxes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        KG Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Box Ratio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Selling
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Profit
                    </th>
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
                                <div 
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => {
                                        setSelectedProductForDetail(product);
                                        setIsDetailModalOpen(true);
                                    }}
                                >
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                    {getCategoryName(product.category_id)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5)
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-900 dark:text-dark-text"
                                    }`}>
                                    {product.quantity_box || 0}
                                </span>
                                {(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5) && (
                                    <AlertTriangle size={16} className="inline ml-1 text-red-500 dark:text-red-400" />
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {product.quantity_kg || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                1:{product.box_to_kg_ratio || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.price_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.price_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.cost_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.cost_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${((product.price_per_box || 0) - (product.cost_per_box || 0)).toFixed(2)}</span>
                                    <span>KG: ${((product.price_per_kg || 0) - (product.cost_per_kg || 0)).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                <button 
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                    onClick={() => openEditModal(product)}
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button 
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                    onClick={() => handleDeleteClick(product)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No products found</p>
                                <p className="text-sm">Try adjusting your search terms.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render Low Stock Items View
    const renderLowStockView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Low Stock Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Box Ratio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Selling
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Profit
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {filteredProducts?.length > 0 ? (
                    filteredProducts.map((product: any, index: number) => (
                        <tr key={product._id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div 
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => {
                                        setSelectedProductForDetail(product);
                                        setIsDetailModalOpen(true);
                                    }}
                                >
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                    {getCategoryName(product.category_id)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {product.quantity_box || 0} Boxes / {product.quantity_kg || 0} KG
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {product.boxed_low_stock_threshold || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                1:{product.box_to_kg_ratio || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.price_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.price_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.cost_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.cost_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${((product.price_per_box || 0) - (product.cost_per_box || 0)).toFixed(2)}</span>
                                    <span>KG: ${((product.price_per_kg || 0) - (product.cost_per_kg || 0)).toFixed(2)}</span>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No low stock products found</p>
                                <p className="text-sm">No products are currently below their low stock threshold.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render Damaged Products View
    const renderDamagedProductsView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loss Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reported By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {damagedProducts?.length > 0 ? (
                    damagedProducts.map((damaged: any, index: number) => (
                        <tr key={damaged.damage_id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                    {damaged.product_name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {damaged.damaged_boxes || 0} Boxes
                                </div>
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {damaged.damaged_kg || 0} KG
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text max-w-xs truncate">
                                {damaged.damage_reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {damaged.damage_date || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                ${(damaged.loss_value || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${damaged.damage_approval === "approved"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    }`}>
                                    {damaged.damage_approval === "approved" ? "Approved" : "Pending"}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {damaged.reported_by || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No damaged products recorded</p>
                                <p className="text-sm">No products have been marked as damaged yet.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render Nearing Expiry View
    const renderNearingExpiryView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Days Until Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Box Ratio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Selling
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Profit
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {filteredProducts?.length > 0 ? (
                    filteredProducts.map((product: any, index: number) => (
                        <tr key={product._id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div 
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => {
                                        setSelectedProductForDetail(product);
                                        setIsDetailModalOpen(true);
                                    }}
                                >
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                    {getCategoryName(product.category_id)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {product.quantity_box || 0} Boxes
                                </div>
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {product.quantity_kg || 0} KG
                                </div>
                            </td>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                1:{product.box_to_kg_ratio || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.price_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.price_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${(product.cost_per_box || 0).toFixed(2)}</span>
                                    <span>KG: ${(product.cost_per_kg || 0).toFixed(2)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                <div className="flex flex-col">
                                    <span>Box: ${((product.price_per_box || 0) - (product.cost_per_box || 0)).toFixed(2)}</span>
                                    <span>KG: ${((product.price_per_kg || 0) - (product.cost_per_kg || 0)).toFixed(2)}</span>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No products nearing expiry</p>
                                <p className="text-sm">No products are expiring within the next 30 days.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render Stock Adjustment / Stock Movement History View
    const renderStockAdjustmentView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Field Changed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Change or Old vs New Values
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reason & Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {stockMovements?.length > 0 ? (
                    stockMovements.map((movement: any, index: number) => (
                        <tr key={movement.movement_id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {new Date(movement.updated_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                    {movement.product_name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                    {movement.movement_type || "-"}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {movement.field_changed || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-dark-text">
                                    {movement.movement_type === 'product_edit' ? (
                                        <>
                                            <div>Old: {typeof movement.old_value === 'string' ? movement.old_value : (movement.old_value !== undefined && movement.old_value !== null ? movement.old_value : '-')}</div>
                                            <div>New: {typeof movement.new_value === 'string' ? movement.new_value : (movement.new_value !== undefined && movement.new_value !== null ? movement.new_value : '-')}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div>Old: {movement.old_value || 0}</div>
                                            <div>New: {movement.new_value || 0}</div>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text max-w-xs truncate">
                                {movement.reason || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {movement.performed || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${movement.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    }`}>
                                    {movement.status || "-"}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                {movement.status === "pending" && (
                                    <>
                                        {movement.movement_type === "product_edit" ? (
                                            <>
                                                <button 
                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                    onClick={() => handleApproveEdit(movement.movement_id, movement.product_id)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button 
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                    onClick={() => handleRejectEdit(movement.movement_id)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                    onClick={() => handleApproveDeletion(movement.movement_id, movement.product_id)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button 
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                    onClick={() => handleRejectDeletion(movement.movement_id)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No stock adjustments recorded</p>
                                <p className="text-sm">No stock movements have been recorded yet.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render Restock Records View
    const renderRestockView = () => (
        <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Boxes Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kg Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Delivery Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {restockRecords?.length > 0 ? (
                    restockRecords.map((restock: any, index: number) => (
                        <tr key={restock.addition_id} className={index % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-card/50"}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {new Date(restock.updated_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                    {restock.product_name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {restock.boxes_added}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {restock.kg_added}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                ${restock.total_cost.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {restock.delivery_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                                {restock.performed_by}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${restock.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    }`}>
                                    {restock.status}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="font-medium">No restock records found</p>
                                <p className="text-sm">No restock activities have been recorded yet.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    // Render the appropriate view based on currentView
    const renderCurrentView = () => {
        switch (currentView) {
            case "all":
                return renderAllProductsView();
            case "lowStock":
                return renderLowStockView();
            case "damaged":
                return renderDamagedProductsView();
            case "nearingExpiry":
                return renderNearingExpiryView();
            case "stockAdjustment":
                return renderStockAdjustmentView();
            case "restock":
                return renderRestockView();
            default:
                return renderAllProductsView();
        }
    };

    // Handle edit form changes
    const handleEditFormChange = (field: string, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Open edit modal with product data
    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name || "",
            box_to_kg_ratio: product.box_to_kg_ratio?.toString() || "",
            cost_per_box: product.cost_per_box?.toString() || "",
            price_per_box: product.price_per_box?.toString() || "",
            reason: ""
        });
        setErrors({});
        setIsEditProductOpen(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setIsEditProductOpen(false);
        setEditingProduct(null);
        setEditForm({
            name: "",
            box_to_kg_ratio: "",
            cost_per_box: "",
            price_per_box: "",
            reason: ""
        });
        setErrors({});
    };

    // Open delete product modal
    const openDeleteModal = (product: any) => {
        setDeletingProduct(product);
        setDeleteReason("");
        setIsDeleteProductOpen(true);
        setErrors({});
    };

    // Close delete product modal
    const closeDeleteModal = () => {
        setIsDeleteProductOpen(false);
        setDeletingProduct(null);
        setDeleteReason("");
        setErrors({});
    };

    // Handle delete reason change
    const handleDeleteReasonChange = (value: string) => {
        setDeleteReason(value);
        
        // Clear error when user types
        if (errors.reason) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.reason;
                return newErrors;
            });
        }
    };

    // Validate delete product form
    const validateDeleteProductForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!deleteReason.trim()) {
            newErrors.reason = "Reason for deletion is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle delete product submit
    const handleDeleteProductSubmit = async () => {
        if (validateDeleteProductForm()) {
            try {
                // Record the stock movement as a pending deletion request
                await recordStockMovement({
                    movement_id: `movement_${Date.now()}`,
                    product_id: deletingProduct._id,
                    movement_type: "product_delete",
                    box_change: -deletingProduct.quantity_box,
                    kg_change: -deletingProduct.quantity_kg,
                    old_value: deletingProduct.quantity_box,
                    new_value: 0,
                    reason: deleteReason,
                    status: "pending",
                    performed: "User", // In a real app, this would be the actual user
                });

                alert("Product deletion request submitted successfully! Awaiting approval.");
                closeDeleteModal();
            } catch (error: any) {
                console.error("Error submitting deletion request:", error);
                alert("Failed to submit deletion request: " + (error.message || "Unknown error"));
            }
        }
    };

    // Handle immediate delete (without reason)
    const handleDeleteClick = (product: any) => {
        openDeleteModal(product);
    };

    // Handle approval of product deletion
    const handleApproveDeletion = async (movementId: string, productId: string) => {
        try {
            await approveProductDeletion({ movement_id: movementId, product_id: productId });
            alert("Product deletion approved successfully!");
        } catch (error: any) {
            console.error("Error approving deletion:", error);
            alert("Failed to approve deletion: " + (error.message || "Unknown error"));
        }
    };

    // Handle rejection of product deletion
    const handleRejectDeletion = async (movementId: string) => {
        try {
            await rejectProductDeletion({ movement_id: movementId });
            alert("Product deletion rejected!");
        } catch (error: any) {
            console.error("Error rejecting deletion:", error);
            alert("Failed to reject deletion: " + (error.message || "Unknown error"));
        }
    };

    // Handle approval of product edit
    const handleApproveEdit = async (movementId: string, productId: string) => {
        try {
            await approveProductEdit({ movement_id: movementId, product_id: productId });
            alert("Product edit approved successfully!");
        } catch (error: any) {
            console.error("Error approving edit:", error);
            alert("Failed to approve edit: " + (error.message || "Unknown error"));
        }
    };

    // Handle rejection of product edit
    const handleRejectEdit = async (movementId: string) => {
        try {
            // For simplicity, we're not asking for a rejection reason in the UI
            // In a real application, you might want to show a modal to collect the reason
            await rejectProductEdit({ movement_id: movementId, rejection_reason: "Manager rejected the change" });
            alert("Product edit rejected!");
        } catch (error: any) {
            console.error("Error rejecting edit:", error);
            alert("Failed to reject edit: " + (error.message || "Unknown error"));
        }
    };

    // Validate edit product form
    const validateEditProductForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!editForm.name.trim()) {
            newErrors.name = "Product name is required";
        }
        
        if (!editForm.box_to_kg_ratio || isNaN(Number(editForm.box_to_kg_ratio)) || Number(editForm.box_to_kg_ratio) <= 0) {
            newErrors.box_to_kg_ratio = "Valid box to kg ratio is required";
        }
        
        if (!editForm.cost_per_box || isNaN(Number(editForm.cost_per_box)) || Number(editForm.cost_per_box) < 0) {
            newErrors.cost_per_box = "Valid cost per box is required";
        }
        
        if (!editForm.price_per_box || isNaN(Number(editForm.price_per_box)) || Number(editForm.price_per_box) < 0) {
            newErrors.price_per_box = "Valid sell price per box is required";
        }
        
        if (!editForm.reason.trim()) {
            newErrors.reason = "Reason for changes is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle edit product submit
    const handleEditProductSubmit = async () => {
        if (validateEditProductForm() && editingProduct) {
            try {
                // Create pending edit requests for each changed field
                const changes = [];
                
                // Check which fields have changed
                if (editForm.name !== editingProduct.name) {
                    changes.push({
                        field: 'name',
                        oldValue: editingProduct.name,
                        newValue: editForm.name
                    });
                }
                
                if (Number(editForm.box_to_kg_ratio) !== editingProduct.box_to_kg_ratio) {
                    changes.push({
                        field: 'box_to_kg_ratio',
                        oldValue: editingProduct.box_to_kg_ratio.toString(),
                        newValue: editForm.box_to_kg_ratio
                    });
                }
                
                if (Number(editForm.cost_per_box) !== editingProduct.cost_per_box) {
                    changes.push({
                        field: 'cost_per_box',
                        oldValue: editingProduct.cost_per_box.toString(),
                        newValue: editForm.cost_per_box
                    });
                }
                
                if (Number(editForm.price_per_box) !== editingProduct.price_per_box) {
                    changes.push({
                        field: 'price_per_box',
                        oldValue: editingProduct.price_per_box.toString(),
                        newValue: editForm.price_per_box
                    });
                }
                
                // Create a pending request for each change
                for (const change of changes) {
                    // Determine if the field is numeric or string
                    const isNumericField = ['box_to_kg_ratio', 'cost_per_box', 'price_per_box'].includes(change.field);
                    const isStringField = change.field === 'name';
                    
                    // Prepare values based on field type
                    let oldValue, newValue;
                    if (isStringField) {
                        oldValue = change.oldValue;
                        newValue = change.newValue;
                    } else if (isNumericField) {
                        oldValue = parseFloat(change.oldValue) || 0;
                        newValue = parseFloat(change.newValue) || 0;
                    } else {
                        oldValue = 0;
                        newValue = 0;
                    }
                    
                    await recordStockMovement({
                        movement_id: `movement_${Date.now()}_${change.field}`,
                        product_id: editingProduct._id,
                        movement_type: "product_edit",
                        field_changed: change.field,
                        box_change: 0, // No change in quantity
                        kg_change: 0, // No change in quantity
                        old_value: oldValue,
                        new_value: newValue,
                        reason: editForm.reason,
                        status: "pending",
                        performed: "User", // In a real app, this would be the actual user
                    });
                }
                
                alert(`Product edit request${changes.length > 1 ? 's' : ''} submitted successfully! Awaiting approval.`);
                closeEditModal();
            } catch (error: any) {
                console.error("Error submitting edit request:", error);
                alert("Failed to submit edit request: " + (error.message || "Unknown error"));
            }
        }
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
                    {renderCurrentView()}
                </div>
            </div>

            {/* Edit Product Modal */}
            <Modal 
                isOpen={isEditProductOpen} 
                onClose={closeEditModal} 
                title="Edit Product"
            >
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
                        {/* Header */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">Edit Product</h2>
                        </div>
                        
                        {/* Edit Product Form */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                                        className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                            errors.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                        }`}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Box to KG Ratio <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.box_to_kg_ratio}
                                        onChange={(e) => handleEditFormChange('box_to_kg_ratio', e.target.value)}
                                        className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                            errors.box_to_kg_ratio ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                        }`}
                                        placeholder="Enter box to kg ratio"
                                    />
                                    {errors.box_to_kg_ratio && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.box_to_kg_ratio}</p>
                                    )}
                                </div>
                                
                                {/* Cost Pricing */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Cost Pricing</h3>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                            Cost per Box ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.cost_per_box}
                                            onChange={(e) => handleEditFormChange('cost_per_box', e.target.value)}
                                            className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                                errors.cost_per_box ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                            }`}
                                            placeholder="$0.00"
                                        />
                                        {errors.cost_per_box && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cost_per_box}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                            Cost per Kg ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                            <input
                                                type="number"
                                                value={editForm.box_to_kg_ratio && editForm.cost_per_box ? 
                                                    (Number(editForm.cost_per_box) / Number(editForm.box_to_kg_ratio)).toFixed(2) : ''}
                                                readOnly
                                                className="w-full pl-5 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors bg-gray-100 dark:bg-dark-bg/50 cursor-not-allowed"
                                                placeholder="Auto calculated"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Selling Pricing */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Selling Pricing</h3>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                            Sell per Box ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.price_per_box}
                                            onChange={(e) => handleEditFormChange('price_per_box', e.target.value)}
                                            className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                                errors.price_per_box ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                            }`}
                                            placeholder="$0.00"
                                        />
                                        {errors.price_per_box && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.price_per_box}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                            Sell per Kg ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                            <input
                                                type="number"
                                                value={editForm.box_to_kg_ratio && editForm.price_per_box ? 
                                                    (Number(editForm.price_per_box) / Number(editForm.box_to_kg_ratio)).toFixed(2) : ''}
                                                readOnly
                                                className="w-full pl-5 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors bg-gray-100 dark:bg-dark-bg/50 cursor-not-allowed"
                                                placeholder="Auto calculated"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Reason for Changes <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editForm.reason}
                                        onChange={(e) => handleEditFormChange('reason', e.target.value)}
                                        className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                            errors.reason ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                        }`}
                                        rows={3}
                                        placeholder="Explain the reason for these changes"
                                    />
                                    {errors.reason && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reason}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={handleEditProductSubmit}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Request Product Deletion Modal */}
            <Modal 
                isOpen={isDeleteProductOpen} 
                onClose={closeDeleteModal} 
                title="Request Product Deletion"
            >
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
                        {/* Header */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">Request Product Deletion</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Please provide a reason for requesting deletion of this product
                            </p>
                        </div>
                        
                        {/* Delete Product Form */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Product Name
                                    </label>
                                    <div className="px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-dark-bg rounded-md text-gray-900 dark:text-dark-text">
                                        {deletingProduct?.name}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Current Stock
                                    </label>
                                    <div className="px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-dark-bg rounded-md text-gray-900 dark:text-dark-text">
                                        {deletingProduct?.quantity_box} boxes, {deletingProduct?.quantity_kg} kg
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                        Reason for Deletion <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => handleDeleteReasonChange(e.target.value)}
                                        className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                                            errors.reason ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                                        }`}
                                        rows={4}
                                        placeholder="Enter reason for deletion (e.g., Discontinued product, Damaged beyond repair, etc.)"
                                    />
                                    {errors.reason && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reason}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={handleDeleteProductSubmit}
                            >
                                Submit Deletion Request
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
            {/* Product Detail Modal */}
            <ProductDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                product={selectedProductForDetail}
                categoryName={getCategoryName(selectedProductForDetail?.category_id || selectedProductForDetail?.product_id)}
                onEdit={openEditModal}
                onDelete={handleDeleteClick}
            />
        </div>
    );
}
