import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    payment_status: v.optional(v.union(v.literal("pending"), v.literal("partial"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let sales;

    if (args.payment_status) {
      sales = await ctx.db
        .query("sales")
        .withIndex("by_payment_status", (q) => q.eq("payment_status", args.payment_status!))
        .order("desc")
        .collect();
    } else {
      sales = await ctx.db.query("sales").order("desc").collect();
    }

    return sales;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Update product quantities
    const product = await ctx.db.get(args.product_id);
    if (product) {
      await ctx.db.patch(args.product_id, {
        quantity_box: Math.max(0, product.quantity_box - args.boxes_quantity),
        quantity_kg: Math.max(0, product.quantity_kg - args.kg_quantity)
      });
    }

    return await ctx.db.insert("sales", {
      ...args,
    });
  },
});

export const addPayment = mutation({
  args: {
    saleId: v.id("sales"),
    amount: v.number(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("Sale not found");

    const newAmountPaid = sale.amount_paid + args.amount;
    const newRemainingAmount = sale.total_amount - newAmountPaid;
    const newStatus = newAmountPaid >= sale.total_amount ? "completed" : 
                     newAmountPaid > 0 ? "partial" : "pending";

    return await ctx.db.patch(args.saleId, {
      amount_paid: newAmountPaid,
      remaining_amount: newRemainingAmount,
      payment_status: newStatus,
    });
  },
});

export const deleteSale = mutation({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sale = await ctx.db.get(args.id);
    if (!sale || sale.user_id !== userId) {
      throw new Error("Sale not found or access denied");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getStats = query({
  args: {
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = new Date();
    let startDate: Date;

    switch (args.period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const sales = await ctx.db
      .query("sales")
      .collect();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount_paid, 0);

    return {
      totalSales,
      totalRevenue,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  },
});
