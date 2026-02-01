"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // 1. Fetch User Data
  const user = useQuery(api.users.getUserState);

  useEffect(() => {
    // Wait for authentication to load
    if (isLoading) return;

    // 2. Logic: If logged in...
    if (isAuthenticated) {
      // A. If user query has finished but returned NULL (New User) -> Go to Onboarding
      if (user === null) {
        router.push("/onboarding");
      }
      // B. If user exists but has NO role -> Go to Onboarding
      else if (user && !user.role) {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // 3. Loading State
  // We only show loading if:
  // - Auth is loading (isLoading)
  // - OR User is Logged In BUT User Data is still fetching (user === undefined)
  // Note: user === null means "Done fetching, not found", so we stop loading to let the redirect happen
  if (isLoading || (isAuthenticated && user === undefined)) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <h1 className="pt-20 text-center text-2xl font-bold">
        Welcome Back, {user?.name || "User"}!
      </h1>
      <div className="flex justify-center mt-4">
         <Button variant="destructive">Subscribe</Button>
      </div>
    </div>
  );
}