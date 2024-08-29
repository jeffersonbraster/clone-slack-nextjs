import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

const generateCode = () => {
  const code = Array.from({ length: 6 }, () => "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 36)]).join("");

  return code;
}

export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) {
      throw new Error("Workspace não encontrada");
    }

    if (workspace.joinCode !== args.joinCode.toUpperCase()) {
      throw new Error("Código de convite inválido");
    }

    const existingMember = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();

    if (existingMember) {
      throw new Error("Você já faz parte desta workspace");
    }

    await ctx.db.insert("members", {
      userId,
      workspaceId: workspace._id,
      role: "member"
    })

    return workspace._id
  }
})

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();

    if (!member || member.role !== "admin") {
      throw new Error("Sem permissão");
    }

    const joinCode = generateCode();

    await ctx.db.patch(args.workspaceId, { joinCode })

    return args.workspaceId
  }
})

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

    await ctx.db.insert("channels", {
      name: "Geral",
      workspaceId
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

export const update = mutation({
  args: { id: v.id("workspaces"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();

    if (!member || member.role !== "admin") {
      throw new Error("Sem permissão");
    }

    await ctx.db.patch(args.id, { name: args.name })

    return args.id
  }
})

export const remove = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Sem permissão");
    }

    const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();

    if (!member || member.role !== "admin") {
      throw new Error("Sem permissão");
    }

    const [members] = await Promise.all([
      ctx.db.query("members").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect()
    ])

    for (const member of members) {
      await ctx.db.delete(member._id)
    }

    await ctx.db.delete(args.id)

    return args.id
  }
})

export const getInfoById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null
    }

    const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();

    const workspace = await ctx.db.get(args.id);

    return {
      name: workspace?.name,
      isMember: !!member
    }
  }
})