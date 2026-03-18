import { api } from "../convex/_generated/api";
import { inngest } from "./client";
import { Resend } from 'resend';
import { fetchMutation, fetchQuery } from "convex/nextjs";

const resend = new Resend(process.env.RESEND_API_KEY);
// Helper function: Haversine Formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export const sendOutBreakAlerts = inngest.createFunction(
  {id : "send-outbreak-alerts"},
  {event : "farmesto/outbreak.detected"},
  async ({event,step}) => {
    const {reporterClerkId,diseaseName,prevention,severity,symptoms,originatorLat,originatorLng,radiusKm} = event.data;
    const allFarmers = await step.run("fetch-farmers",async () => {
      return await fetchQuery(api.users.getAllFarmers);
    });
    await step.run("log-outbreak-to-db",async () => {
      return await fetchMutation(api.outbreak.createOutbreak,{
        clerkId : reporterClerkId,
        diseaseName,
        severity,
        latitude: originatorLat,
        longitude: originatorLng,
        detectedAt: new Date().toISOString(),
        isActive: true,
      });
    })

    const farmersInDanger = allFarmers.filter(farmer => {
      if(!farmer.latitude || !farmer.longitude || farmer.tokenIdentifier==reporterClerkId) return false;
      const distance = calculateDistance(farmer.latitude,farmer.longitude,originatorLat,originatorLng);
      return distance<=radiusKm;
    })
    if(farmersInDanger.length===0) return {alertedCount :0};
    const preventionHtml = prevention?.map(tip => `<li style="margin-bottom: 5px;">${tip}</li>`).join('') || "<li>Check your dashboard for prevention tips.</li>";
    const symptomsHtml = symptoms?.map(symp => `<li style="margin-bottom: 5px;">${symp}</li>`).join('') || "";

    // Step 4: Send Bulk Emails via Resend
    await step.run("send-warning-emails", async () => {
       const emails = farmersInDanger.map(f => f.email);
       
       await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: emails, 
          subject: `🚨 Urgent Farmesto Alert: ${diseaseName} Outbreak Nearby`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Community Outbreak Warning</h2>
              </div>
              
              <div style="padding: 20px; background-color: #f8fafc; color: #334155;">
                <p style="font-size: 16px;">A high-severity case of <b>${diseaseName}</b> was just detected within <b>${radiusKm}km</b> of your registered farm location.</p>
                
                <h3 style="color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px;">What to look out for (Symptoms):</h3>
                <ul style="color: #475569;">
                  ${symptomsHtml}
                </ul>

                <h3 style="color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px;">Immediate Prevention Steps:</h3>
                <ul style="color: #475569;">
                  ${preventionHtml}
                </ul>

              </div>
            </div>
          `
       });
    });
    return {alertedCount : farmersInDanger.length};
  }
)

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);