import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Extend the auth users table with custom business fields
const customAuthTables = {
  ...authTables,
  users: defineTable({
    // Standard auth fields
    ...authTables.users.validator.fields,
    // Custom business fields
    businessName: v.optional(v.string()),
    businessEmail: v.optional(v.string()),
    fullName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("businessEmail", ["businessEmail"]),
};

const applicationTables = {
  // Products
  // Products
  products: defineTable({
    user_id: v.id("users"),
    name: v.string(),
    category_id: v.id("productcategory"),
    quantity_box: v.number(),
    quantity_kg: v.number(),
    box_to_kg_ratio: v.number(),
    cost_per_box: v.number(),
    cost_per_kg: v.number(),
    price_per_box: v.number(),
    price_per_kg: v.number(),
    profit_per_box: v.number(),
    profit_per_kg: v.number(),
    boxed_low_stock_threshold: v.number(),
    expiry_date: v.string(), // Changed to string for easier date handling or number? User said "expiry_date", usually date string or timestamp. I'll use number for timestamp consistency with updated_at.
    days_left: v.number(),
    updated_at: v.number(),
    // Optional fields not strictly requested but likely needed (can be removed if strictness required)
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sku: v.optional(v.string()),
  })
    .index("by_user", ["user_id"])
    .index("by_category", ["category_id"])
    .index("by_user_and_category", ["user_id", "category_id"]),

  // Product Categories
  productcategory: defineTable({
    user_id: v.id("users"),
    category_name: v.string(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_and_name", ["user_id", "category_name"]),


  // Stock Additions
  stock_additions: defineTable({
    addition_id: v.string(),
    product_id: v.id("products"),
    user_id: v.id("users"),
    boxes_added: v.number(),
    kg_added: v.number(),
    total_cost: v.number(),
    delivery_date: v.string(),
    status: v.string(),
    performed_by: v.string(),
    updated_at: v.number(),
  })
    .index("by_product", ["product_id"])
    .index("by_user", ["user_id"]),

  // Stock Corrections
  stock_corrections: defineTable({
    correction_id: v.string(),
    user_id: v.id("users"),
    product_id: v.id("products"),
    box_adjustment: v.number(),
    kg_adjustment: v.number(),
    status: v.string(),
    performed_by: v.string(),
    updated_at: v.number(),
  })
    .index("by_product", ["product_id"])
    .index("by_user", ["user_id"]),


  // Damaged Products
  damaged_products: defineTable({
    damage_id: v.string(),
    user_id: v.id("users"),
    product_id: v.id("products"),
    damaged_boxes: v.number(),
    damaged_kg: v.number(),
    damage_reason: v.string(),
    damage_date: v.string(),
    loss_value: v.number(),
    damage_approval: v.string(),
    approved_by: v.string(),
    approved_date: v.string(),
    reported_by: v.string(),
    updated_at: v.number(),
  })
    .index("by_product", ["product_id"])
    .index("by_user", ["user_id"]),


  // Stock Movements
  stock_movements: defineTable({
    movement_id: v.string(),
    user_id: v.id("users"),
    product_id: v.id("products"),
    movement_type: v.string(),
    box_change: v.number(),
    kg_change: v.number(),
    old_value: v.number(),
    new_value: v.number(),
    damaged_id: v.optional(v.id("damaged_products")),
    stock_addition_id: v.optional(v.id("stock_additions")),
    correction_id: v.optional(v.id("stock_corrections")),
    reason: v.string(),
    status: v.string(),
    performed: v.string(),
    updated_at: v.number(),
  })
    .index("by_product", ["product_id"])
    .index("by_user", ["user_id"]),


  // Sales
  sales: defineTable({
    customerName: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    amountPaid: v.number(),
    status: v.union(v.literal("pending"), v.literal("partial"), v.literal("completed")),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"]),

  // Expense Categories
  expensecategory: defineTable({
    userId: v.id("users"),
    name: v.string(),
    budget: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Expenses
  expenses: defineTable({
    userId: v.id("users"),
    title: v.string(),
    categoryId: v.id("expensecategory"),
    amount: v.number(),
    date: v.number(),
    addedBy: v.string(),
    status: v.string(),
    receiptUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"])
    .index("by_user_and_category", ["userId", "categoryId"]),

  // Documents
  documents: defineTable({
    name: v.string(),
    type: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    folder_id: v.optional(v.id("folders")),
    tags: v.array(v.string()),
    uploadedBy: v.id("users"),
  })
    .index("by_folder", ["folder_id"])
    .index("by_type", ["type"]),

  // Folders table
  folders: defineTable({
    folder_id: v.string(),
    user_id: v.id("users"),
    folder_name: v.string(),
    file_count: v.number(),
    total_size: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"]),

  // Files table
  files: defineTable({
    file_id: v.string(),
    user_id: v.id("users"),
    file_name: v.string(),
    file_url: v.string(),
    file_type: v.string(),
    folder_id: v.optional(v.id("folders")),
    file_size: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_folder", ["folder_id"]),

  // Settings
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    category: v.string(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),
};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
