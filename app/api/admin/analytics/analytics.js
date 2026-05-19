// /pages/api/admin/analytics.js
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const usage = await prisma.featureUsage.groupBy({
    by: ["featureName"],
    _sum: { usageCount: true },
  });

  res.json(usage);
}
