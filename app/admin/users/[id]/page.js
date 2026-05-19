import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UserDetailView from "../../_components/user-detail-view";

async function getUser(id) {
  return db.user.findUnique({
    where: { id },
    include: {
      resume: true,
      coverLetter: { orderBy: { createdAt: "desc" } },
      assessments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function UserDetailPage({ params }) {
  const user = await getUser(params.id);

  if (!user) notFound();

  return <UserDetailView initialUser={user} />;
}
