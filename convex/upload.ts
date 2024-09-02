import { mutation } from "./_generated/server";


export const generateUploadurl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
})