import { useState, ChangeEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export function ManageSales() {
  // Fetch sales data
  const sales = useQuery(api.sales.list, {}) || [];
  const products = useQuery(api.products.list, {}) || [];
  
  // Mutations
  const deleteSale = useMutation(api.sales.deleteSale);
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
    
    // Validate reason
    if (!deleteReason.trim()) {
      setDeleteErrors({ reason: "Reason is required" });
      return;
    }
    
    try {
      await deleteSaleWithAudit({ 
        saleId: currentSale._id, 
        reason: deleteReason 
      });
      alert("Sale deletion request submitted for approval!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error requesting sale deletion:", error);
      alert("Failed to request sale deletion. Please try again.");
    }
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteReason("");
    setDeleteErrors({});
  };
  
  // Handle delete reason change
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
  
  // Confirm delete (after approval)
  const confirmDelete = async () => {
    if (window.confirm("Are you sure you want to delete this sale? This will create an audit record for approval.")) {
      try {
        await deleteSaleWithAudit({ 
          saleId: currentSale._id, 
          reason: deleteReason 
        });
        alert("Sale deletion request submitted for approval!");
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error requesting sale deletion:", error);
        alert("Failed to request sale deletion. Please try again.");
      }
    }
  };
  
  // Handle edit button click
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
  
  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') ? Number(value) : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (editFormData.boxes_quantity < 0) {
      newErrors.boxes_quantity = "Boxes quantity cannot be negative";
    }
    
    if (editFormData.kg_quantity < 0) {
      newErrors.kg_quantity = "Kg quantity cannot be negative";
    }
    
    if (!editFormData.reason.trim()) {
      newErrors.reason = "Reason for edit is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
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
      
      alert("Sale updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating sale:", error);
      alert("Failed to update sale. Please try again.");
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Manage Sales</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (Box/Kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit (Box/Kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performed By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
            {sales.length > 0 ? (
              sales.map((sale: any) => (
                <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-dark-card/80">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                    {getProductName(sale.product_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.boxes_quantity} boxes, {sale.kg_quantity} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>Box: {sale.box_price.toFixed(2)}</span>
                      <span>Kg: {sale.kg_price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>Box: {sale.profit_per_box.toFixed(2)}</span>
                      <span>Kg: {sale.profit_per_kg.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${sale.payment_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {formatStatus(sale.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(sale.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.performed_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleEditClick(sale)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(sale._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No sales records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit Sale Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Sale"
      >
        {currentSale && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                  Product: {getProductName(currentSale.product_id)}
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Quantities
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Boxes Quantity"
                    type="number"
                    name="boxes_quantity"
                    value={editFormData.boxes_quantity}
                    onChange={handleInputChange}
                    error={errors.boxes_quantity}
                    min="0"
                  />
                  <Input
                    label="Kg Quantity"
                    type="number"
                    name="kg_quantity"
                    value={editFormData.kg_quantity}
                    onChange={handleInputChange}
                    error={errors.kg_quantity}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={editFormData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Reason for Edit <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={editFormData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors"
                  rows={3}
                  placeholder="Enter reason for editing this sale..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                >
                  Submit for Approval
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Delete Sale Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal}
        title="Delete Sale"
      >
        {currentSale && (
          <form onSubmit={handleDeleteSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                  Product: {getProductName(currentSale.product_id)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this sale? This action requires approval.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Reason for Deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={handleDeleteReasonChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${deleteErrors.reason ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-dark-border"}`}
                  rows={4}
                  placeholder="Enter reason for deleting this sale..."
                />
                {deleteErrors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{deleteErrors.reason}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={closeDeleteModal}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="danger"
                >
                  Submit for Approval
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}