import { mutation } from "./_generated/server";

export const deleteOldOutbreaks = mutation({
    args : {},
    handler : async(ctx) => {
        const now = Date.now();
        const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

        const allOutbreak = await ctx.db.query("disease_outbreak").collect();
        let deletedCount = 0;
        for(const outBreak of allOutbreak){
            const outBreakDate = new Date(outBreak.detectedAt).getTime();
            if(now-outBreakDate >=TEN_DAYS_MS){
                
                await ctx.db.delete(outBreak._id);
                deletedCount++;
            }
        }
        return deletedCount;
    }
});