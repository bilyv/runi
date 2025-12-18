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

// Get damaged products
export const getDamagedProducts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const damagedProducts = await ctx.db
      .query("damaged_products")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch product details for each damaged product
    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Combine damaged products with product details
    return damagedProducts.map(damaged => {
      const product = products.find(p => p._id === damaged.product_id);
      return {
        ...damaged,
        product_name: product ? product.name : "Unknown Product",
        product_category_id: product ? product.category_id : null,
      };
    });
  },
});

// Get stock movements
export const getStockMovements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const movements = await ctx.db
      .query("stock_movements")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch product details for each movement
    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Combine movements with product details
    return movements.map(movement => {
      const product = products.find(p => p._id === movement.product_id);
      return {
        ...movement,
        product_name: product ? product.name : "Unknown Product",
        product_category_id: product ? product.category_id : null,
      };
    });
  },
});

// Get restock records
export const getRestockRecords = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const restocks = await ctx.db
      .query("restock")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch product details for each restock
    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Combine restocks with product details
    return restocks.map(restock => {
      const product = products.find(p => p._id === restock.product_id);
      return {
        ...restock,
        product_name: product ? product.name : "Unknown Product",
        product_category_id: product ? product.category_id : null,
      };
    });
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

// Approve product deletion request
export const approveProductDeletion = mutation({
  args: { 
    movement_id: v.string(),
    product_id: v.id("products") 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Update the stock movement status to completed
    const movement = await ctx.db.query("stock_movements")
      .withIndex("by_user", q => q.eq("user_id", userId))
      .filter(q => q.eq(q.field("movement_id"), args.movement_id))
      .unique();
      
    if (!movement) {
      throw new Error("Deletion request not found");
    }

    await ctx.db.patch(movement._id, {
      status: "completed",
      updated_at: Date.now(),
    });

    // Delete the product
    const product = await ctx.db.get(args.product_id);
    if (product && product.user_id === userId) {
      await ctx.db.delete(args.product_id);
    }
    
    return args.product_id;
  },
});

// Reject product deletion request
export const rejectProductDeletion = mutation({
  args: { 
    movement_id: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Update the stock movement status to rejected
    const movement = await ctx.db.query("stock_movements")
      .withIndex("by_user", q => q.eq("user_id", userId))
      .filter(q => q.eq(q.field("movement_id"), args.movement_id))
      .unique();
      
    if (!movement) {
      throw new Error("Deletion request not found");
    }

    await ctx.db.patch(movement._id, {
      status: "rejected",
      updated_at: Date.now(),
    });
    
    return args.movement_id;
  },
});

// Approve product edit request
export const approveProductEdit = mutation({
  args: { 
    movement_id: v.string(),
    product_id: v.id("products") 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the stock movement
    const movement = await ctx.db.query("stock_movements")
      .withIndex("by_user", q => q.eq("user_id", userId))
      .filter(q => q.eq(q.field("movement_id"), args.movement_id))
      .unique();
      
    if (!movement) {
      throw new Error("Edit request not found");
    }

    // Get the product
    const product = await ctx.db.get(args.product_id);
    if (!product || product.user_id !== userId) {
      throw new Error("Product not found or access denied");
    }

    // Prepare update object based on the field changed
    const updateObj: any = {};
    
    switch (movement.field_changed) {
      case 'name':
        updateObj.name = typeof movement.new_value === 'string' ? movement.new_value : movement.new_value.toString();
        break;
      case 'box_to_kg_ratio':
        // Ensure we're working with numbers
        const boxToKgRatio = typeof movement.new_value === 'number' ? movement.new_value : parseFloat(movement.new_value as string) || 0;
        updateObj.box_to_kg_ratio = boxToKgRatio;
        // Recalculate derived values
        updateObj.cost_per_kg = product.cost_per_box / boxToKgRatio;
        updateObj.price_per_kg = product.price_per_box / boxToKgRatio;
        updateObj.profit_per_kg = updateObj.price_per_kg - updateObj.cost_per_kg;
        break;
      case 'cost_per_box':
        // Ensure we're working with numbers
        const costPerBox = typeof movement.new_value === 'number' ? movement.new_value : parseFloat(movement.new_value as string) || 0;
        updateObj.cost_per_box = costPerBox;
        // Recalculate derived values
        updateObj.cost_per_kg = costPerBox / product.box_to_kg_ratio;
        updateObj.profit_per_box = product.price_per_box - costPerBox;
        updateObj.profit_per_kg = product.price_per_kg - updateObj.cost_per_kg;
        break;
      case 'price_per_box':
        // Ensure we're working with numbers
        const pricePerBox = typeof movement.new_value === 'number' ? movement.new_value : parseFloat(movement.new_value as string) || 0;
        updateObj.price_per_box = pricePerBox;
        // Recalculate derived values
        updateObj.price_per_kg = pricePerBox / product.box_to_kg_ratio;
        updateObj.profit_per_box = pricePerBox - product.cost_per_box;
        updateObj.profit_per_kg = updateObj.price_per_kg - product.cost_per_kg;
        break;
    }

    // Update the product
    await ctx.db.patch(args.product_id, {
      ...updateObj,
      updated_at: Date.now(),
    });

    // Update the stock movement status to completed
    await ctx.db.patch(movement._id, {
      status: "completed",
      updated_at: Date.now(),
    });
    
    return args.product_id;
  },
});

// Reject product edit request
export const rejectProductEdit = mutation({
  args: { 
    movement_id: v.string(),
    rejection_reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Update the stock movement status to rejected
    const movement = await ctx.db.query("stock_movements")
      .withIndex("by_user", q => q.eq("user_id", userId))
      .filter(q => q.eq(q.field("movement_id"), args.movement_id))
      .unique();
      
    if (!movement) {
      throw new Error("Edit request not found");
    }

    // Update the stock movement status to rejected
    const updateData: any = {
      status: "rejected",
      updated_at: Date.now(),
    };

    // Append rejection reason if provided
    if (args.rejection_reason) {
      updateData.reason = `${movement.reason} (Rejected: ${args.rejection_reason})`;
    }

    await ctx.db.patch(movement._id, updateData);
    
    return args.movement_id;
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

    // Record the stock movement
    await ctx.db.insert("stock_movements", {
      movement_id: `movement_${Date.now()}`,
      user_id: userId,
      product_id: args.id,
      movement_type: "restock",
      box_change: args.boxes_amount,
      kg_change: args.kg_amount,
      old_value: product.quantity_box,
      new_value: newQuantityBox,
      reason: `Restocked ${args.boxes_amount} boxes and ${args.kg_amount} kg`,
      status: "completed",
      performed: "User", // In a real app, this would be the actual user
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Record restock
export const recordRestock = mutation({
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

    return await ctx.db.insert("restock", {
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
