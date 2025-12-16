import { useState, useEffect } from "react";
import { Plus, PackagePlus, ArchiveRestore, AlertTriangle, Edit3 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

interface ProductAddingProps {
}

interface Product {
  _id: string;
  name: string;
  category_id: string;
  quantity_box: number;
  quantity_kg: number;
  box_to_kg_ratio: number;
  cost_per_box: number;
  cost_per_kg: number;
  price_per_box: number;
  price_per_kg: number;
  boxed_low_stock_threshold: number;
  expiry_date: string;
}

interface Category {
  _id: string;
  category_name: string;
}

export function ProductAdding({}: ProductAddingProps) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isRecordDamagedOpen, setIsRecordDamagedOpen] = useState(false);
  const [isStockCorrectionOpen, setIsStockCorrectionOpen] = useState(false);
  
  // Mock data for demonstration - in a real app, this would come from Convex queries
  const [products, setProducts] = useState<Product[]>([
    { 
      _id: "1", 
      name: "Sample Product 1", 
      category_id: "cat1",
      quantity_box: 10,
      quantity_kg: 5,
      box_to_kg_ratio: 2,
      cost_per_box: 100,
      cost_per_kg: 50,
      price_per_box: 150,
      price_per_kg: 75,
      boxed_low_stock_threshold: 5,
      expiry_date: "2024-12-31"
    },
    { 
      _id: "2", 
      name: "Sample Product 2", 
      category_id: "cat2",
      quantity_box: 20,
      quantity_kg: 10,
      box_to_kg_ratio: 2,
      cost_per_box: 200,
      cost_per_kg: 100,
      price_per_box: 300,
      price_per_kg: 150,
      boxed_low_stock_threshold: 3,
      expiry_date: "2025-06-30"
    }
  ]);
  
  const [categories, setCategories] = useState<Category[]>([
    { _id: "cat1", category_name: "Electronics" },
    { _id: "cat2", category_name: "Clothing" },
    { _id: "cat3", category_name: "Food & Beverages" }
  ]);
  
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
  const handleAddProductSubmit = () => {
    if (validateAddProductForm()) {
      // In a real app, this would call a Convex mutation
      console.log("Add New Product Submitted:", addProductForm);
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
    }
  };
  
  // Handle Restock Submit
  const handleRestockSubmit = () => {
    if (validateRestockForm()) {
      // In a real app, this would call a Convex mutation
      console.log("Restock Submitted:", restockForm);
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
    }
  };
  
  // Handle Record Damaged Submit
  const handleRecordDamagedSubmit = () => {
    if (validateRecordDamagedForm()) {
      // In a real app, this would call a Convex mutation
      console.log("Record Damaged Submitted:", recordDamagedForm);
      alert("Damage recorded successfully!");
      setIsRecordDamagedOpen(false);
      // Reset form
      setRecordDamagedForm({
        product_id: "",
        boxes_amount: "",
        kg_amount: "",
        reason: ""
      });
    }
  };
  
  // Handle Stock Correction Submit
  const handleStockCorrectionSubmit = () => {
    if (validateStockCorrectionForm()) {
      // In a real app, this would call a Convex mutation
      console.log("Stock Correction Submitted:", stockCorrectionForm);
      alert("Stock corrected successfully!");
      setIsStockCorrectionOpen(false);
      // Reset form
      setStockCorrectionForm({
        product_id: "",
        boxes_amount: "",
        kg_amount: "",
        reason: ""
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border flex flex-col items-center text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
            <PackagePlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Add New Product</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Create and register a new product in your inventory
          </p>
          <Button 
            variant="secondary" 
            className="w-full text-sm"
            onClick={() => setIsAddProductOpen(true)}
          >
            Add Product
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border flex flex-col items-center text-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-3">
            <ArchiveRestore className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Restock</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Increase quantity of existing products in stock
          </p>
          <Button 
            variant="secondary" 
            className="w-full text-sm"
            onClick={() => setIsRestockOpen(true)}
          >
            Restock Items
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border flex flex-col items-center text-center">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Record Damaged</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Log products that are damaged or unusable
          </p>
          <Button 
            variant="secondary" 
            className="w-full text-sm"
            onClick={() => setIsRecordDamagedOpen(true)}
          >
            Record Damage
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border flex flex-col items-center text-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
            <Edit3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Stock Correction</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Adjust stock quantities for accuracy and corrections
          </p>
          <Button 
            variant="secondary" 
            className="w-full text-sm"
            onClick={() => setIsStockCorrectionOpen(true)}
          >
            Correct Stock
          </Button>
        </div>
      </div>
      
      {/* Add New Product Modal */}
      <Modal 
        isOpen={isAddProductOpen} 
        onClose={() => setIsAddProductOpen(false)} 
        title="Add New Product"
      >
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">Add New Product</h2>
            </div>
            
            {/* Product Details Form */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addProductForm.name}
                    onChange={(e) => handleAddProductChange('name', e.target.value)}
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addProductForm.category_id}
                    onChange={(e) => handleAddProductChange('category_id', e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                      errors.category_id ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category_id}</p>
                  )}
                </div>
              </div>
              
              {/* Quantity & Measurement */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Quantity & Measurement</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Boxed Qty
                    </label>
                    <input
                      type="number"
                      value={addProductForm.quantity_box}
                      onChange={(e) => handleAddProductChange('quantity_box', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.quantity_box ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="Boxes"
                    />
                    {errors.quantity_box && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.quantity_box}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Box to Kg <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={addProductForm.box_to_kg_ratio}
                      onChange={(e) => handleAddProductChange('box_to_kg_ratio', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.box_to_kg_ratio ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="Ratio"
                    />
                    {errors.box_to_kg_ratio && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.box_to_kg_ratio}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={addProductForm.weight}
                      onChange={(e) => handleAddProductChange('weight', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.weight ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="Kg"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.weight}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Cost Pricing */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Cost Pricing</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Cost per Box ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={addProductForm.cost_per_box}
                      onChange={(e) => handleAddProductChange('cost_per_box', e.target.value)}
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
                        value={addProductForm.cost_per_box && addProductForm.box_to_kg_ratio ? 
                          (Number(addProductForm.cost_per_box) / Number(addProductForm.box_to_kg_ratio)).toFixed(2) : ''}
                        readOnly
                        className="w-full pl-5 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors bg-gray-100 dark:bg-dark-bg/50 cursor-not-allowed"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selling Pricing */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Selling Pricing</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Sell per Box ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={addProductForm.sell_price_per_box}
                      onChange={(e) => handleAddProductChange('sell_price_per_box', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.sell_price_per_box ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="$0.00"
                    />
                    {errors.sell_price_per_box && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.sell_price_per_box}</p>
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
                        value={addProductForm.sell_price_per_box && addProductForm.box_to_kg_ratio ? 
                          (Number(addProductForm.sell_price_per_box) / Number(addProductForm.box_to_kg_ratio)).toFixed(2) : ''}
                        readOnly
                        className="w-full pl-5 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors bg-gray-100 dark:bg-dark-bg/50 cursor-not-allowed"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stock & Expiry */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Stock & Expiry</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      value={addProductForm.low_stock_alert}
                      onChange={(e) => handleAddProductChange('low_stock_alert', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.low_stock_alert ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="Threshold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={addProductForm.expiry_date}
                      onChange={(e) => handleAddProductChange('expiry_date', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors ${
                        errors.expiry_date ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    {errors.expiry_date && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.expiry_date}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsAddProductOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleAddProductSubmit}
              >
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Restock Modal */}
      <Modal 
        isOpen={isRestockOpen} 
        onClose={() => setIsRestockOpen(false)} 
        title="Restock Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Product
            </label>
            <select
              value={restockForm.product_id}
              onChange={(e) => handleRestockChange('product_id', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.product_id ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product_id}</p>
            )}
          </div>
          
          <Input
            label="Boxes Amount"
            type="number"
            value={restockForm.boxes_amount}
            onChange={(e) => handleRestockChange('boxes_amount', e.target.value)}
            error={errors.boxes_amount}
            placeholder="Enter number of boxes"
          />
          
          <Input
            label="Kg Amount"
            type="number"
            value={restockForm.kg_amount}
            onChange={(e) => handleRestockChange('kg_amount', e.target.value)}
            error={errors.kg_amount}
            placeholder="Enter kg amount"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Delivery Date
            </label>
            <input
              type="date"
              value={restockForm.delivery_date}
              onChange={(e) => handleRestockChange('delivery_date', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.delivery_date ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.delivery_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.delivery_date}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={restockForm.expiry_date}
              onChange={(e) => handleRestockChange('expiry_date', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.expiry_date ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.expiry_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiry_date}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsRestockOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRestockSubmit}
            >
              Record Restock
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Record Damaged Modal */}
      <Modal 
        isOpen={isRecordDamagedOpen} 
        onClose={() => setIsRecordDamagedOpen(false)} 
        title="Record Damaged Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Product
            </label>
            <select
              value={recordDamagedForm.product_id}
              onChange={(e) => handleRecordDamagedChange('product_id', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.product_id ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product_id}</p>
            )}
          </div>
          
          <Input
            label="Boxes Amount"
            type="number"
            value={recordDamagedForm.boxes_amount}
            onChange={(e) => handleRecordDamagedChange('boxes_amount', e.target.value)}
            error={errors.boxes_amount}
            placeholder="Enter number of boxes"
          />
          
          <Input
            label="Kg Amount"
            type="number"
            value={recordDamagedForm.kg_amount}
            onChange={(e) => handleRecordDamagedChange('kg_amount', e.target.value)}
            error={errors.kg_amount}
            placeholder="Enter kg amount"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Reason
            </label>
            <textarea
              value={recordDamagedForm.reason}
              onChange={(e) => handleRecordDamagedChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.reason ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
              rows={3}
              placeholder="Describe the damage reason"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsRecordDamagedOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRecordDamagedSubmit}
            >
              Record Damage
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Stock Correction Modal */}
      <Modal 
        isOpen={isStockCorrectionOpen} 
        onClose={() => setIsStockCorrectionOpen(false)} 
        title="Stock Correction"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Product
            </label>
            <select
              value={stockCorrectionForm.product_id}
              onChange={(e) => handleStockCorrectionChange('product_id', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.product_id ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product_id}</p>
            )}
          </div>
          
          <Input
            label="Boxes Amount"
            type="number"
            value={stockCorrectionForm.boxes_amount}
            onChange={(e) => handleStockCorrectionChange('boxes_amount', e.target.value)}
            error={errors.boxes_amount}
            placeholder="Enter number of boxes"
          />
          
          <Input
            label="Kg Amount"
            type="number"
            value={stockCorrectionForm.kg_amount}
            onChange={(e) => handleStockCorrectionChange('kg_amount', e.target.value)}
            error={errors.kg_amount}
            placeholder="Enter kg amount"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Reason
            </label>
            <textarea
              value={stockCorrectionForm.reason}
              onChange={(e) => handleStockCorrectionChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text transition-colors ${
                errors.reason ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
              rows={3}
              placeholder="Explain the reason for stock correction"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsStockCorrectionOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStockCorrectionSubmit}
            >
              Apply Correction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
