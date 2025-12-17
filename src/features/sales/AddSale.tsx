import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function AddSale() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    product_id: "",
    boxes_quantity: "",
    kg_quantity: "",
    payment_method: "Mobile Money",
    payment_status: "Paid",
    client_name: "",
    phone_number: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch products for dropdown
  const products = useQuery(api.products.list, {}) || [];
  const createSale = useMutation(api.sales.create);
  
  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.product_id) {
      newErrors.product_id = "Product is required";
    }
    
    if (!formData.boxes_quantity && !formData.kg_quantity) {
      newErrors.boxes_quantity = "Either boxes or kg quantity is required";
      newErrors.kg_quantity = "Either boxes or kg quantity is required";
    }
    
    if (formData.boxes_quantity && isNaN(Number(formData.boxes_quantity))) {
      newErrors.boxes_quantity = "Must be a valid number";
    }
    
    if (formData.kg_quantity && isNaN(Number(formData.kg_quantity))) {
      newErrors.kg_quantity = "Must be a valid number";
    }
    
    if ((formData.payment_status === "Pending" || formData.payment_status === "Half Paid") && !formData.client_name) {
      newErrors.client_name = "Client name is required for pending payments";
    }
    
    if ((formData.payment_status === "Pending" || formData.payment_status === "Half Paid") && !formData.phone_number) {
      newErrors.phone_number = "Phone number is required for pending payments";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // In a real implementation, you would get the actual user ID
      const userId = "user_123"; // Placeholder
      
      // Find the selected product to get pricing information
      const selectedProduct = products.find(p => p._id === formData.product_id);
      
      if (!selectedProduct) {
        throw new Error("Selected product not found");
      }
      
      // Calculate quantities and amounts
      const boxesQuantity = parseFloat(formData.boxes_quantity) || 0;
      const kgQuantity = parseFloat(formData.kg_quantity) || 0;
      
      // Calculate total amount based on product prices
      const totalAmount = (boxesQuantity * selectedProduct.price_per_box) + (kgQuantity * selectedProduct.price_per_kg);
      
      // Determine amount paid based on payment status
      let amountPaid = 0;
      if (formData.payment_status === "Paid") {
        amountPaid = totalAmount;
      } else if (formData.payment_status === "Half Paid") {
        amountPaid = totalAmount / 2;
      }
      
      const remainingAmount = totalAmount - amountPaid;
      
      // Create the sale
      await createSale({
        sales_id: `sale_${Date.now()}`,
        user_id: userId,
        product_id: formData.product_id,
        boxes_quantity: boxesQuantity,
        kg_quantity: kgQuantity,
        box_price: selectedProduct.price_per_box,
        kg_price: selectedProduct.price_per_kg,
        profit_per_box: selectedProduct.profit_per_box || 0,
        profit_per_kg: selectedProduct.profit_per_kg || 0,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        remaining_amount: remainingAmount,
        payment_status: formData.payment_status.toLowerCase() as any,
        payment_method: formData.payment_method,
        performed_by: userId,
        client_id: `client_${Date.now()}`,
        client_name: formData.client_name,
        phone_number: formData.phone_number,
        updated_at: Date.now()
      });
      
      // Reset form
      setFormData({
        product_id: "",
        boxes_quantity: "",
        kg_quantity: "",
        payment_method: "Mobile Money",
        payment_status: "Paid",
        client_name: "",
        phone_number: ""
      });
      
      alert("Sale created successfully!");
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Failed to create sale. Please try again.");
    }
  };
  
  // Show form when "Start New Sale" is clicked
  if (!isFormVisible) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">Add New Sale</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new sale transaction. Add customer details, products, and payment information.
          </p>
          <button 
            onClick={() => setIsFormVisible(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Start New Sale
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">New Sale</h2>
        <button 
          onClick={() => setIsFormVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Product & Quantity */}
        <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">Product & Quantity</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Product
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => handleChange('product_id', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                  errors.product_id ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                }`}
              >
                <option value="">Select a product</option>
                {products.map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.quantity_box || 0} boxes, {product.quantity_kg || 0} kg)
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product_id}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Requested Box Amount"
                  type="number"
                  value={formData.boxes_quantity}
                  onChange={(e) => handleChange('boxes_quantity', e.target.value)}
                  error={errors.boxes_quantity}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <Input
                  label="Requested Kg Amount"
                  type="number"
                  value={formData.kg_quantity}
                  onChange={(e) => handleChange('kg_quantity', e.target.value)}
                  error={errors.kg_quantity}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 2: Payment Information */}
        <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">Payment Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => handleChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Half Paid">Half Paid</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Section 3: Client Information (Conditional Visibility) */}
        {(formData.payment_status === "Pending" || formData.payment_status === "Half Paid") && (
          <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">Client Information</h3>
            
            <div className="space-y-4">
              <div>
                <Input
                  label="Client Name"
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  error={errors.client_name}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  error={errors.phone_number}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary">
            Create Sale
          </Button>
        </div>
      </form>
    </div>
  );
}