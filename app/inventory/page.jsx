"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Plus, Sprout, Package, CheckCircle2, Clock, 
  ArrowLeft, Loader2, Calendar, Bell, Trash2, 
  BellPlus, X, Minus, Search, Copy, AlertTriangle,
  Wheat, CheckSquare, Loader
} from "lucide-react";
import Link from "next/link";

const SHELF_LIFE_DB = {
  "Tomato": 15, "Potato": 90, "Onion": 60, "Spinach": 5,
  "Rice": 365, "Wheat": 365, "Carrot": 30, "Chilli": 20,
};

export default function Inventory() {

  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [formData, setFormData] = useState({
    isHarvested: false,
    name: "", 
    unit: "kg", 
    quantity: "", 
    plantedDate: new Date().toISOString().split('T')[0],
    expiryDate: "", 
    enableExpiry: false,
    enableReminder: false,
    reminderDate: "",
    reminderNote: ""
  });

  const [reminderModal, setReminderModal] = useState(null);
  const [reminderForm, setReminderForm] = useState({ date: "", note: "" });


  const cropsData = useQuery(api.inventory.getMyInventory, { search: searchTerm });
  const alerts = useQuery(api.inventory.getMyalerts);

  const addCropMutation = useMutation(api.inventory.addCrop);
  const markHarvestedMutation = useMutation(api.inventory.markHarvested);
  const updateQuantityMutation = useMutation(api.inventory.updateQuantity);
  const deleteCropMutation = useMutation(api.inventory.deleteCrop);
  const createAlertMutation = useMutation(api.inventory.createAlert);
  const deleteAlertMutation = useMutation(api.inventory.deleteAlert);

  // --- EFFECT: Auto-Calculate Expiry Date ---
  useEffect(() => {
    if (formData.enableExpiry && formData.name) {
      const shelfLife = SHELF_LIFE_DB[formData.name];
      if (shelfLife && formData.plantedDate) {
        const planted = new Date(formData.plantedDate);
        const expiry = new Date(planted);
        expiry.setDate(planted.getDate() + shelfLife);
        setFormData(prev => ({ ...prev, expiryDate: expiry.toISOString().split('T')[0] }));
      }
    }
  }, [formData.name, formData.plantedDate, formData.enableExpiry]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) return;
    setIsSubmitting(true);

    try {
      const newCropId = await addCropMutation({
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        plantedDate: formData.plantedDate,
        unit: formData.unit,
        expiryDate: formData.enableExpiry ? formData.expiryDate : undefined,
      });

      if (formData.isHarvested) {
        await markHarvestedMutation({ cropId: newCropId });
      }
      
      if (formData.enableReminder && formData.reminderDate) {
        await createAlertMutation({
          cropId: newCropId,
          cropName: formData.name,
          note: formData.reminderNote || "Custom Reminder",
          date: formData.reminderDate,
          type: "reminder",
        });
      }

      if (formData.enableExpiry && formData.expiryDate) {
        await createAlertMutation({
          cropId: newCropId,
          cropName: formData.name,
          type: "expiry",
          date: formData.expiryDate,
          note: "Shelf life expires today",
        });
      }

      console.log(formData);
      setFormData({
        name: "", quantity: "", unit: "kg", plantedDate: new Date().toISOString().split('T')[0],
        isHarvested: false, enableExpiry: false, expiryDate: "",
        enableReminder: false, reminderDate: "", reminderNote: ""
      });
      setIsAdding(false);
      
    } catch (err) {
      alert("Error adding crop: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReduceStock = async (crop) => {
    if (crop.quantity <= 1) {
      if (confirm(`Stock will be zero. This will delete ${crop.name} from your inventory. Continue?`)) {
        await updateQuantityMutation({ cropId: crop._id, amount: -1 });
      }
    } else {
      await updateQuantityMutation({ cropId: crop._id, amount: -1 });
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderForm.date || !reminderModal) return;
    try {
      await createAlertMutation({
        cropName: reminderModal.name,
        cropId: reminderModal._id,
        date: reminderForm.date,
        note: reminderForm.note || "General Reminder",
        type: "reminder",
      });
      setReminderModal(null);
      setReminderForm({ date: "", note: "" });
    } catch (err) {
      alert("Failed to add reminder: " + err.message);
    }
  };

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
              <div>
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
      <div className="w-full mx-auto space-y-8 mb-8">
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
        <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl border border-slate-800 animate-in slide-in-from-top-4 fade-in mb-8 w-full mx-auto">
            <div className="mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sprout className="text-emerald-400" /> New Inventory Entry</h2>
            </div>
            <form onSubmit={handleAdd}  className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                 <label className="text-slate-400 text-xs font-bold uppercase ml-1">Crop Name</label>
                 <input type="text" list="cropSuggestions" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600" placeholder="e.g. Tomato" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} autoFocus />
                 <datalist id="cropSuggestions" >{Object.keys(SHELF_LIFE_DB).map(crop => <option key={crop} value={crop} />)}</datalist>
                </div>
                <div className="md:col-span-4">
                  <label className="text-slate-400 text-xs font-bold uppercase ml-1" >Quantity</label>
                  <input type="number" required min="1" step="0.01" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600 " placeholder="0" value={formData.quantity} onChange={(e) => setFormData({...formData,quantity: e.target.value})} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-slate-400 text-xs font-bold uppercase ml-1">Unit</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl  px-4 py-3 mt-1 outline-none focus:border-emerald-500 focus:ring-emerald-500/50 transition-all font-semibold text-white placeholder:text-slate-600" value={formData.unit} onChange={(e) => setFormData({...formData,unit: e.target.value})}>
                    <option value="kg">kg</option><option value="ton">ton</option><option value="pcs">pcs</option><option value="quintal">qt</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-800 h-px my-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase ml-1">Planted Date</label>
                  <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:border-emerald-500 transition-all font-semibold text-white" value={formData.plantedDate} onChange={e => setFormData({...formData, plantedDate: e.target.value})} />
                </div>
                <div className="flex flex-col justify-center bg-slate-800 p-4 rounded-xl border border-slate-700 mt-6 md:mt-0">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.isHarvested ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          <Wheat size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">Already Harvested?</p>
                          <p className="text-xs text-slate-400">Mark this crop as fully harvested</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-emerald-500 cursor-pointer" checked={formData.isHarvested} onChange={e => setFormData({...formData, isHarvested: e.target.checked})} />
                    </label>
                </div>
              </div>
              <div className="bg-orange-900/10 p-5 rounded-2xl border border-orange-500/20 space-y-4">
                 <h3 className="text-sm font-bold text-orange-200 flex items-center gap-2"><Bell size={16} className="text-orange-500"/> Configure Alerts</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm">
                        <label className="flex items-center gap-2 mb-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-red-500" checked={formData.enableExpiry} onChange={e => setFormData({...formData, enableExpiry: e.target.checked})} />
                          <span className="text-sm font-bold text-white">Track Expiry</span>
                        </label>
                        {formData.enableExpiry && (
                          <input type="date" required={formData.enableExpiry} className="w-full bg-slate-900 border border-red-900/50 rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-red-500 text-white" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                        )}
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm">
                       <label className="flex items-center gap-2 mb-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={formData.enableReminder} onChange={e => setFormData({...formData, enableReminder: e.target.checked})} />
                          <span className="text-sm font-bold text-white">Set Custom Reminder</span>
                        </label>
                        {formData.enableReminder && (
                          <div className="space-y-2">
                            <input type="date" required={formData.enableReminder} className="w-full bg-slate-900 border border-blue-900/50 rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-blue-500 text-white" value={formData.reminderDate} onChange={(e) => setFormData({...formData,reminderDate:e.target.value})} /> 
                            <input type="text" className="w-full bg-slate-900 border border-blue-900/50 rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-blue-500 text-white placeholder:text-slate-600 " placeholder="note.." value={formData.reminderNote} onChange={(e) => setFormData({...formData,reminderNote:e.target.value})} />
                          </div>
                        )}
                    </div>
                 </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="text-white w-full bg-emerald-600 font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 text-lg">
                {isSubmitting ? <Loader className="animate-spin" /> : <><CheckSquare size={20} />Save Crop</>}
              </button>
            </form>
        </div>
      )}
      
      {/* Inventory */}
      {!cropsData ?  (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-500" size={40} /></div>
        ) : cropsData.length === 0 ? (
           <div className="w-full text-center py-24 bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-800/20 [mask-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
              <div className="relative z-10">
                <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-slate-800/50 shadow-inner">
                  <Package size={32} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Barn Empty</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Your inventory is currently empty. Use the 'Add New' button to get started.</p>
              </div>
           </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cropsData.map((crop) => (
              <div key={crop._id} className="rounded-[2rem] p-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group relative">
             
                <div className={`h-full w-full rounded-[1.8rem] overflow-hidden relative flex flex-col justify-between ${crop.isHarvested ? 'bg-[#10B981]' : 'bg-[#F97316]'}`}>
                  
                  <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>

                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                   
                      <button 
                            className="bg-black/20 hover:bg-black/30 backdrop-blur-md text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                            title="Copy ID"
                            onClick={() => {navigator.clipboard.writeText(crop.cropId); alert("ID Copied");}}>
                          #{crop.cropId} <Copy size={10}/>
                      </button>

             
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                         {crop.isHarvested ? <CheckCircle2 size={12} fill="white" className="text-emerald-500"/> : <Sprout size={12} fill="white" className="text-orange-500"/>}
                         {crop.isHarvested ? "Harvested" : "Growing"}
                      </span>
                    </div>
                    
             
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{crop.name}</h3>
                      <p className="text-xs text-white/90 font-bold flex items-center gap-1.5 pt-1 uppercase tracking-wider">
                        <Clock size={12} /> Planted: {crop.plantedDate}
                      </p>
                      {crop.expiryDate && (
                         <p className="text-xs text-white/90 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                           <AlertTriangle size={12} /> Expires: {crop.expiryDate}
                         </p>
                      )}
                    </div>
                  </div>

                 
                  <div className="relative z-10 bg-black/20 backdrop-blur-sm p-4 mt-2 border-t border-white/10">
                    <div className="flex items-center justify-between gap-4 ">
                      
                     
                      <div className="flex flex-col">
                         <span className="text-[9px] uppercase font-black text-white/70 tracking-widest mb-1">QUANTITY</span>
                         <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 pr-3">
                            <button onClick={() => handleReduceStock(crop)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"><Minus size={14}/></button>
                            <span className="text-lg font-bold text-white min-w-[20px] text-center">{crop.quantity}</span>
                            <button onClick={() => updateQuantityMutation({ cropId: crop._id, amount: 1 })} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"><Plus size={14}/></button>
                            <span className="text-[10px] font-bold text-white/80">{crop.unit}</span>
                         </div>
                      </div>

                   
                      <div className="flex items-end gap-2 px-2">
                        {!crop.isHarvested && (
                           <button onClick={() => markHarvestedMutation({ cropId: crop._id })} className="w-10 h-10 rounded-xl bg-white text-emerald-600 shadow-lg hover:scale-105 transition-all flex items-center justify-center" title="Harvest Now">
                             <CheckCircle2 size={20} />
                           </button>
                        )}
                        <button onClick={() => setReminderModal(crop)} className="w-10 h-10 rounded-xl bg-white/20 text-white hover:bg-white/30 hover:scale-105 transition-all flex items-center justify-center" title="Set Reminder">
                           <BellPlus size={18} />
                        </button>
                        <button onClick={() => { if(confirm(`Delete ${crop.name}?`)) deleteCropMutation({ cropId: crop._id }) }} className="w-10 h-10 rounded-xl bg-white/20 text-white hover:bg-red-500/80 hover:scale-105 transition-all flex items-center justify-center" title="Delete">
                           <Trash2 size={18} />
                        </button>
                      </div>
                        
                    </div>
                  </div>
                </div>
              </div>

            ))}
          </div>
          
        )}
        {reminderModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400"><Bell size={20}/></div>
                Remind me
              </h3>
              <button onClick={() => setReminderModal(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
              </div>
              <p className="text-sm text-slate-400 mb-5 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  Set a reminder for <span className="font-bold text-white">{reminderModal.name}</span>
              </p>
              <form onSubmit={handleAddReminder}>
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">When?</label>
                  <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" value={reminderForm.date} onChange={(e) => setReminderForm({...reminderForm,date : e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Note</label>
                  <input type="text" required placeholder="Note..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600" value={reminderForm.note} onChange={(e) => setReminderForm({...reminderForm,note : e.target.value})} />
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-900/50 text-lg">
                    Set Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}