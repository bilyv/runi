import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// List all folders for the authenticated user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();
  },
});

// Create a new folder
export const create = mutation({
  args: {
    folder_name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if folder with the same name already exists
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("folder_name"), args.folder_name))
      .collect();

    if (existingFolders.length > 0) {
      throw new Error("A folder with this name already exists");
    }

    // Create the new folder
    return await ctx.db.insert("folders", {
      folder_id: `folder_${Date.now()}`,
      user_id: userId,
      folder_name: args.folder_name,
      file_count: 0,
      total_size: 0,
      updated_at: Date.now(),
    });
  },
});

// Update a folder
export const update = mutation({
  args: {
    id: v.id("folders"),
    folder_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;

    // Verify ownership
    const folder = await ctx.db.get(id);
    if (!folder || folder.user_id !== userId) {
      throw new Error("Folder not found or access denied");
    }

    // If updating folder name, check for duplicates
    if (updates.folder_name) {
      const existingFolders = await ctx.db
        .query("folders")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .filter((q) => 
          q.and(
            q.eq(q.field("folder_name"), updates.folder_name),
            q.neq(q.field("_id"), id)
          )
        )
        .collect();

      if (existingFolders.length > 0) {
        throw new Error("A folder with this name already exists");
      }
    }

    return await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

// Delete a folder
export const deleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.user_id !== userId) {
      throw new Error("Folder not found or access denied");
    }

    // Check if folder has files
    const files = await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folder_id", args.id))
      .collect();

    if (files.length > 0) {
      throw new Error("Cannot delete folder with files. Please move or delete files first.");
    }

    await ctx.db.delete(args.id);
  },
});