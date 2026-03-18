"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  ArrowLeft, UploadCloud, Leaf, AlertTriangle, 
  CheckCircle2, Activity, Syringe, Loader2, Info, X, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AIPlantDoctor() {
  
  const user = useQuery(api.users.getUserState);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file); 
      setDiagnosis(null); 
    }
  };


  const handleAnalyze = async () => {
    if (!imageFile) return;

    if (user === undefined) {
      alert("Still loading your profile data. Please wait a second and try again.");
      return;
    }

    const lat = user?.latitude;
    const lng = user?.longitude;

    if (!lat || !lng) {
      alert("Please update your profile with your farm's location so we can accurately track community outbreaks!");
      return;
    }

    setIsAnalyzing(true);
    setDiagnosis(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile); 
      formData.append("lat", lat);
      formData.append("lng", lng);

      const response = await fetch("/api/analyze-crop", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      
      setDiagnosis(data.diagnosis);

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Error running analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setDiagnosis(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#110d14] p-4 md:p-8 font-sans pb-20 relative">
      
  
      <div className="w-full mx-auto mb-8 bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="w-full md:w-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 hover:text-white transition-colors">
            <ArrowLeft size={12} strokeWidth={3} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3.5 rounded-2xl text-emerald-400 ring-1 ring-slate-700 shadow-inner">
                <Activity size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  AI Plant <span className="text-emerald-400">Doctor</span>
                </h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Upload a photo for instant disease detection</p>
              </div>
          </div>
        </div>
      </div>


      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 flex flex-col h-full">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <UploadCloud className="text-emerald-400" /> Upload Crop Photo
          </h2>

          <div className="flex-1 flex flex-col">
            {!selectedImage ? (
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-800/50 transition-colors rounded-[1.5rem] cursor-pointer p-10 group">
                <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Click to browse or drag image here</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">Supports JPG, PNG, WEBP. Ensure the affected area is clearly visible.</p>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </label>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="relative w-full h-[300px] md:h-[400px] rounded-[1.5rem] overflow-hidden border border-slate-700 bg-slate-950 mb-4">
                  <Image src={selectedImage} alt="Crop preview" fill className="object-contain" />
                  <button onClick={clearImage} className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-slate-800 transition-all z-20">
                    <X size={20} />
                  </button>
                </div>
                
                {!diagnosis && (
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="animate-spin" size={24} /> Analyzing via Gemini AI...</>
                    ) : (
                      <><Activity size={24} /> Run AI Diagnosis</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 flex flex-col h-full relative overflow-hidden">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 relative z-10">
            <Leaf className="text-emerald-400" /> Analysis Results
          </h2>

          {!isAnalyzing && !diagnosis && (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
               <div className="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-slate-800/50 shadow-inner">
                 <ShieldAlert size={40} className="text-slate-600" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
               <p className="text-slate-400 text-sm max-w-sm">Upload an image and run the AI diagnosis to get detailed health insights and treatment plans.</p>
             </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 animate-in fade-in">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                  <Leaf size={24} className="animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mt-6">AI is scanning...</h3>
              <p className="text-slate-400 text-sm mt-1">Cross-referencing with global plant disease database.</p>
            </div>
          )}

          {diagnosis && (
            <div className="flex-1 flex flex-col space-y-6 relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-500 overflow-y-auto pr-2 custom-scrollbar">
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shrink-0">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full ${diagnosis.severity === 'High' ? 'bg-red-500/20' : 'bg-emerald-500/10'}`}></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border flex items-center gap-1.5 ${diagnosis.severity === 'High' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-orange-900/20 text-orange-400 border-orange-900/50'}`}>
                    <AlertTriangle size={10} /> {diagnosis.severity} Severity
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-900/20 px-2 py-1 rounded-md">
                    <CheckCircle2 size={12} /> {diagnosis.confidence} Match
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white relative z-10">{diagnosis.disease}</h3>
              </div>

              <div className="space-y-3 shrink-0">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Info size={16} /> Detected Symptoms
                </h4>
                <ul className="space-y-2">
                  {diagnosis.symptoms?.map((symp, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="min-w-[6px] h-[6px] rounded-full bg-orange-500 mt-1.5"></div>
                      <span className="text-sm font-medium text-slate-300">{symp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 shrink-0">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Syringe size={16} /> Recommended Treatment
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Organic / Natural</span>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{diagnosis.treatment?.organic || "No organic data provided."}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">Chemical Option</span>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{diagnosis.treatment?.chemical || "No chemical data provided."}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 shrink-0 pb-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} /> Prevention Methods
                </h4>
                <ul className="space-y-2">
                  {diagnosis.prevention?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-1.5"></div>
                      <span className="text-sm font-medium text-slate-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}