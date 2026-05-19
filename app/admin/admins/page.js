import { db } from "@/lib/prisma";
import { getAdminSession } from "@/app/admin/lib/auth";
import AdminsManager from "../_components/admins-manager";

export default async function AdminsPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.user?.role === "superadmin";

  const admins = await db.admin.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Accounts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isSuperAdmin
            ? "Manage who has access to this admin portal."
            : "View admin accounts. Only super admins can make changes."}
        </p>
      </div>

      <AdminsManager
        initialAdmins={admins}
        currentAdminId={session?.user?.id}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
