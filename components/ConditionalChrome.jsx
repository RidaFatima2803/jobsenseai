"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function ConditionalChrome({ header, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && header}
      <main className="min-h-screen">{children}</main>
      {!isAdmin && <Toaster richColors />}
      {!isAdmin && (
        <footer className="bg-muted/50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-200">
            <p>Made with 💗 by Rida Fatima</p>
          </div>
        </footer>
      )}
    </>
  );
}
