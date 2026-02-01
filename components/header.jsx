"use client";

import { BarLoader } from "react-spinners";
import useStoreUser from "@/hooks/use-store-user";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export const Header = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getUserState);
  
  // Keep your existing user sync hook
  useStoreUser();

  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. App Logo / Name (Added so 'justify-between' works correctly) */}
        <div className="font-bold text-xl tracking-tight">
          <Link href="/">FARMESTO</Link>
        </div>

        {/* 2. Middle Section: Dynamic Links based on Role */}
        {isAuthenticated && user?.role && (
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            
            {/* Common Link */}
            <Link href="/" className="hover:text-black transition-colors">Home</Link>

            {/* FARMER LINKS */}
            {user.role === "farmer" && (
              <>
                <Link href="/dashboard" className="hover:text-black transition-colors">My Farm</Link>
                <Link href="/sell" className="hover:text-black transition-colors">Sell Produce</Link>
              </>
            )}

            {/* BUYER LINKS */}
            {user.role === "buyer" && (
              <>
                <Link href="/marketplace" className="hover:text-black transition-colors">Marketplace</Link>
                <Link href="/orders" className="hover:text-black transition-colors">My Orders</Link>
              </>
            )}
          </div>
        )}

        {/* 3. Right Section: Auth Buttons (Your exact code) */}
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            {/* Optional: Show role badge next to user icon */}
            {user?.role && (
               <span className="hidden sm:inline-block text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                 {user.role === "farmer" ? "Farmer" : "Buyer"}
               </span>
            )}
            <UserButton />
          </SignedIn>
        </div>

      </nav>
      
      {/* Your exact loader */}
      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
};