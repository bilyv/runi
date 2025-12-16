import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category_id: v.optional(v.id("productcategory")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let products;

    if (args.category_id) {
      products = await ctx.db
        .query("products")
        .withIndex("by_user_and_category", (q) =>
          q.eq("user_id", userId).eq("category_id", args.category_id!)
        )
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .collect();
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower))
      );
    }

    return products;
  },
});

export const create = mutation({
  args: {
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
    expiry_date: v.string(), // Using string for date input flexibility
    days_left: v.number(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sku: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("products", {
      ...args,
      user_id: userId,
      updated_at: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    category_id: v.optional(v.id("productcategory")),
    quantity_box: v.optional(v.number()),
    quantity_kg: v.optional(v.number()),
    box_to_kg_ratio: v.optional(v.number()),
    cost_per_box: v.optional(v.number()),
    cost_per_kg: v.optional(v.number()),
    price_per_box: v.optional(v.number()),
    price_per_kg: v.optional(v.number()),
    profit_per_box: v.optional(v.number()),
    profit_per_kg: v.optional(v.number()),
    boxed_low_stock_threshold: v.optional(v.number()),
    expiry_date: v.optional(v.string()),
    days_left: v.optional(v.number()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sku: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;

    // Verify ownership
    const product = await ctx.db.get(id);
    if (!product || product.user_id !== userId) {
      throw new Error("Product not found or access denied");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

export const getLowStock = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return products.filter(p => p.quantity_box <= p.boxed_low_stock_threshold);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.id);
    if (!product || product.user_id !== userId) {
      throw new Error("Product not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// Restock a product
export const restock = mutation({
  args: {
    id: v.id("products"),
    boxes_amount: v.number(),
    kg_amount: v.number(),
    delivery_date: v.string(),
    expiry_date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.id);
    if (!product || product.user_id !== userId) {
      throw new Error("Product not found or access denied");
    }

    // Update product quantities
    const newQuantityBox = product.quantity_box + args.boxes_amount;
    const newQuantityKg = product.quantity_kg + args.kg_amount;
    
    // Calculate days left until new expiry date
    const expiryDate = new Date(args.expiry_date);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    await ctx.db.patch(args.id, {
      quantity_box: newQuantityBox,
      quantity_kg: newQuantityKg,
      expiry_date: args.expiry_date,
      days_left: daysLeft,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Record stock addition
export const recordStockAddition = mutation({
  args: {
    addition_id: v.string(),
    product_id: v.id("products"),
    boxes_added: v.number(),
    kg_added: v.number(),
    total_cost: v.number(),
    delivery_date: v.string(),
    status: v.string(),
    performed_by: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("stock_additions", {
      ...args,
      user_id: userId,
      updated_at: Date.now(),
    });
  },
});

// Record stock correction
export const recordStockCorrection = mutation({
  args: {
    correction_id: v.string(),
    product_id: v.id("products"),
    box_adjustment: v.number(),
    kg_adjustment: v.number(),
    status: v.string(),
    performed_by: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("stock_corrections", {
      ...args,
      user_id: userId,
      updated_at: Date.now(),
    });
  },
});

// Record damaged product
export const recordDamagedProduct = mutation({
  args: {
    damage_id: v.string(),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("damaged_products", {
      ...args,
      user_id: userId,
      updated_at: Date.now(),
    });
  },
});

// Record stock movement
export const recordStockMovement = mutation({
  args: {
    movement_id: v.string(),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("stock_movements", {
      ...args,
      user_id: userId,
      updated_at: Date.now(),
    });
  },
});
