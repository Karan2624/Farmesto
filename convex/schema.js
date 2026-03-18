import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("farmer"), v.literal("buyer"))),
    phone: v.optional(v.string()), 
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]) 
    .index("by_role",["role"])
    .searchIndex("search_name", { searchField: "name" }), 


  crops: defineTable({
    cropId: v.string(), 
    userId: v.id("users"),
    name: v.string(),
    plantedDate: v.string(), 
    quantity: v.number(),
    unit: v.string(),
    isHarvested: v.boolean(),
    harvestedDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()), 
  })
    .index("by_userId", ["userId"])
    .index("by_cropId", ["cropId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"], 
    }),

  
  alerts: defineTable({
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    cropName: v.string(),
    type: v.union(v.literal("expiry"), v.literal("reminder")), 
    date: v.string(),
    note: v.optional(v.string()),
    isCompleted: v.boolean(), 
  })
    .index("by_userId", ["userId"])
    .index("by_cropId", ["cropId"]), 

    disease_outbreak: defineTable({
      reporterId : v.id("users"),
      diseaseName : v.string(),
      severity : v.string(),
      isActive : v.boolean(),
      latitude : v.number(),
      longitude : v.number(),
      detectedAt : v.string(),
  })
  .index("by_active_status",["isActive"]),
  
});

