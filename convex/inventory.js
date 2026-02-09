import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateCropId(name) {
  const prefix = name.slice(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${suffix}`;
}

export const addCrop = mutation({
  args: {
    name: v.string(),
    plantedDate: v.string(),
    expiryDate: v.optional(v.string()),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const autoId = generateCropId(args.name);

    const cropId = await ctx.db.insert("crops", {
      userId: user._id,
      cropId: autoId,
      expiryDate: args.expiryDate,
      plantedDate: args.plantedDate,
      unit: args.unit,
      isHarvested: false,
      name: args.name,
      quantity: args.quantity,
    });

    return cropId;
  },
});

export const updateQuantity = mutation({
  args: {
    cropId: v.id("crops"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const crop = await ctx.db.get(args.cropId);
    if (!crop) throw new Error("Crop not found");

    const newQuantity = crop.quantity + args.amount;

    if (newQuantity <= 0) {
      const alerts = await ctx.db
        .query("alerts")
        .withIndex("by_cropId", (q) => q.eq("cropId", args.cropId))
        .collect();

      for (const alert of alerts) {
        await ctx.db.delete(alert._id);
      }

      await ctx.db.delete(args.cropId);
    } else {
      await ctx.db.patch(args.cropId, { quantity: newQuantity });
    }
  },
});

export const deleteCrop = mutation({
  args: { cropId: v.id("crops") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_cropId", (q) => q.eq("cropId", args.cropId))
      .collect();

    for (const alert of alerts) {
      await ctx.db.delete(alert._id);
    }

    await ctx.db.delete(args.cropId);
  },
});

export const markHarvested = mutation({
  args: { cropId: v.id("crops") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cropId, {
      isHarvested: true,
      harvestedDate: new Date().toISOString().split("T")[0],
    });
  },
});

export const getMyInventory = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    const allCrops = await ctx.db
      .query("crops")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.search) {
      const term = args.search.trim().toUpperCase();
      return allCrops.filter((c) => {
        const matchesName = c.name.toUpperCase().includes(term);
        const matchesCropId = c.cropId.toUpperCase().includes(term);
        return matchesName || matchesCropId;
      });
    }

    return allCrops;
  },
});

export const createAlert = mutation({
  args : {
    cropId : v.optional(v.id("crops")),
    type : v.union(v.literal("reminder"),v.literal("expiry")),
    cropName : v.string(),
    date : v.string(),
    note : v.optional(v.string()),
  },
  handler : async(ctx,args) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) throw new Error("Unauthenticated");

    const user = await ctx.db.query("users").withIndex("by_token",(q) => q.eq("tokenIdentifier",identity.tokenIdentifier)).unique();
    if(!user) throw new Error("User not found");
    const newAlertId = await ctx.db.insert("alerts",{
      userId : user._id,
      cropId : args.cropId,
      type : args.type,
      date : args.date,
      note : args.note,
      isCompleted : false,
      cropName : args.cropName,

    });
    return newAlertId;
  }
});
export const deleteAlert = mutation({
  args: {alertId : v.id("alerts"),},
  handler: async(ctx,args) => {
    await ctx.db.delete(args.alertId);
  },
});

export const getMyalerts = query({
  args : {},
  handler : async(ctx,args) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) throw new Error("Unauthenticated");
    const user = await ctx.db.query("users").withIndex("by_token",(q) => q.eq("tokenIdentifier",identity.tokenIdentifier)).unique();
    if(!user) return [];

    const alerts = await ctx.db.query("alerts").withIndex("by_userId",(q) => q.eq("userId",user._id)).collect();

    return alerts.sort((a,b) => new Date(a.date).getTime()-new Date(b.date).getTime());

  },
});




