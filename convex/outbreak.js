import { v } from "convex/values";
import { mutation } from "./_generated/server";


export const createOutbreak = mutation({
    args:{
        clerkId : v.string(),
        diseaseName: v.string(),
        severity: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        detectedAt: v.string(),
        isActive: v.boolean(),
    },
    handler: async(ctx,args) => {
        const user = await ctx.db.query("users").withIndex("by_token",(q) => q.eq("tokenIdentifier",args.clerkId)).unique();
        if(!user) throw new Error("User not found");
        return await ctx.db.insert("disease_outbreak",{
            reporterId : user._id,
            diseaseName : args.diseaseName,
            severity : args.severity,
            latitude : args.latitude,
            longitude : args.longitude,
            detectedAt : args.detectedAt,
            isActive : args.isActive,
        });
    },
});


