"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { LayoutDashboard, Leaf, Package, PlusCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
    const pathname = usePathname();
    const user = useQuery(api.users.getUserState);
    const navItems = [
        {href:"/",lable:"Home",icon:LayoutDashboard}
    ];
    if(user?.role==="farmer"){
        navItems.push(
            {href:"/dashboard",lable:"Dashboard",icon:LayoutDashboard},
            {href:"/my-crops",label:"Inventory",icon:Package},
            {href:"/sell",label:"Sell Product",icon:PlusCircle},
            {href:"/doctor",lable:"AI Plant Doctor",icon:Leaf},
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
        <div className="hidden md:flex flex-col w-72 bg-slate-900 text-white h-screen p-6 top-0 left-0 shadow-2xl z-50">

        </div>
    )
}