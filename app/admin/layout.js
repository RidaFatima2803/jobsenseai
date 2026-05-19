import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import AdminSessionProvider from "./_components/session-provider";
import AdminSidebar from "./_components/admin-sidebar";

export const metadata = { title: "Admin Portal — Job-Sense AI" };

export default async function AdminLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  const session = isLoginPage ? null : await getServerSession(authOptions);

  if (!isLoginPage && !session) {
    redirect("/admin/login");
  }

  if (isLoginPage) {
    return (
      <AdminSessionProvider>
        <div className="min-h-screen bg-background">
          {children}
          <Toaster richColors />
        </div>
      </AdminSessionProvider>
    );
  }

  return (
    <AdminSessionProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar user={session.user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
        <Toaster richColors />
      </div>
    </AdminSessionProvider>
  );
}
