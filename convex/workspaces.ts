import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

const generateCode = () => {
  const code = Array.from({ length: 6 }, () => "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 36)]).join("");

  return code;
}

export const create = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const joinCode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode
    })

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin"
    })

    return workspaceId
  }
})

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return []
    }

    const members = await ctx.db.query("members").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect();

    const workspaceIds = members.map((m) => m.workspaceId);

    const workspaces = []

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) {
        workspaces.push(workspace)
      }
    }

    return workspaces
  }
})

export const getById = query({
  args: {
    id: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();

    if (!member) {
      return null
    }

    return await ctx.db.get(args.id)
  }
})