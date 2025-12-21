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

export const deleteSaleWithAudit = mutation({
  args: {
    saleId: v.id("sales"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.user_id !== userId) {
      throw new Error("Sale not found or access denied");
    }

    // Create audit record for deletion
    const auditRecord = {
      audit_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      sales_id: args.saleId,
      audit_type: "deletion",
      boxes_change: {
        before: sale.boxes_quantity,
        after: undefined,
      },
      kg_change: {
        before: sale.kg_quantity,
        after: undefined,
      },
      old_values: {
        boxes_quantity: sale.boxes_quantity,
        kg_quantity: sale.kg_quantity,
        payment_method: sale.payment_method,
        // Include other relevant sale fields
        box_price: sale.box_price,
        kg_price: sale.kg_price,
        total_amount: sale.total_amount,
        client_name: sale.client_name,
      },
      new_values: null,
      performed_by: userId,
      approval_status: "pending" as const,
      reason: args.reason,
      updated_at: Date.now(),
    };

    await ctx.db.insert("sales_audit", auditRecord);

    return args.saleId;
  },
});

export const listAudit = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const audits = await ctx.db
      .query("sales_audit")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .order("desc")
      .collect();

    return audits;
  },
});

export const updateAuditStatus = mutation({
  args: {
    auditId: v.id("sales_audit"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const audit = await ctx.db.get(args.auditId);
    if (!audit || audit.user_id !== userId) {
      throw new Error("Audit record not found or access denied");
    }

    // If approved, execute the change
    if (args.status === "approved") {
      switch (audit.audit_type) {
        case "quantity_change":
          // Update the sale with new quantities
          await ctx.db.patch(audit.sales_id, {
            boxes_quantity: audit.new_values.boxes_quantity,
            kg_quantity: audit.new_values.kg_quantity,
            updated_at: Date.now(),
          });
          break;

        case "payment_method_change":
          // Update the sale with new payment method
          await ctx.db.patch(audit.sales_id, {
            payment_method: audit.new_values.payment_method,
            updated_at: Date.now(),
          });
          break;

        case "deletion":
          // Delete the sale record
          await ctx.db.delete(audit.sales_id);
          break;
      }
    }

    return await ctx.db.patch(args.auditId, {
      approval_status: args.status,
      approved_by: userId,
      approved_timestamp: Date.now(),
      ...(args.reason && { approval_reason: args.reason }),
    });
  },
});

export const updateSale = mutation({
  args: {
    saleId: v.id("sales"),
    boxes_quantity: v.optional(v.number()),
    kg_quantity: v.optional(v.number()),
    payment_method: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.user_id !== userId) {
      throw new Error("Sale not found or access denied");
    }

    // Determine audit type based on what's being changed
    let auditType = "edit";
    if (args.boxes_quantity !== undefined || args.kg_quantity !== undefined) {
      auditType = "quantity_change";
    } else if (args.payment_method !== undefined) {
      auditType = "payment_method_change";
    }

    // NOTE: We do NOT update the sale immediately. 
    // The changes will be applied when the audit is approved.

    // Create audit record
    const auditRecord = {
      audit_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      sales_id: args.saleId,
      audit_type: auditType,
      boxes_change: {
        before: sale.boxes_quantity,
        after: args.boxes_quantity !== undefined ? args.boxes_quantity : sale.boxes_quantity,
      },
      kg_change: {
        before: sale.kg_quantity,
        after: args.kg_quantity !== undefined ? args.kg_quantity : sale.kg_quantity,
      },
      old_values: {
        boxes_quantity: sale.boxes_quantity,
        kg_quantity: sale.kg_quantity,
        payment_method: sale.payment_method,
      },
      new_values: {
        boxes_quantity: args.boxes_quantity !== undefined ? args.boxes_quantity : sale.boxes_quantity,
        kg_quantity: args.kg_quantity !== undefined ? args.kg_quantity : sale.kg_quantity,
        payment_method: args.payment_method !== undefined ? args.payment_method : sale.payment_method,
      },
      performed_by: userId,
      approval_status: "pending" as const,
      reason: args.reason,
      updated_at: Date.now(),
    };

    await ctx.db.insert("sales_audit", auditRecord);

    return args.saleId;
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

export const getDebtors = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch all sales that are pending or partial
    // We can't easily filter by remaining_amount > 0 in the query if we don't have an index for it
    // coupled with other filters, so we'll fetch pending/partial and filter in memory if needed.
    // Ideally, we should use an index. The schema has `by_payment_status`.

    const pendingSales = await ctx.db
      .query("sales")
      .withIndex("by_payment_status", (q) => q.eq("payment_status", "pending"))
      .collect();

    const partialSales = await ctx.db
      .query("sales")
      .withIndex("by_payment_status", (q) => q.eq("payment_status", "partial"))
      .collect();

    const allUnpaidSales = [...pendingSales, ...partialSales];

    // Group by client
    const debtorMap = new Map<string, {
      clientName: string;
      clientId: string;
      totalOwed: number;
      salesCount: number;
      lastSaleDate: number;
    }>();

    for (const sale of allUnpaidSales) {
      if (sale.remaining_amount <= 0) continue; // Should effectively be covered by status, but safety check

      const existing = debtorMap.get(sale.client_name);
      if (existing) {
        existing.totalOwed += sale.remaining_amount;
        existing.salesCount += 1;
        existing.lastSaleDate = Math.max(existing.lastSaleDate, sale.updated_at);
      } else {
        debtorMap.set(sale.client_name, {
          clientName: sale.client_name,
          clientId: sale.client_id,
          totalOwed: sale.remaining_amount,
          salesCount: 1,
          lastSaleDate: sale.updated_at,
        });
      }
    }

    return Array.from(debtorMap.values()).sort((a, b) => b.totalOwed - a.totalOwed);
  },
});

