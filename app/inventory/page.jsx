"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Calendar, Package, Plus, Search, Sprout, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SHELF_LIFE_DB = {
  "Tomato": 15, "Potato": 90, "Onion": 60, "Spinach": 5,
  "Rice": 365, "Wheat":365, "Carrot": 30, "Chilli":20,
};

export default function Inventory() {
  const [searchTerm,setSearchTerm] = useState("");
  const [isAdding,setIsAdding] = useState(false);
  const [isSubmitting,setIsSumbmitting] = useState(false);

  const[formData, setFormData] = useState({
    isHarvested : false,
    name: "",
    unit : "kg",
    quantity : "",
    plantedDated : new Date().toISOString().split('T')[0],
    expiryDate : "",
    enableExpiry : false,
    enableReminder : false,
    reminderDate: "",
    reminderNote: "",
  });

  const [reminderModal,setReminderModal] = useState(null);
  const [reminderForm,setReminderForm] = useState({date: "",note:""});

  const cropsData = useQuery(api.inventory.getMyInventory,{search : searchTerm});
  const alerts = useQuery(api.inventory.getMyalerts);

  const addCropMutation = useMutation(api.inventory.addCrop);
  const markHarvestedMutation = useMutation(api.inventory.markHarvested);
  const updateQuantityMutation = useMutation(api.inventory.updateQuantity);
  const deleteCropMutation = useMutation(api.inventory.deleteCrop);
  const createAlertMutation = useMutation(api.inventory.createAlert);
  const deleteAlertMutation = useMutation(api.inventory.deleteAlert);



  return (
    <div className="min-h-screen bg-[#110d14] p-4 md:p-8 font-sans pb-20">
      {/*HEADER:*/}
      <div className="w-full mx-auto mb-8 bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        <div className="w-full md:w-auto">

          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 hover:text-white transition-colors">
            <ArrowLeft size={12} strokeWidth={3} /> Back to Dashboard
          </Link>
        

            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3.5 rounded-2xl text-emerald-400 ring-1 ring-slate-700 shadow-inner">
                <Package size={28} strokeWidth={2.5} />
              </div>
              <div >
                <h1 className="text-3xl font-black text-white tracking-tight">
                  My <span className="text-emerald-400">Inventory</span>
                </h1>
              </div>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="group relative w-full md:w-72">
            <Search className="text-slate-400 left-4 top-1/2 absolute -translate-y-1/2 group-focus-within:text-emerald-400 transition-colors" size={18}/>
            <input type="text" placeholder="Search crops..." 
            value={searchTerm}
            className="rounded-xl w-full bg-slate-950 h-12 border border-slate-700 text-sm pl-11 pr-4 font-bold text-white placeholder:text-slate-500 focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className={`h-12 px-4 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 whitespace-nowrap border ${
                isAdding 
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white' 
                  : 'bg-[#10B981] text-white border-transparent hover:bg-[#059669]' 
              }`}>
            {isAdding ? "Close" : <><Plus size={20} strokeWidth={2} /> Add New</>}
          </button>
        </div>
      </div>

      {/*ALERTS SECTION */}
     <div className="w-full mx-auto space-y-8 mb-4.5">
        {alerts && alerts.length > 0 && (
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col gap-4 relative overflow-hidden animate-in fade-in">
            
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider relative z-10">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </div>
              Attention Required
            </h3>

            <div className="flex gap-5 overflow-x-auto pb-4 pt-2 custom-scrollbar relative z-10">
              {alerts.map(alert => (
      
                <div key={alert._id} className="min-w-[300px] bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 relative group transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.type === 'expiry' ? 'bg-gradient-to-b from-red-500 to-red-700' : 'bg-gradient-to-b from-blue-500 to-blue-700'}`}></div>
                  
                  <div className="flex justify-between items-start pl-3">
                    <div className="flex items-center gap-2 mb-2">
                       
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border bg-slate-900/50 ${alert.type === 'expiry' ? 'text-red-400 border-red-900/50' : 'text-blue-400 border-blue-900/50'}`}>
                         {alert.type}
                       </span>
                    </div>
                    <button onClick={() => deleteAlertMutation({alertId: alert._id})} className="text-slate-500 hover:text-red-400 transition-colors p-1"><X size={16} /></button>
                  </div>

                  <div className="pl-3 mt-1">
             
                    <h4 className="text-lg font-black text-white leading-tight">{alert.cropName}</h4>
                    <p className="text-sm text-slate-400 font-medium mt-1 leading-snug">{alert.note}</p>

                    <div className={`mt-4 flex items-center gap-2 text-xs font-bold w-fit px-3 py-1.5 rounded-full bg-slate-900/50 border ${alert.type === 'expiry' ? 'text-red-400 border-red-900/30' : 'text-blue-400 border-blue-900/30'}`}>
                       <Calendar size={12} className={alert.type === 'expiry' ? 'text-red-500' : 'text-blue-500'}/> 
                       <span>Due: {alert.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isAdding && (
        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl border border-slate-800 animate-in slide-in-from-top-4 fade-in">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sprout className="text-emerald-400" /> New Inventory Entry</h2>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                 <label className="text-slate-400 text-xs font-bold uppercase ml-1">Crop Name</label>
                 <input type="text" list="cropSuggestions" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600" placeholder="e.g. Tomato" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} autoFocus />
                 <datalist id="cropSuggestions" >{Object.keys(SHELF_LIFE_DB).map(crop => <option key={crop} value={crop} />)}</datalist>
                </div>
                <div className="md:col-span-4">
                  <label className="text-slate-400 text-xs font-bold uppercase ml-1" >Quantity</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600 " placeholder="0" value={formData.quantity} onChange={(e) => setFormData({...formData,quanitity: e.target.value})} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-slate-400 text-xs font-bold uppercase ml-1">Unit</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl  px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600" value={formData.unit} onChange={(e) => setFormData({...formData,unit: e.target.value})}>
                    <option value="kg">kg</option><option value="ton">ton</option><option value="pcs">pcs</option><option value="quintal">qt</option>
                  </select>

                </div>
              </div>
              
            </form>
        </div>
      )}
    </div>
  )
}