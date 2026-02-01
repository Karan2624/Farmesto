"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Store, PlusCircle, User, Home } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const MobileNav = () => {
  const pathname = usePathname();
  const user = useQuery(api.users.getUserState);

  // Simplified items for mobile
  const navItems = [
     { href: "/", label: 'Home', icon: Home },
  ];

  if (user?.role === "farmer") {
     navItems.push(
       { href: "/sell", label: 'Sell', icon: PlusCircle },
       { href: "/dashboard", label: 'Dash', icon: LayoutDashboard }
     );
  } else {
     navItems.push(
       { href: "/marketplace", label: 'Market', icon: Store }
     );
  }
  
  navItems.push({ href: "/profile", label: 'Profile', icon: User });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${
              isActive 
                ? 'text-emerald-600 -translate-y-2' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-emerald-100' : 'bg-transparent'}`}>
               <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};