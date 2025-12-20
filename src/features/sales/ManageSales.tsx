import { useState, ChangeEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { toast } from "sonner";

export function ManageSales() {
  // Fetch sales data
  const sales = useQuery(api.sales.list, {}) || [];
  const products = useQuery(api.products.list, {}) || [];
  
  // Mutations
  const deleteSaleWithAudit = useMutation(api.sales.deleteSaleWithAudit);
  const updateSale = useMutation(api.sales.updateSale);
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    boxes_quantity: 0,
    kg_quantity: 0,
    payment_method: "",
    reason: ""
  });
  
  // State for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Helper function to format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Helper function to get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : "Unknown Product";
  };
  
  // Helper function to format status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      "pending": "Pending",
      "partial": "Partial",
      "completed": "Completed"
    };
    return statusMap[status] || status;
  };
  
  // Handle delete sale
  const handleDelete = (saleId: string) => {
    const sale = sales.find((s: any) => s._id === saleId);
    if (sale) {
      setCurrentSale(sale);
      setDeleteReason("");
      setDeleteErrors({});
      setIsDeleteModalOpen(true);
    }
  };
  
  // Handle delete form submission
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deleteReason.trim()) {
      setDeleteErrors({ reason: "Reason is required" });
      return;
    }
    
    try {
      await deleteSaleWithAudit({ 
        saleId: currentSale._id, 
        reason: deleteReason 
      });
      toast.success("Sale deletion request submitted for approval!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error requesting sale deletion:", error);
      toast.error("Failed to request sale deletion. Please try again.");
    }
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteReason("");
    setDeleteErrors({});
  };
  
  const handleDeleteReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDeleteReason(e.target.value);
    if (deleteErrors.reason) {
      setDeleteErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.reason;
        return newErrors;
      });
    }
  };
  
  const handleEditClick = (sale: any) => {
    setCurrentSale(sale);
    setEditFormData({
      boxes_quantity: sale.boxes_quantity,
      kg_quantity: sale.kg_quantity,
      payment_method: sale.payment_method,
      reason: ""
    });
    setErrors({});
    setIsEditModalOpen(true);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') ? Number(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (editFormData.boxes_quantity < 0) newErrors.boxes_quantity = "Cannot be negative";
    if (editFormData.kg_quantity < 0) newErrors.kg_quantity = "Cannot be negative";
    if (!editFormData.reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await updateSale({
        saleId: currentSale._id,
        boxes_quantity: editFormData.boxes_quantity,
        kg_quantity: editFormData.kg_quantity,
        payment_method: editFormData.payment_method || undefined,
        reason: editFormData.reason
      });
      toast.success("Sale updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Failed to update sale. Please try again.");
    }
  };
  
    return (
      <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl">
        <div className="p-7 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Recent Sales</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Quantity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Price Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Total</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              {sales.length > 0 ? (
                sales.map((sale: any) => (
                  <tr key={sale._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{getProductName(sale.product_id)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sale.boxes_quantity} Boxes</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{sale.kg_quantity} KG</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span>Box: ${sale.box_price.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 font-medium">${sale.kg_price.toFixed(2)}/KG</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${sale.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${sale.payment_status === 'completed' ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          sale.payment_status === 'partial' ? 'bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 
                          'bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {formatStatus(sale.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(sale)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(sale._id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">No sales records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      
      {/* Edit Sale Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Sale">
        {currentSale && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 mb-4">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Editing Record for</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight">{getProductName(currentSale.product_id)}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Boxes Quantity"
                type="number"
                name="boxes_quantity"
                value={editFormData.boxes_quantity}
                onChange={handleInputChange}
                error={errors.boxes_quantity}
              />
              <Input
                label="Kg Quantity"
                type="number"
                name="kg_quantity"
                value={editFormData.kg_quantity}
                onChange={handleInputChange}
                error={errors.kg_quantity}
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2 ml-1 font-display tracking-tight">Payment Method</label>
              <select
                name="payment_method"
                value={editFormData.payment_method}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-dark-text transition-all outline-none font-display tracking-tight"
              >
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2 ml-1 font-display tracking-tight">Reason for Edit <span className="text-red-500">*</span></label>
              <textarea
                name="reason"
                value={editFormData.reason}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border ${errors.reason ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-dark-text transition-all outline-none font-display tracking-tight`}
                rows={3}
                placeholder="Why are you editing this?"
              />
              {errors.reason && <p className="mt-2 ml-1 text-xs font-medium text-red-500">{errors.reason}</p>}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1">Update Record</Button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Delete Sale Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Sale">
        {currentSale && (
          <form onSubmit={handleDeleteSubmit} className="space-y-6">
            <div className="p-4 bg-red-50/50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10 mb-2">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Deleting Record for</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight">{getProductName(currentSale.product_id)}</h4>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 px-1 font-display">
              Deletion requires administrative approval. Please provide a detailed reason.
            </p>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2 ml-1 font-display tracking-tight">Reason for Deletion <span className="text-red-500">*</span></label>
              <textarea
                value={deleteReason}
                onChange={handleDeleteReasonChange}
                className={`w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border ${deleteErrors.reason ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-dark-text transition-all outline-none font-display tracking-tight`}
                rows={4}
                placeholder="Explain why this needs to be deleted..."
              />
              {deleteErrors.reason && <p className="mt-2 ml-1 text-xs font-medium text-red-500">{deleteErrors.reason}</p>}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeDeleteModal} className="flex-1">Cancel</Button>
              <Button type="submit" variant="danger" className="flex-1">Request Deletion</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
