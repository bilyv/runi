import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        return await ctx.db
            .query("staff")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .order("desc")
            .collect();
    },
});

export const create = mutation({
    args: {
        staff_full_name: v.string(),
        phone_number: v.string(),
        id_card_front_url: v.string(),
        id_card_back_url: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const staffId = await ctx.db.insert("staff", {
            staff_id: `staff_${Date.now()}`,
            user_id: userId,
            staff_full_name: args.staff_full_name,
            phone_number: args.phone_number,
            id_card_front_url: args.id_card_front_url,
            id_card_back_url: args.id_card_back_url,
            password: args.password,
            failed_login_attempts: 0,
            updated_at: Date.now(),
        });

        return staffId;
    },
});

export const remove = mutation({
    args: { id: v.id("staff") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.delete(args.id);
    },
});
