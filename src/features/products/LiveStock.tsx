import { useState } from "react";
import { Search, Filter, Package, AlertTriangle, Edit3, Trash2, Check, X } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

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
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-emerald-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Category
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Stock
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Ratio
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Pricing
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-right">
                            Profit
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5">
                    {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <tr key={product._id} className="group hover:bg-emerald-500/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {product.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                            ID: {product._id.slice(-8)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/20">
                                        {getCategoryName(product.category_id)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${
                                                (product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5)
                                                    ? "text-red-500"
                                                    : "text-gray-900 dark:text-dark-text"
                                            }`}>
                                                {product.quantity_box || 0} <span className="text-[10px] font-normal text-gray-400">Boxes</span>
                                            </span>
                                            <span className="text-xs text-gray-500">{product.quantity_kg || 0} <span className="text-[10px]">KG</span></span>
                                        </div>
                                        {(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5) && (
                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                        1:{product.box_to_kg_ratio || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Sell (Box)</span>
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${(product.price_per_box || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Cost (Box)</span>
                                            <span className="text-sm font-medium text-gray-500">${(product.cost_per_box || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            +${((product.price_per_box || 0) - (product.cost_per_box || 0)).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-emerald-500/60 uppercase tracking-tighter">Per Box</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button 
                                            className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                            onClick={() => openEditModal(product)}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            onClick={() => handleDeleteClick(product)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-emerald-500/5">
                                        <Package size={32} className="text-emerald-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">No products found</p>
                                        <p className="text-xs text-gray-500">Try adjusting your search or filters.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render Low Stock Items View
    const renderLowStockView = () => (
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-red-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-red-500/5 dark:bg-red-500/10 border-b border-red-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Category
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Current Stock
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display text-center">
                            Threshold
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display text-right">
                            Pricing (Box)
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-red-500/5">
                    {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <tr key={product._id} className="group hover:bg-red-500/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            {product.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                            ID: {product._id.slice(-8)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-500/20">
                                        {getCategoryName(product.category_id)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                            {product.quantity_box || 0} <span className="text-[10px] font-normal text-gray-400">Boxes</span>
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm font-medium text-gray-500">
                                        {product.boxed_low_stock_threshold || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        ${(product.price_per_box || 0).toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-emerald-500/5">
                                        <Check size={32} className="text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">Stock is healthy</p>
                                        <p className="text-xs text-gray-500">No products are currently below threshold.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render Damaged Products View
    const renderDamagedProductsView = () => (
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-red-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-red-500/5 dark:bg-red-500/10 border-b border-red-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Quantity
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Reason
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display">
                            Date
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display text-right">
                            Loss Value
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider font-display text-center">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-red-500/5">
                    {damagedProducts?.length > 0 ? (
                        damagedProducts.map((damaged: any) => (
                            <tr key={damaged.damage_id} className="group hover:bg-red-500/5 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        {damaged.product_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                            {damaged.damaged_boxes || 0} <span className="text-[10px] font-normal text-gray-400 uppercase">Boxes</span>
                                        </span>
                                        <span className="text-xs text-gray-500">{damaged.damaged_kg || 0} <span className="text-[10px] uppercase">KG</span></span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={damaged.damage_reason}>
                                        {damaged.damage_reason}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {damaged.damage_date || "-"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-red-600">
                                        -${(damaged.loss_value || 0).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        damaged.damage_approval === "approved"
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50"
                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200/50"
                                    }`}>
                                        {damaged.damage_approval || "Pending"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                No damaged products recorded.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render Nearing Expiry View
    const renderNearingExpiryView = () => (
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-amber-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-display">
                            Stock
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-display">
                            Expiry Date
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-display text-center">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/5">
                    {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <tr key={product._id} className="group hover:bg-amber-500/5 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {product.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-600">
                                        {product.quantity_box || 0} Boxes
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {product.expiry_date || "-"}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        (product.days_left || 999) <= 10
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200/50"
                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200/50"
                                    }`}>
                                        {product.days_left !== undefined ? `${product.days_left} Days Left` : "-"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                                No products nearing expiry.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render Stock Adjustment / Stock Movement History View
    const renderStockAdjustmentView = () => (
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-emerald-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Date
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Type
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Changes
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-right">
                            Status
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5">
                    {stockMovements?.length > 0 ? (
                        stockMovements.map((movement: any) => (
                            <tr key={movement.movement_id} className="group hover:bg-emerald-500/5 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                    {new Date(movement.updated_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {movement.product_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50">
                                        {movement.movement_type || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{movement.field_changed || "Quantity"}</span>
                                        <div className="text-sm font-medium tabular-nums">
                                            <span className="text-gray-400">{movement.old_value || 0}</span>
                                            <span className="mx-2 text-emerald-500">→</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{movement.new_value || 0}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        movement.status === "completed"
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                                    }`}>
                                        {movement.status || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {movement.status === "pending" && (
                                        <div className="flex justify-end gap-1">
                                            <button 
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                                onClick={() => movement.movement_type === "product_edit" 
                                                    ? handleApproveEdit(movement.movement_id, movement.product_id)
                                                    : handleApproveDeletion(movement.movement_id, movement.product_id)
                                                }
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button 
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                onClick={() => movement.movement_type === "product_edit"
                                                    ? handleRejectEdit(movement.movement_id)
                                                    : handleRejectDeletion(movement.movement_id)
                                                }
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                No stock adjustments recorded.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render Restock Records View
    const renderRestockView = () => (
        <div className="overflow-x-auto relative shadow-sm rounded-xl border border-emerald-500/10 bg-white dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/10">
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Date
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Added
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-right">
                            Cost
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                            Delivery
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display text-center">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/5">
                    {restockRecords?.length > 0 ? (
                        restockRecords.map((restock: any) => (
                            <tr key={restock.addition_id} className="group hover:bg-emerald-500/5 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                    {new Date(restock.updated_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {restock.product_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                            {restock.boxes_added} <span className="text-[10px] font-normal text-gray-400 uppercase">Boxes</span>
                                        </span>
                                        <span className="text-xs text-gray-500">{restock.kg_added} <span className="text-[10px] uppercase">KG</span></span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        ${restock.total_cost.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {restock.delivery_date}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        restock.status === "completed"
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                                    }`}>
                                        {restock.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                No restock records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
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
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-96 relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <Input
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-white/50 dark:bg-dark-card/50 border-emerald-500/10 focus:border-emerald-500/30 focus:ring-emerald-500/20 rounded-xl transition-all"
                    />
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-2 p-1 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                    {views.slice(0, 3).map((view) => (
                        <button
                            key={view.id}
                            onClick={() => setCurrentView(view.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                currentView === view.id
                                    ? "bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                        >
                            {view.label.split(" View")[0]}
                        </button>
                    ))}
                    
                    {/* More Views Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
                                views.slice(3).some(v => v.id === currentView)
                                    ? "bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                        >
                            {views.slice(3).some(v => v.id === currentView) 
                                ? getCurrentViewLabel().split(" View")[0] 
                                : "More"}
                            <Filter size={14} />
                        </button>

                        {isViewDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsViewDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-emerald-500/10 rounded-xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {views.slice(3).map((view) => (
                                        <button
                                            key={view.id}
                                            onClick={() => {
                                                setCurrentView(view.id);
                                                setIsViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                                currentView === view.id
                                                    ? "bg-emerald-500 text-white"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-emerald-500/10"
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
            </div>

            {/* Products Table Wrapper */}
            <div className="relative">
                <div className="min-h-[400px]">
                    {renderCurrentView()}
                </div>
            </div>

            {/* Edit Product Modal */}
            <Modal 
                isOpen={isEditProductOpen} 
                onClose={closeEditModal} 
                title="Update Product"
            >
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/10">
                    <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display">Modify Product</h2>
                            <p className="text-sm text-gray-500">Update item specifications and pricing details.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Product Name
                                        </label>
                                        <Input
                                            value={editForm.name}
                                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                                            className={`h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50 ${errors.name ? "border-red-500" : ""}`}
                                        />
                                        {errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.name}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Box to KG Ratio
                                        </label>
                                        <Input
                                            type="number"
                                            value={editForm.box_to_kg_ratio}
                                            onChange={(e) => handleEditFormChange('box_to_kg_ratio', e.target.value)}
                                            className={`h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50 ${errors.box_to_kg_ratio ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Cost per Box ($)
                                        </label>
                                        <Input
                                            type="number"
                                            value={editForm.cost_per_box}
                                            onChange={(e) => handleEditFormChange('cost_per_box', e.target.value)}
                                            className={`h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50 ${errors.cost_per_box ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Sell per Box ($)
                                        </label>
                                        <Input
                                            type="number"
                                            value={editForm.price_per_box}
                                            onChange={(e) => handleEditFormChange('price_per_box', e.target.value)}
                                            className={`h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-white dark:bg-dark-card font-bold text-emerald-600 dark:text-emerald-400 ${errors.price_per_box ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Modification Reason
                                </label>
                                <textarea
                                    value={editForm.reason}
                                    onChange={(e) => handleEditFormChange('reason', e.target.value)}
                                    rows={3}
                                    placeholder="Explain why these changes are being made..."
                                    className={`w-full px-4 py-3 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all dark:text-dark-text ${errors.reason ? "border-red-500" : ""}`}
                                />
                                {errors.reason && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.reason}</p>}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/10">
                            <Button 
                                variant="secondary" 
                                onClick={closeEditModal}
                                className="px-6 h-12 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleEditProductSubmit}
                                className="px-10 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold uppercase tracking-wider text-xs transition-all"
                            >
                                Request Update
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Request Product Deletion Modal */}
            <Modal 
                isOpen={isDeleteProductOpen} 
                onClose={closeDeleteModal} 
                title="Remove Product"
            >
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-red-500/10">
                    <div className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display text-red-600">Delete Product</h2>
                            <p className="text-sm text-gray-500">This action requires administrative approval.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text">{deletingProduct?.name}</p>
                                    <p className="text-xs text-gray-500">{deletingProduct?.quantity_box} boxes in stock</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Reason for Deletion
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => handleDeleteReasonChange(e.target.value)}
                                    rows={4}
                                    placeholder="Explain why this product should be removed..."
                                    className={`w-full px-4 py-3 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-red-500/10 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all dark:text-dark-text ${errors.reason ? "border-red-500" : ""}`}
                                />
                                {errors.reason && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.reason}</p>}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-red-500/10">
                            <Button 
                                variant="secondary" 
                                onClick={closeDeleteModal}
                                className="px-6 h-12 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleDeleteProductSubmit}
                                className="px-10 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold uppercase tracking-wider text-xs transition-all"
                            >
                                Request Deletion
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
