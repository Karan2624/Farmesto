import { Inter } from "next/font/google";
import "./globals.css";
// import { Header } from "@/components/header"; // DELETE THIS
import { Sidebar } from "../components/sidebar"; 
import { MobileNav } from "../components/mobile-nav"; 
import { ConvexClientProvider } from "../components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Farmesto",
  description: "The smartest way to sell and produce farm products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ADDED SPACE BEFORE bg-[#150522] */}
      <body className={`${inter.className} bg-[#110d14] text-slate-900 `}>
        <ClerkProvider>
          <ConvexClientProvider>
            
            <div className="flex min-h-screen">
              {/* 1. Desktop Sidebar (Fixed Left) */}
              <Sidebar />

              {/* 2. Main Content */}
              <main className="flex-1 md:ml-72 md:max-w-7xl mx-auto w-full mb-20 md:mb-0 ">
                {children}
              </main>

              {/* 3. Mobile Bottom Bar */}
              <MobileNav />
            </div>

          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}