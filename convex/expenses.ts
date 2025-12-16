import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    categoryId: v.optional(v.id("expensecategory")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let expenses;

    if (args.categoryId) {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .order("desc")
        .collect();
    } else {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    if (args.startDate || args.endDate) {
      const filteredExpenses = [];
      for (const expense of expenses) {
        if (args.startDate && expense.date < args.startDate) continue;
        if (args.endDate && expense.date > args.endDate) continue;
        filteredExpenses.push(expense);
      }
      expenses = filteredExpenses;
    }

    return expenses;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    categoryId: v.id("expensecategory"),
    amount: v.number(),
    date: v.number(),
    addedBy: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const expenseId = await ctx.db.insert("expenses", {
      userId,
      title: args.title,
      categoryId: args.categoryId,
      amount: args.amount,
      date: args.date,
      addedBy: args.addedBy || "System",
      status: args.status,
      updatedAt: now,
    });

    return expenseId;
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

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then(allExpenses => 
        allExpenses.filter(expense => expense.date >= startDate.getTime())
      );

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Get category names for expense statistics
    const categoryIds = [...new Set(expenses.map(e => e.categoryId))];
    const categories = await Promise.all(
      categoryIds.map(id => ctx.db.get(id))
    );
    
    const categoryIdToName = Object.fromEntries(
      categories.filter(Boolean).map(cat => [cat!._id, cat!.name])
    );

    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryName = categoryIdToName[expense.categoryId] || "Unknown";
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      expensesByCategory,
      count: expenses.length,
    };
  },
});

// Update an expense
export const update = mutation({
  args: {
    id: v.id("expenses"),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("expensecategory")),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    addedBy: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense) throw new Error("Expense not found");
    if (expense.userId !== userId) throw new Error("Unauthorized");

    const now = Date.now();
    const updates: any = { updatedAt: now };
    
    if (args.title !== undefined) updates.title = args.title;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.date !== undefined) updates.date = args.date;
    if (args.addedBy !== undefined) updates.addedBy = args.addedBy;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Delete an expense
export const remove = mutation({
  args: {
    id: v.id("expenses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense) throw new Error("Expense not found");
    if (expense.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
    return args.id;
  },
});
