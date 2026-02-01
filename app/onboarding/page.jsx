"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";

export default function Onboarding() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const setUserRole = useMutation(api.users.assignRole);
  const router = useRouter();
  
  const [role, setRole] = useState(null);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null); 
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Function to get GPS Location
  const handleGetLocation = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          setAddress(`Lat: ${lat.toFixed(4)}, Long: ${lng.toFixed(4)}`); 
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get location. Please enter address manually.");
          setLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!role || !address) return;
    setSubmitting(true);
    try {
      await setUserRole({ 
        role, 
        buyerType: role === 'buyer' ? "Wholesaler" : undefined,
        address: address,
        latitude: location?.lat,
        longitude: location?.lng,
      });
      router.push("/"); 
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.firstName || "User"}!</h1>
          <p className="text-gray-500 mt-2">Let's set up your profile.</p>
        </div>
        
        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setRole("farmer")}
            className={`p-6 border-2 rounded-xl text-left transition-all ${
              role === 'farmer' ? 'bg-green-50 border-green-600 ring-1 ring-green-600' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-3">🚜</div>
            <h2 className="text-lg font-bold">I am a Farmer</h2>
            <p className="text-sm text-gray-500 mt-1">I want to sell my produce.</p>
          </button>

          <button 
            onClick={() => setRole("buyer")}
            className={`p-6 border-2 rounded-xl text-left transition-all ${
              role === 'buyer' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-3">🏪</div>
            <h2 className="text-lg font-bold">I am a Buyer</h2>
            <p className="text-sm text-gray-500 mt-1">I want to buy in bulk.</p>
          </button>
        </div>

        {/* Address & Location Section */}
        {role && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <label className="block text-sm font-medium">
              {role === 'farmer' ? "Farm Location" : "Business Location"}
            </label>
            
            <div className="flex gap-2">
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or click button ->"
                className="flex-1 p-3 border rounded-md outline-none focus:ring-2 focus:ring-black"
              />
              <Button 
                onClick={handleGetLocation} 
                disabled={loadingLocation}
                variant="outline"
                className="whitespace-nowrap"
              >
                {loadingLocation ? "Locating..." : "📍 Use GPS"}
              </Button>
            </div>
            {location && <p className="text-xs text-green-600">Location coordinates captured!</p>}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!role || !address || submitting || !isAuthenticated}
          className="w-full py-6 text-lg"
        >
          {submitting ? "Saving..." : !isAuthenticated ? "Connecting..." : "Get Started"}
        </Button>

      </div>
    </div>
  );
}