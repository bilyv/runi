import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, PackagePlus, ArchiveRestore, AlertTriangle, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

interface ProductAddingProps {
}

export function ProductAdding({}: ProductAddingProps) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isRecordDamagedOpen, setIsRecordDamagedOpen] = useState(false);
  const [isStockCorrectionOpen, setIsStockCorrectionOpen] = useState(false);
  
  // Fetch real data from Convex
  const categories = useQuery(api.productCategories.list, {}) || [];
  const products = useQuery(api.products.list, {}) || [];
  
  // Mutations
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const restockProduct = useMutation(api.products.restock);
  const recordRestock = useMutation(api.products.recordRestock);
  const recordDamagedProduct = useMutation(api.products.recordDamagedProduct);
  const recordStockCorrection = useMutation(api.products.recordStockCorrection);
  
  // Add New Product Form State
  const [addProductForm, setAddProductForm] = useState({
    name: "",
    category_id: "",
    quantity_box: "",
    box_to_kg_ratio: "",
    weight: "",
    weightUnit: "kg",
    cost_per_box: "",
    sell_price_per_box: "",
    low_stock_alert: "",
    expiry_date: ""
  });
  
  // Restock Form State
  const [restockForm, setRestockForm] = useState({
    product_id: "",
    boxes_amount: "",
    kg_amount: "",
    delivery_date: "",
    expiry_date: ""
  });
  
  // Record Damaged Form State
  const [recordDamagedForm, setRecordDamagedForm] = useState({
    product_id: "",
    boxes_amount: "",
    kg_amount: "",
    reason: ""
  });
  
  // Stock Correction Form State
  const [stockCorrectionForm, setStockCorrectionForm] = useState({
    product_id: "",
    boxes_amount: "",
    kg_amount: "",
    reason: ""
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle Add New Product Form Changes
  const handleAddProductChange = (field: string, value: string) => {
    setAddProductForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle Restock Form Changes
  const handleRestockChange = (field: string, value: string) => {
    setRestockForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle Record Damaged Form Changes
  const handleRecordDamagedChange = (field: string, value: string) => {
    setRecordDamagedForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle Stock Correction Form Changes
  const handleStockCorrectionChange = (field: string, value: string) => {
    setStockCorrectionForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validate Add New Product Form
  const validateAddProductForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!addProductForm.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!addProductForm.category_id) {
      newErrors.category_id = "Category is required";
    }
    
    if (!addProductForm.quantity_box || isNaN(Number(addProductForm.quantity_box))) {
      newErrors.quantity_box = "Valid boxed quantity is required";
    }
    
    if (!addProductForm.box_to_kg_ratio || isNaN(Number(addProductForm.box_to_kg_ratio))) {
      newErrors.box_to_kg_ratio = "Valid conversion ratio is required";
    }
    
    if (!addProductForm.weight || isNaN(Number(addProductForm.weight))) {
      newErrors.weight = "Valid weight is required";
    }
    
    if (!addProductForm.cost_per_box || isNaN(Number(addProductForm.cost_per_box))) {
      newErrors.cost_per_box = "Valid cost per box is required";
    }
    
    if (!addProductForm.sell_price_per_box || isNaN(Number(addProductForm.sell_price_per_box))) {
      newErrors.sell_price_per_box = "Valid sell price per box is required";
    }
    
    if (!addProductForm.low_stock_alert || isNaN(Number(addProductForm.low_stock_alert))) {
      newErrors.low_stock_alert = "Valid low stock threshold is required";
    }
    
    if (!addProductForm.expiry_date) {
      newErrors.expiry_date = "Expiry date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate Restock Form
  const validateRestockForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!restockForm.product_id) {
      newErrors.product_id = "Product selection is required";
    }
    
    if (!restockForm.boxes_amount || isNaN(Number(restockForm.boxes_amount))) {
      newErrors.boxes_amount = "Valid boxes amount is required";
    }
    
    if (!restockForm.kg_amount || isNaN(Number(restockForm.kg_amount))) {
      newErrors.kg_amount = "Valid kg amount is required";
    }
    
    if (!restockForm.delivery_date) {
      newErrors.delivery_date = "Delivery date is required";
    }
    
    if (!restockForm.expiry_date) {
      newErrors.expiry_date = "Expiry date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate Record Damaged Form
  const validateRecordDamagedForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!recordDamagedForm.product_id) {
      newErrors.product_id = "Product selection is required";
    }
    
    if (!recordDamagedForm.boxes_amount || isNaN(Number(recordDamagedForm.boxes_amount))) {
      newErrors.boxes_amount = "Valid boxes amount is required";
    }
    
    if (!recordDamagedForm.kg_amount || isNaN(Number(recordDamagedForm.kg_amount))) {
      newErrors.kg_amount = "Valid kg amount is required";
    }
    
    if (!recordDamagedForm.reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate Stock Correction Form
  const validateStockCorrectionForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!stockCorrectionForm.product_id) {
      newErrors.product_id = "Product selection is required";
    }
    
    if (!stockCorrectionForm.boxes_amount || isNaN(Number(stockCorrectionForm.boxes_amount))) {
      newErrors.boxes_amount = "Valid boxes amount is required";
    }
    
    if (!stockCorrectionForm.kg_amount || isNaN(Number(stockCorrectionForm.kg_amount))) {
      newErrors.kg_amount = "Valid kg amount is required";
    }
    
    if (!stockCorrectionForm.reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle Add New Product Submit
  const handleAddProductSubmit = async () => {
    if (validateAddProductForm()) {
      try {
        // Calculate derived values
        const quantityBox = Number(addProductForm.quantity_box);
        const boxToKgRatio = Number(addProductForm.box_to_kg_ratio);
        const quantityKg = quantityBox * boxToKgRatio;
        const costPerBox = Number(addProductForm.cost_per_box);
        const costPerKg = boxToKgRatio > 0 ? costPerBox / boxToKgRatio : 0;
        const pricePerBox = Number(addProductForm.sell_price_per_box);
        const pricePerKg = boxToKgRatio > 0 ? pricePerBox / boxToKgRatio : 0;
        const profitPerBox = pricePerBox - costPerBox;
        const profitPerKg = pricePerKg - costPerKg;
        const lowStockThreshold = Number(addProductForm.low_stock_alert);
        
        // Calculate days left until expiry
        const expiryDate = new Date(addProductForm.expiry_date);
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        await createProduct({
          name: addProductForm.name,
          category_id: addProductForm.category_id as any,
          quantity_box: quantityBox,
          quantity_kg: quantityKg,
          box_to_kg_ratio: boxToKgRatio,
          cost_per_box: costPerBox,
          cost_per_kg: costPerKg,
          price_per_box: pricePerBox,
          price_per_kg: pricePerKg,
          profit_per_box: profitPerBox,
          profit_per_kg: profitPerKg,
          boxed_low_stock_threshold: lowStockThreshold,
          expiry_date: addProductForm.expiry_date,
          days_left: daysLeft
        });
        
        alert("Product added successfully!");
        setIsAddProductOpen(false);
        // Reset form
        setAddProductForm({
          name: "",
          category_id: "",
          quantity_box: "",
          box_to_kg_ratio: "",
          weight: "",
          weightUnit: "kg",
          cost_per_box: "",
          sell_price_per_box: "",
          low_stock_alert: "",
          expiry_date: ""
        });
      } catch (error: any) {
        console.error("Error adding product:", error);
        alert("Failed to add product: " + (error.message || "Unknown error"));
      }
    }
  };
  
  // Handle Restock Submit
  const handleRestockSubmit = async () => {
    if (validateRestockForm()) {
      try {
        const boxesAmount = Number(restockForm.boxes_amount);
        const kgAmount = Number(restockForm.kg_amount);
        
        // Get the selected product to calculate total cost
        const selectedProduct = products.find(p => p._id === restockForm.product_id);
        let totalCost = 0;
        if (selectedProduct) {
          totalCost = (boxesAmount * selectedProduct.cost_per_box) + (kgAmount * selectedProduct.cost_per_kg);
        }
        
        // Update product quantities
        await restockProduct({
          id: restockForm.product_id as any,
          boxes_amount: boxesAmount,
          kg_amount: kgAmount,
          delivery_date: restockForm.delivery_date,
          expiry_date: restockForm.expiry_date
        });
        
        // Record the restock transaction
        await recordRestock({
          addition_id: `restock_${Date.now()}`,
          product_id: restockForm.product_id as any,
          boxes_added: boxesAmount,
          kg_added: kgAmount,
          total_cost: totalCost,
          delivery_date: restockForm.delivery_date,
          status: "completed",
          performed_by: "User" // In a real app, this would be the actual user
        });
        
        alert("Restock recorded successfully!");
        setIsRestockOpen(false);
        // Reset form
        setRestockForm({
          product_id: "",
          boxes_amount: "",
          kg_amount: "",
          delivery_date: "",
          expiry_date: ""
        });
      } catch (error: any) {
        console.error("Error restocking product:", error);
        alert("Failed to restock product: " + (error.message || "Unknown error"));
      }
    }
  };
  
  // Handle Record Damaged Submit
  const handleRecordDamagedSubmit = async () => {
    if (validateRecordDamagedForm()) {
      try {
        // Get the selected product to calculate loss value
        const selectedProduct = products.find(p => p._id === recordDamagedForm.product_id);
        const boxesAmount = Number(recordDamagedForm.boxes_amount);
        const kgAmount = Number(recordDamagedForm.kg_amount);
        
        // Calculate loss value based on product cost
        let lossValue = 0;
        if (selectedProduct) {
          lossValue = (boxesAmount * selectedProduct.cost_per_box) + (kgAmount * selectedProduct.cost_per_kg);
        }
        
        await recordDamagedProduct({
          damage_id: `damage_${Date.now()}`,
          product_id: recordDamagedForm.product_id as any,
          damaged_boxes: boxesAmount,
          damaged_kg: kgAmount,
          damage_reason: recordDamagedForm.reason,
          damage_date: new Date().toISOString().split('T')[0],
          loss_value: lossValue,
          damage_approval: "pending",
          approved_by: "",
          approved_date: "",
          reported_by: "User", // In a real app, this would be the actual user
        });
        
        alert("Damage recorded successfully!");
        setIsRecordDamagedOpen(false);
        // Reset form
        setRecordDamagedForm({
          product_id: "",
          boxes_amount: "",
          kg_amount: "",
          reason: ""
        });
      } catch (error: any) {
        console.error("Error recording damaged product:", error);
        alert("Failed to record damaged product: " + (error.message || "Unknown error"));
      }
    }
  };
  
  // Handle Stock Correction Submit
  const handleStockCorrectionSubmit = async () => {
    if (validateStockCorrectionForm()) {
      try {
        const boxesAmount = Number(stockCorrectionForm.boxes_amount);
        const kgAmount = Number(stockCorrectionForm.kg_amount);
        
        await recordStockCorrection({
          correction_id: `correction_${Date.now()}`,
          product_id: stockCorrectionForm.product_id as any,
          box_adjustment: boxesAmount,
          kg_adjustment: kgAmount,
          status: "completed",
          performed_by: "User", // In a real app, this would be the actual user
        });
        
        alert("Stock corrected successfully!");
        setIsStockCorrectionOpen(false);
        // Reset form
        setStockCorrectionForm({
          product_id: "",
          boxes_amount: "",
          kg_amount: "",
          reason: ""
        });
      } catch (error: any) {
        console.error("Error recording stock correction:", error);
        alert("Failed to record stock correction: " + (error.message || "Unknown error"));
      }
    }
  };
  
    return (
      <div className="space-y-10">
        {/* Quick Action Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.button 
            whileHover={{ y: -4 }}
            onClick={() => setIsAddProductOpen(true)}
            className="group relative overflow-hidden bg-white dark:bg-dark-card/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 shadow-sm transition-all text-left"
          >
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <PackagePlus size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text font-display">New Product</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Register a new item in your inventory catalog.</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} className="text-emerald-500" />
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4 }}
            onClick={() => setIsRestockOpen(true)}
            className="group relative overflow-hidden bg-white dark:bg-dark-card/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 shadow-sm transition-all text-left"
          >
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <ArchiveRestore size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text font-display">Restock</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Increase quantity of existing products in stock.</p>
              </div>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4 }}
            onClick={() => setIsRecordDamagedOpen(true)}
            className="group relative overflow-hidden bg-white dark:bg-dark-card/50 p-6 rounded-2xl border border-red-500/10 hover:border-red-500/30 shadow-sm transition-all text-left"
          >
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text font-display text-red-600 dark:text-red-400">Record Damage</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Log items that are damaged or unusable.</p>
              </div>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -4 }}
            onClick={() => setIsStockCorrectionOpen(true)}
            className="group relative overflow-hidden bg-white dark:bg-dark-card/50 p-6 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 shadow-sm transition-all text-left"
          >
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text font-display text-amber-600 dark:text-amber-400">Correction</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adjust quantities for accuracy and audit.</p>
              </div>
            </div>
          </motion.button>
        </div>
        
        {/* Add New Product Modal */}
        <Modal 
          isOpen={isAddProductOpen} 
          onClose={() => setIsAddProductOpen(false)} 
          title="Create New Product"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/10">
            <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display">New Product</h2>
                <p className="text-sm text-gray-500">Fill in the details to add a new item to your catalog.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Product Name
                    </label>
                    <Input
                      value={addProductForm.name}
                      onChange={(e) => handleAddProductChange('name', e.target.value)}
                      placeholder="e.g. Premium Basmati Rice"
                      className={`h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Category
                    </label>
                    <select
                      value={addProductForm.category_id}
                      onChange={(e) => handleAddProductChange('category_id', e.target.value)}
                      className={`w-full h-12 px-4 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all dark:text-dark-text appearance-none ${errors.category_id ? "border-red-500 focus:border-red-500" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.category_name}</option>
                      ))}
                    </select>
                    {errors.category_id && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase ml-1">{errors.category_id}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                        Initial Stock (Boxes)
                      </label>
                      <Input
                        type="number"
                        value={addProductForm.quantity_box}
                        onChange={(e) => handleAddProductChange('quantity_box', e.target.value)}
                        placeholder="0"
                        className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                        Box:KG Ratio
                      </label>
                      <Input
                        type="number"
                        value={addProductForm.box_to_kg_ratio}
                        onChange={(e) => handleAddProductChange('box_to_kg_ratio', e.target.value)}
                        placeholder="1:25"
                        className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={addProductForm.expiry_date}
                      onChange={(e) => handleAddProductChange('expiry_date', e.target.value)}
                      className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 space-y-4">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Pricing Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Cost / Box</label>
                    <Input
                      type="number"
                      value={addProductForm.cost_per_box}
                      onChange={(e) => handleAddProductChange('cost_per_box', e.target.value)}
                      placeholder="$0.00"
                      className="h-11 border-emerald-500/10 focus:border-emerald-500/30 bg-white dark:bg-dark-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Sell / Box</label>
                    <Input
                      type="number"
                      value={addProductForm.sell_price_per_box}
                      onChange={(e) => handleAddProductChange('sell_price_per_box', e.target.value)}
                      placeholder="$0.00"
                      className="h-11 border-emerald-500/10 focus:border-emerald-500/30 bg-white dark:bg-dark-card font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Alert Threshold</label>
                    <Input
                      type="number"
                      value={addProductForm.low_stock_alert}
                      onChange={(e) => handleAddProductChange('low_stock_alert', e.target.value)}
                      placeholder="5"
                      className="h-11 border-emerald-500/10 focus:border-emerald-500/30 bg-white dark:bg-dark-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Expected Profit</label>
                    <div className="h-11 flex items-center px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                      ${(Number(addProductForm.sell_price_per_box) - Number(addProductForm.cost_per_box)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/10">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-6 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddProductSubmit}
                  className="px-10 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                >
                  Confirm & Create
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      
        {/* Restock Modal */}
        <Modal 
          isOpen={isRestockOpen} 
          onClose={() => setIsRestockOpen(false)} 
          title="Restock Products"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/10">
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display">Restock Inventory</h2>
                <p className="text-sm text-gray-500">Add new units to an existing product in your catalog.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                    Select Product
                  </label>
                  <select
                    value={restockForm.product_id}
                    onChange={(e) => handleRestockChange('product_id', e.target.value)}
                    className={`w-full h-12 px-4 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-emerald-500/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all dark:text-dark-text appearance-none ${errors.product_id ? "border-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Boxes to Add
                    </label>
                    <Input
                      type="number"
                      value={restockForm.boxes_amount}
                      onChange={(e) => handleRestockChange('boxes_amount', e.target.value)}
                      placeholder="0"
                      className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      KG to Add
                    </label>
                    <Input
                      type="number"
                      value={restockForm.kg_amount}
                      onChange={(e) => handleRestockChange('kg_amount', e.target.value)}
                      placeholder="0"
                      className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Delivery Date
                    </label>
                    <Input
                      type="date"
                      value={restockForm.delivery_date}
                      onChange={(e) => handleRestockChange('delivery_date', e.target.value)}
                      className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                      Batch Expiry
                    </label>
                    <Input
                      type="date"
                      value={restockForm.expiry_date}
                      onChange={(e) => handleRestockChange('expiry_date', e.target.value)}
                      className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/10">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsRestockOpen(false)}
                  className="px-6 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRestockSubmit}
                  className="px-10 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold uppercase tracking-wider text-xs transition-all"
                >
                  Confirm Restock
                </Button>
              </div>
            </div>
          </div>
        </Modal>
        
        {/* Record Damaged Modal */}
        <Modal 
          isOpen={isRecordDamagedOpen} 
          onClose={() => setIsRecordDamagedOpen(false)} 
          title="Report Damage"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-red-500/10">
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display text-red-600">Report Damage</h2>
                <p className="text-sm text-gray-500">Record inventory losses due to damage or expiration.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 ml-1">
                    Affected Product
                  </label>
                  <select
                    value={recordDamagedForm.product_id}
                    onChange={(e) => handleRecordDamagedChange('product_id', e.target.value)}
                    className={`w-full h-12 px-4 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-red-500/10 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all dark:text-dark-text appearance-none ${errors.product_id ? "border-red-500" : ""}`}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 ml-1">
                      Damaged Boxes
                    </label>
                    <Input
                      type="number"
                      value={recordDamagedForm.boxes_amount}
                      onChange={(e) => handleRecordDamagedChange('boxes_amount', e.target.value)}
                      placeholder="0"
                      className="h-12 border-red-500/10 focus:border-red-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 ml-1">
                      Damaged KG
                    </label>
                    <Input
                      type="number"
                      value={recordDamagedForm.kg_amount}
                      onChange={(e) => handleRecordDamagedChange('kg_amount', e.target.value)}
                      placeholder="0"
                      className="h-12 border-red-500/10 focus:border-red-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 ml-1">
                    Reason for Loss
                  </label>
                  <textarea
                    value={recordDamagedForm.reason}
                    onChange={(e) => handleRecordDamagedChange('reason', e.target.value)}
                    placeholder="Describe how the damage occurred..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-red-500/10 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all dark:text-dark-text"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-red-500/10">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsRecordDamagedOpen(false)}
                  className="px-6 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRecordDamagedSubmit}
                  className="px-10 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold uppercase tracking-wider text-xs transition-all"
                >
                  Record Loss
                </Button>
              </div>
            </div>
          </div>
        </Modal>
        
        {/* Stock Correction Modal */}
        <Modal 
          isOpen={isStockCorrectionOpen} 
          onClose={() => setIsStockCorrectionOpen(false)} 
          title="Manual Correction"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-amber-500/10">
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display text-amber-600">Inventory Correction</h2>
                <p className="text-sm text-gray-500">Manually adjust stock levels to match physical audit results.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5 ml-1">
                    Select Product
                  </label>
                  <select
                    value={stockCorrectionForm.product_id}
                    onChange={(e) => handleStockCorrectionChange('product_id', e.target.value)}
                    className="w-full h-12 px-4 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all dark:text-dark-text appearance-none"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5 ml-1">
                      Box Adjustment (+/-)
                    </label>
                    <Input
                      type="number"
                      value={stockCorrectionForm.boxes_amount}
                      onChange={(e) => handleStockCorrectionChange('boxes_amount', e.target.value)}
                      placeholder="e.g. -2 or 5"
                      className="h-12 border-amber-500/10 focus:border-amber-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5 ml-1">
                      KG Adjustment (+/-)
                    </label>
                    <Input
                      type="number"
                      value={stockCorrectionForm.kg_amount}
                      onChange={(e) => handleStockCorrectionChange('kg_amount', e.target.value)}
                      placeholder="e.g. -10 or 25"
                      className="h-12 border-amber-500/10 focus:border-amber-500/30 bg-gray-50 dark:bg-dark-bg/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5 ml-1">
                    Audit Notes
                  </label>
                  <textarea
                    value={stockCorrectionForm.reason}
                    onChange={(e) => handleStockCorrectionChange('reason', e.target.value)}
                    placeholder="Explain the reason for this manual adjustment..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-dark-bg/50 border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all dark:text-dark-text"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/10">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsStockCorrectionOpen(false)}
                  className="px-6 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStockCorrectionSubmit}
                  className="px-10 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-bold uppercase tracking-wider text-xs transition-all"
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </Modal>
    </div>
  );
}
