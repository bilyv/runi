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


  // Restock
  restock: defineTable({
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
    field_changed: v.optional(v.string()),
    box_change: v.number(),
    kg_change: v.number(),
    old_value: v.union(v.number(), v.string()),
    new_value: v.union(v.number(), v.string()),
    damaged_id: v.optional(v.id("damaged_products")),
    restock_id: v.optional(v.id("restock")),
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
    sales_id: v.string(),
    user_id: v.id("users"),
    product_id: v.id("products"),
    boxes_quantity: v.number(),
    kg_quantity: v.number(),
    box_price: v.number(),
    kg_price: v.number(),
    profit_per_box: v.number(),
    profit_per_kg: v.number(),
    total_amount: v.number(),
    amount_paid: v.number(),
    remaining_amount: v.number(),
    payment_status: v.union(v.literal("pending"), v.literal("partial"), v.literal("completed")),
    payment_method: v.string(),
    performed_by: v.id("users"),
    client_id: v.string(),
    client_name: v.string(),
    phone_number: v.string(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_product", ["product_id"])
    .index("by_client", ["client_id"])
    .index("by_payment_status", ["payment_status"])
    .index("by_performed_by", ["performed_by"]),

  // Sales Audit
  sales_audit: defineTable({
    audit_id: v.string(),
    user_id: v.id("users"),
    sales_id: v.id("sales"),
    audit_type: v.string(),
    boxes_change: v.object({
      before: v.optional(v.number()),
      after: v.optional(v.number()),
    }),
    kg_change: v.object({
      before: v.optional(v.number()),
      after: v.optional(v.number()),
    }),
    old_values: v.optional(v.any()),
    new_values: v.optional(v.any()),
    performed_by: v.id("users"),
    approval_status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    approved_by: v.optional(v.id("users")),
    approved_timestamp: v.optional(v.number()),
    reason: v.string(),
    approval_reason: v.optional(v.string()),
    updated_at: v.number(),
  })
    .index("by_sales", ["sales_id"])
    .index("by_user", ["user_id"])
    .index("by_performed_by", ["performed_by"])
    .index("by_approval_status", ["approval_status"]),

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
    storage_id: v.id("_storage"),
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



  // Deposit
  deposit: defineTable({
    deposit_id: v.string(),
    user_id: v.string(),
    deposit_type: v.string(),
    account_name: v.string(),
    account_number: v.string(),
    amount: v.number(),
    to_recipient: v.string(),
    deposit_image_url: v.string(),
    approval: v.string(),
    created_by: v.string(),
    updated_at: v.number(),
    updated_by: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_deposit_id", ["deposit_id"]),

  // Staff
  staff: defineTable({
    staff_id: v.string(),
    user_id: v.id("users"),
    staff_full_name: v.string(),
    email_address: v.string(),
    phone_number: v.string(),
    id_card_front_url: v.string(),
    id_card_back_url: v.string(),
    password: v.string(),
    session_token: v.optional(v.string()),
    session_expiry: v.optional(v.number()),
    is_active: v.optional(v.boolean()), // Defaults to true if undefined
    failed_login_attempts: v.optional(v.number()),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_staff_id", ["staff_id"])
    .index("by_phone", ["phone_number"])
    .index("by_email", ["email_address"]),

  // Staff Permissions
  staff_permissions: defineTable({
    staff_id: v.id("staff"),      // Foreign Key to the staff table
    user_id: v.id("users"),       // The business owner ID (for multi-tenant scoping)
    permission_key: v.string(),   // The unique ID of the permission (e.g., 'p1_view', 'c1_create')
    is_enabled: v.boolean(),      // Whether this specific permission is granted
    updated_at: v.number(),       // Unix timestamp of the last change
  })
    .index("by_staff", ["staff_id"])
    .index("by_user_staff", ["user_id", "staff_id"])
    .index("by_staff_key", ["staff_id", "permission_key"]),

};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
