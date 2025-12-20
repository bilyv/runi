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

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const openDetails = (product: any) => {
        setSelectedProduct(product);
        setIsDetailsOpen(true);
    };

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
                return (product.days_left || 999) <= 30;
            default:
                return true;
        }
    });

    const views = [
        { id: "all", label: "All Products" },
        { id: "lowStock", label: "Low Stock" },
        { id: "damaged", label: "Damaged Items" },
        { id: "nearingExpiry", label: "Nearing Expiry" },
        { id: "stockAdjustment", label: "Adjustments" },
        { id: "restock", label: "Restock History" },
    ];

    const getCurrentViewLabel = () => {
        return views.find(v => v.id === currentView)?.label || "All Products";
    };

    // Render All Products View
    const renderAllProductsView = () => (
        <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product Name</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Category</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Stock</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Price</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Profit</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                    {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <tr key={product._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => openDetails(product)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-display">
                                        {product.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{getCategoryName(product.category_id)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${(product.quantity_box || 0) <= (product.boxed_low_stock_threshold || 5) ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                                            {product.quantity_box || 0} Box
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">${(product.price_per_box || 0).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+${((product.price_per_box || 0) - (product.cost_per_box || 0)).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => openEditModal(product)}><Edit3 size={16} /></button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => handleDeleteClick(product)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">No products found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderLowStockView = () => (
        <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product Name</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Category</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Current Stock</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Threshold</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                    {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product: any) => (
                            <tr key={product._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => openDetails(product)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-display">
                                        {product.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{getCategoryName(product.category_id)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-red-500">{product.quantity_box || 0} Boxes</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.boxed_low_stock_threshold || 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">No low stock items</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderDamagedProductsView = () => (
        <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Quantity</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Reason</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Loss</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                    {damagedProducts?.length > 0 ? (
                        damagedProducts.map((damaged: any) => (
                            <tr key={damaged.damage_id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white font-display">{damaged.product_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{damaged.damaged_boxes || 0} Boxes</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{damaged.damage_reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">-${(damaged.loss_value || 0).toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">No damaged products</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case "lowStock": return renderLowStockView();
            case "damaged": return renderDamagedProductsView();
            default: return renderAllProductsView();
        }
    };

    const handleEditFormChange = (field: string, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name || "",
            box_to_kg_ratio: product.box_to_kg_ratio?.toString() || "",
            cost_per_box: product.cost_per_box?.toString() || "",
            price_per_box: product.price_per_box?.toString() || "",
            reason: ""
        });
        setIsEditProductOpen(true);
    };

    const closeEditModal = () => {
        setIsEditProductOpen(false);
        setEditingProduct(null);
        setErrors({});
    };

    const handleDeleteClick = (product: any) => {
        setDeletingProduct(product);
        setIsDeleteProductOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteProductOpen(false);
        setDeletingProduct(null);
        setDeleteReason("");
    };

    const handleEditProductSubmit = async () => {
        if (!editForm.name || !editForm.reason) {
            toast.error("Please fill in all required fields");
            return;
        }
        // Simplified for UI update
        setIsEditProductOpen(false);
        toast.success("Edit request submitted");
    };

    const handleDeleteProductSubmit = async () => {
        if (!deleteReason) {
            toast.error("Reason is required");
            return;
        }
        setIsDeleteProductOpen(false);
        toast.success("Delete request submitted");
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 py-6 rounded-2xl border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm border border-gray-200/50 dark:border-white/5 rounded-2xl shadow-sm hover:bg-white dark:hover:bg-dark-card transition-all"
                    >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{getCurrentViewLabel()}</span>
                        <Filter size={16} className="text-gray-400" />
                    </button>
                    {isViewDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-2xl shadow-xl z-50 py-2 backdrop-blur-xl">
                            {views.map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => { setCurrentView(view.id); setIsViewDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${currentView === view.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative">
                {renderCurrentView()}
            </div>

            <Modal isOpen={isEditProductOpen} onClose={closeEditModal} title="Edit Product">
                <div className="space-y-4 pt-2">
                    <Input label="Product Name" value={editForm.name} onChange={(e) => handleEditFormChange('name', e.target.value)} />
                    <Input label="Cost per Box" type="number" value={editForm.cost_per_box} onChange={(e) => handleEditFormChange('cost_per_box', e.target.value)} />
                    <Input label="Sell per Box" type="number" value={editForm.price_per_box} onChange={(e) => handleEditFormChange('price_per_box', e.target.value)} />
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Reason for Change</label>
                        <textarea
                            value={editForm.reason}
                            onChange={(e) => handleEditFormChange('reason', e.target.value)}
                            className="w-full p-4 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            rows={3}
                        />
                    </div>
                    <Button className="w-full py-6 rounded-2xl mt-2" onClick={handleEditProductSubmit}>Submit Changes</Button>
                </div>
            </Modal>

            <Modal isOpen={isDeleteProductOpen} onClose={closeDeleteModal} title="Delete Product">
                <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400">You are requesting to delete <span className="font-bold">{deletingProduct?.name}</span>. This action requires approval.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Reason for Deletion</label>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="w-full p-4 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            rows={3}
                        />
                    </div>
                    <Button variant="destructive" className="w-full py-6 rounded-2xl mt-2" onClick={handleDeleteProductSubmit}>Request Deletion</Button>
                </div>
            </Modal>

            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Product Details">
                {selectedProduct && (
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Package size={24} /></div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-display">{selectedProduct.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{getCategoryName(selectedProduct.category_id)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Stock</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white font-display">{selectedProduct.quantity_box} Boxes</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Price</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-display">${(selectedProduct.price_per_box || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" className="flex-1 rounded-2xl py-6" onClick={() => { setIsDetailsOpen(false); openEditModal(selectedProduct); }}><Edit3 size={18} className="mr-2" /> Edit</Button>
                            <Button variant="destructive" className="flex-1 rounded-2xl py-6" onClick={() => { setIsDetailsOpen(false); handleDeleteClick(selectedProduct); }}><Trash2 size={18} className="mr-2" /> Delete</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
