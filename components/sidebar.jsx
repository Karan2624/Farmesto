"use client";

import { api } from "@/convex/_generated/api";
import { SignIn, SignInButton } from "@clerk/clerk-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { LayoutDashboard, Leaf, LogIn, Package, PlusCircle, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
    const pathname = usePathname();
    const user = useQuery(api.users.getUserState);
    const navItems = [
        {href:"/",label:"Home",icon:LayoutDashboard}
    ];
    if(user?.role==="farmer"){
        navItems.push(
            {href:"/dashboard",label:"Dashboard",icon:LayoutDashboard},
            {href:"/my-crops",label:"Inventory",icon:Package},
            {href:"/sell",label:"Sell Product",icon:PlusCircle},
            {href:"/doctor",label:"AI Plant Doctor",icon:Leaf},
        )
    }
    else if(user?.role==="buyer"){
        navItems.push(
            {href:"/marketplace",lable:"MarketPlace",icon:store},
            {href:"/myorders",label:"My Orders",icon:Package},     
        );
    }
    navItems.push(
        {href:"/profile",label:"Profile",icon:User},
    );


    return (
        <div className="hidden md:flex flex-col w-72 bg-slate-900 text-white h-screen fixed p-6 top-0 left-0 shadow-2xl z-50">
            <div className="flex gap-3 items-center mb-2 px-2">
                <div className="bg-gradient-to-tr from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-500/30" >
                    <Leaf className="text-white" size={24} />
                </div>
                <div>
                    <span className="text-xl font-bold tracking-tight block">Farmesto</span>
                    <span className="text-xs text-slate-200 tracking-wider uppercase">Agri-tech</span>
                </div>

            </div>
            <div className="flex-1 space-y-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <item.icon
                    size={20}
                    className={`transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                    />

                    <span className="font-medium text-sm">{item.label}</span>

                    {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                </Link>
                );
            })}
            </div>
            <div className="mt-auto pt-6 border-t border-slate-800">
                <SignedIn>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <div className="w-8 h-8 flex justify-center items-center bg-emerald-500 rounded-full text-xs font-bold">
                        <UserButton afterSignOutUrl="/" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{user?.role || "Member"}</p>
                        </div>
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">
                            <LogIn size={20}/>
                            <span className="font-medium text-sm">Log In</span>
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
    )
}