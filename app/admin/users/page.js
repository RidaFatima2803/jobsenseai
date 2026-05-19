import { db } from "@/lib/prisma";
import UsersTable from "../_components/users-table";

async function getInitialUsers() {
  const [users, total] = await Promise.all([
    db.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        industry: true,
        experience: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { assessments: true, coverLetter: true } },
        resume: { select: { id: true, atsScore: true, updatedAt: true } },
      },
    }),
    db.user.count(),
  ]);

  return { users, total, totalPages: Math.ceil(total / 20) };
}

export default async function UsersPage() {
  const { users, total, totalPages } = await getInitialUsers();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and manage all registered users
        </p>
      </div>

      <UsersTable
        initialUsers={users}
        initialTotal={total}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
