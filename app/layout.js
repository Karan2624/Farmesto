import { Inter } from "next/font/google";
import "./globals.css";
// import { Header } from "@/components/header"; // DELETE THIS
import { Sidebar } from "@/components/sidebar"; // IMPORT THIS
import { MobileNav } from "@/components/mobile-nav"; // IMPORT THIS
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Farmesto",
  description: "The smartest way to sell and produce farm products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <ClerkProvider>
          <ConvexClientProvider>
            
            <div className="flex min-h-screen">
              {/* 1. Desktop Sidebar (Fixed Left) */}
              <Sidebar />

              {/* 2. Main Content (Pushed Right on Desktop) */}
              <main className="flex-1 md:ml-72 p-4 md:p-8 max-w-6xl mx-auto w-full mb-20 md:mb-0">
                {children}
              </main>

              {/* 3. Mobile Bottom Bar (Fixed Bottom) */}
              <MobileNav />
            </div>

          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}