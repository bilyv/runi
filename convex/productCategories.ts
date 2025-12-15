import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new product category
export const create = mutation({
    args: {
        category_name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Check if category already exists for this user
        const existing = await ctx.db
            .query("productcategory")
            .withIndex("by_user_and_name", (q) =>
                q.eq("user_id", userId).eq("category_name", args.category_name)
            )
            .first();

        if (existing) {
            throw new Error("Category already exists");
        }

        const now = Date.now();
        const categoryId = await ctx.db.insert("productcategory", {
            user_id: userId,
            category_name: args.category_name,
            updated_at: now,
        });

        return categoryId;
    },
});

// List all categories for the current user
export const list = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        const categories = await ctx.db
            .query("productcategory")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        return categories;
    },
});

// Update a category
export const update = mutation({
    args: {
        id: v.id("productcategory"),
        category_name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const category = await ctx.db.get(args.id);
        if (!category) {
            throw new Error("Category not found");
        }

        if (category.user_id !== userId) {
            throw new Error("Unauthorized");
        }

        const now = Date.now();
        await ctx.db.patch(args.id, {
            category_name: args.category_name,
            updated_at: now,
        });

        return args.id;
    },
});

// Delete a category
export const remove = mutation({
    args: {
        id: v.id("productcategory"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const category = await ctx.db.get(args.id);
        if (!category) {
            throw new Error("Category not found");
        }

        if (category.user_id !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});
