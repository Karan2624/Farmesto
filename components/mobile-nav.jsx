"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Home, LayoutDashboard, Leaf, Package, PlusCircle, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MobileNav = () => {
  const pathname = usePathname();
  const user = useQuery(api.users.getUserState);

  if (user === undefined) {
    return null; 
  }


  if (user === null) {
    return null;
  }

 
  const navItems = [
    { href: "/", label: "Home", icon: Home },
  ];


  if (user.role === "farmer") {
    navItems.push(
      { href: "/inventory", label: "Inventory", icon: Package },
      { href: "/sell", label: "Sell", icon: PlusCircle },
      { href: "/doctor", label: "Doctor", icon: Leaf },
      { href: "/dashboard", label: "Dash", icon: LayoutDashboard }
    );
  } else if (user.role === "buyer") {
    navItems.push(
     
      { href: "/marketplace", label: "Market", icon: Store },
      { href: "/orders", label: "My Orders", icon: Package },   
    );
  }


  navItems.push({ href: "/profile", label: "Profile", icon: User });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex justify-between items-center z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
      
            className={`flex flex-col gap-1 items-center p-2 rounded-2xl transition-all duration-300 min-w-[3.5rem] ${
              isActive 
                ? 'text-emerald-600 -translate-y-2' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-emerald-100' : 'bg-transparent'}`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <div>

              <span className={`text-[10px] transition-opacity font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};