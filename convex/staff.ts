import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
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

export const checkEmailExists = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const staff = await ctx.db
            .query("staff")
            .withIndex("by_email", (q) => q.eq("email_address", args.email))
            .unique();
        return !!staff;
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
    args: {
        staff_full_name: v.string(),
        email_address: v.string(),
        phone_number: v.string(),
        id_card_front_url: v.string(),
        id_card_back_url: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if email already exists
        const existing = await ctx.db
            .query("staff")
            .withIndex("by_email", (q) => q.eq("email_address", args.email_address))
            .unique();
        if (existing) throw new Error("Staff member with this email already exists");

        const staffId = await ctx.db.insert("staff", {
            staff_id: `staff_${Date.now()}`,
            user_id: userId,
            staff_full_name: args.staff_full_name,
            email_address: args.email_address,
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

export const getStorageUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

export const remove = mutation({
    args: { id: v.id("staff") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Fetch staff record to get storage IDs
        const staff = await ctx.db.get(args.id);
        if (!staff || staff.user_id !== userId) {
            throw new Error("Staff member not found or access denied");
        }

        const storageIds = [staff.id_card_front_url, staff.id_card_back_url];

        for (const storageId of storageIds) {
            if (!storageId) continue;

            // Find file record by storageId
            const file = await ctx.db
                .query("files")
                .withIndex("by_user", (q) => q.eq("user_id", userId))
                .filter((q) => q.eq(q.field("storage_id"), storageId))
                .first();

            if (file) {
                // Delete from storage
                try {
                    await ctx.storage.delete(storageId as any);
                } catch (e) {
                    console.error(`Failed to delete storage object ${storageId}:`, e);
                }

                // Update folder stats if file was in a folder
                if (file.folder_id) {
                    const folder = await ctx.db.get(file.folder_id);
                    if (folder) {
                        await ctx.db.patch(file.folder_id, {
                            file_count: Math.max(0, folder.file_count - 1),
                            total_size: Math.max(0, folder.total_size - file.file_size),
                            updated_at: Date.now(),
                        });
                    }
                }

                // Delete the file record
                await ctx.db.delete(file._id);
            } else {
                // If no file record, at least try to delete from storage if it looks like a valid storage ID
                try {
                    await ctx.storage.delete(storageId as any);
                } catch (e) {
                    // Ignore errors if it's not a valid storage ID or already deleted
                }
            }
        }

        await ctx.db.delete(args.id);
    },
});

export const toggleActiveStatus = mutation({
    args: { id: v.id("staff") },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.id);
        if (!staff) throw new ConvexError("Staff not found");

        const newStatus = !(staff.is_active ?? true); // Default to true if undefined

        const updates: any = {
            is_active: newStatus,
        };

        // If deactivating, clear session to force logout
        if (!newStatus) {
            updates.session_token = undefined;
            updates.session_expiry = undefined;
        }

        await ctx.db.patch(args.id, updates);
        return newStatus;
    },
});

export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedEmail = args.email.trim().toLowerCase();

        // Find staff by email
        const staff = await ctx.db
            .query("staff")
            .withIndex("by_email", (q) => q.eq("email_address", normalizedEmail))
            .unique();

        if (!staff) {
            throw new ConvexError("Invalid email or password");
        }

        // Check active status
        if (staff.is_active === false) {
            throw new ConvexError("Your account has been deactivated by the administrator for a certain reason. Please contact the administrator.");
        }

        // Verify password
        if (staff.password !== args.password) {
            // Update failed attempts
            await ctx.db.patch(staff._id, {
                failed_login_attempts: (staff.failed_login_attempts ?? 0) + 1,
            });
            throw new ConvexError("Invalid email or password");
        }

        // Reset failed attempts on successful login and create session
        const sessionToken = crypto.randomUUID();
        const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        await ctx.db.patch(staff._id, {
            failed_login_attempts: 0,
            session_token: sessionToken,
            session_expiry: sessionExpiry,
            updated_at: Date.now(),
        });

        // Safe return (exclude password)
        const { password, ...staffData } = staff;
        return { ...staffData, session_token: sessionToken };
    },
});

export const validateSession = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const staff = await ctx.db
            .query("staff")
            .withIndex("by_email") // We can't query by token efficiently without an index, checking all matches or adding index is better. For now, filter.
            .filter((q) => q.eq(q.field("session_token"), args.token))
            .first();

        if (!staff) return null;

        if (staff.session_expiry && staff.session_expiry < Date.now()) {
            return null; // Expired
        }

        const { password, ...staffData } = staff;
        return staffData;
    },
});

export const logout = mutation({
    args: { id: v.id("staff") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            session_token: undefined,
            session_expiry: undefined,
        });
    },
});