export const processDebtorPayment = mutation({
  args: {
    clientName: v.string(),
    amount: v.number(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.amount <= 0) throw new Error("Payment amount must be positive");

    // Fetch all unpaid sales for this client
    // We need to fetch by client_name. The schema has `by_client` indexed on `client_id`, 
    // but the requirement says grouping by `client_name`. 
    // Let's assume we can fetch by client_name if we scan or if we use the right index. 
    // The schema has `client_name` but no specific index on it alone? 
    // Wait, `client_id` is likely stable. 
    // The prompt says "Group the results by client_name". 
    // Ideally we should use `client_id` but let's stick to the prompt's grouping logic or use `client_id` if available.
    // The `getDebtors` returns key information.
    // Let's search sales for this client. 
    // Schema has `by_client` index on `client_id`. 
    // Schema also has `client_name`.
    // If I only have client_name from the UI, I might need to search.
    // But `getDebtors` returns `clientId`. I should probably use `clientId` if I can.
    // However, the prompt `processDebtorPayment` args in my plan involved `clientId` or `client_name`.
    // I will use `clientName` as the grouping key as requested, but to efficiently find sales, 
    // I might need to filter.
    // Actually, let's verify if `client_name` is unique or if `client_id` is the better grouping.
    // The prompt says: "client_name: The key identifier used to aggregate debts".
    // I will fetch all sales and filter by client_name to be safe with the prompt requirement,
    // OR if I strictly follow schema, I should use `client_id`.
    // Let's blindly fetch all pending/partial sales and filter by client_name for now to match the "Source of Truth" concept 
    // without relying on `client_id` consistency if the user didn't enforce it.
    // OPTIMIZATION: If `client_name` is indexed, use it. It is NOT indexed in the schema provided (only `client_id` is).
    // So I will fetch pending/partial and filter in JS. Not ideal for scale but correct for now.

    const pendingSales = await ctx.db
      .query("sales")
      .withIndex("by_payment_status", (q) => q.eq("payment_status", "pending"))
      .collect();

    const partialSales = await ctx.db
      .query("sales")
      .withIndex("by_payment_status", (q) => q.eq("payment_status", "partial"))
      .collect();

    // Filter by client name and sort by date (FIFO)
    const clientSales = [...pendingSales, ...partialSales]
      .filter(s => s.client_name === args.clientName)
      .sort((a, b) => a.updated_at - b.updated_at); // ASCENDING order (oldest first)

    let remainingPayment = args.amount;

    for (const sale of clientSales) {
      if (remainingPayment <= 0) break;

      const debt = sale.remaining_amount;
      const paymentForThisSale = Math.min(debt, remainingPayment);

      const newAmountPaid = sale.amount_paid + paymentForThisSale;
      const newRemaining = sale.total_amount - newAmountPaid;
      const newStatus = newAmountPaid >= sale.total_amount ? "completed" : "partial"; // using "completed" to match schema enum

      await ctx.db.patch(sale._id, {
        amount_paid: newAmountPaid,
        remaining_amount: newRemaining,
        payment_status: newStatus,
        updated_at: Date.now(),
      });

      remainingPayment -= paymentForThisSale;
    }

    return {
      success: true,
      remainingPayment: remainingPayment // Should be 0 if debt > payment
    };
  },
});
