// /pages/api/admin/activity.js
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const logs = await prisma.activityLog.findMany({
    include: { user: true },
    orderBy: { timestamp: "desc" },
  });

  res.json(logs);
}
