import { serve } from "inngest/next";
// Use relative paths to go up 3 levels to the root inngest folder
import { inngest } from "../../../inngest/client"; 
import { sendOutBreakAlerts } from "../../../inngest/function";
// import { sendOutbreakAlerts } from "../../../inngest/function"; // Make sure this matches your exact filename!

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendOutBreakAlerts,
  ],
});