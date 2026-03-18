"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Leaf, MapPin, Loader2, CheckCircle2, ArrowLeft, Tractor, Store } from "lucide-react";

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
          console.error("Error:", error);
          alert("Could not get location. Enter manually.");
          setLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation not supported.");
      setLoadingLocation(false);
    }
  };

 
  const handleSubmit = async () => {
    if (!role || !address) return;
    setSubmitting(true);
    try {
      await setUserRole({ 
        role, 
        address: address,
        latitude: location?.lat,
        longitude: location?.lng,
      });
      router.push("/"); 
    } catch (error) {
      console.error("Failed:", error);
      alert("Error saving profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
   
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
  
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md text-center animate-in zoom-in-95 duration-500">
        
    
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Leaf className="text-emerald-600" size={36} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Welcome to Farmesto
        </h1>
        <p className="text-slate-500 mb-8 text-sm font-medium">
          Agri-Tech Edition for Farmers & Consumers
        </p>
        
     
        {!role && (
          <div className="space-y-4">
            <button 
              onClick={() => setRole('farmer')}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Tractor size={20} />
              Continue as Farmer
            </button>

            <button 
              onClick={() => setRole('buyer')}
              className="w-full bg-white text-slate-700 border-2 border-slate-100 py-4 rounded-xl font-bold text-base hover:bg-slate-50 hover:border-slate-200 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Store size={20} />
              Continue as Buyer
            </button>
          </div>
        )}

  
        {role && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="text-left mb-6">
              <button 
                onClick={() => setRole(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 font-medium"
              >
                <ArrowLeft size={14} /> Back
              </button>
              
              <label className="text-sm font-bold text-slate-700 block mb-2">
                {role === 'farmer' ? "Where is your farm located?" : "Delivery Address"}
              </label>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address or use GPS ->"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                />
                <button 
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 hover:bg-emerald-100 transition-colors"
                >
                  {loadingLocation ? <Loader2 className="animate-spin" size={20}/> : <MapPin size={20} />}
                </button>
              </div>
              
              {location && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium bg-emerald-50 p-2 rounded-lg inline-block">
                  <CheckCircle2 size={12} /> GPS Coordinates captured
                </p>
              )}
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!address || submitting || !isAuthenticated}
              className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                !address 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={20} /> Saving Profile...</>
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-400 font-medium">
          Protected by <span className="text-slate-600 font-bold">Clerk</span> Authentication
        </div>

      </div>
    </div>
  );
}