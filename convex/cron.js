import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();


crons.daily(
  "delete-old-outbreaks",
  { hourUTC: 0, minuteUTC: 0 },
  api.cleanup.deleteOldOutbreaks 
);

export default crons;