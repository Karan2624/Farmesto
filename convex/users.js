import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // THE FIX: Use identity.subject to get the clean "user_..." ID
    const cleanClerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", cleanClerkId) 
      )
      .unique();

    const name = identity.name || identity.givenName || "Anonymous";

    if (user !== null) {
      if (user.name !== name) {
        await ctx.db.patch(user._id, { name: name });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: name,
      tokenIdentifier: cleanClerkId, // Clean ID saved here
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

    // THE FIX: Clean ID lookup
    const cleanClerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", cleanClerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        role: args.role,
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
      });
    } else {
      await ctx.db.insert("users", {
        name: identity.name || "Anonymous",
        tokenIdentifier: cleanClerkId, // Clean ID saved here
        email: identity.email,
        imageUrl: identity.pictureUrl || "",
        role: args.role,
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
      });
    }
  },
});

export const getUserState = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    // THE FIX: Clean ID lookup
    const cleanClerkId = identity.subject; 
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", cleanClerkId)
      )
      .unique();
      
    return user;
  },
});

export const getAllFarmers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "farmer"))
      .collect();
  }
});