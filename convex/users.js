import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

 
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();


    const name = identity.name || identity.givenName || "Anonymous";

    if (user !== null) {
     
      if (user.name !== name) {
        await ctx.db.patch(user._id, { name: name });
      }
      return user._id;
    }

    r
    return await ctx.db.insert("users", {
      name: name,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      imageUrl: identity.pictureUrl || "",
      role: undefined, 
    });
  },
});

export const assignRole = mutation({
  args: {
    
    role: v.union(v.literal("farmer"), v.literal("buyer")), 
    address: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

   
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("user not found");

    await ctx.db.patch(user._id, {
      role: args.role,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
    });
  },
});

export const getUserState = query(
  {
    args: {},
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if(!identity) return null;
      const user = await ctx.db.query("users").withIndex("by_token", (q) => 
      q.eq("tokenIdentifier",identity.tokenIdentifier)).unique();
      return user;
    },
  }
)