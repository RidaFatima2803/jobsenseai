import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers7d,
    totalResumes,
    totalCoverLetters,
    totalInterviewSessions,
    activeUsers,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.resume.count(),
    db.coverLetter.count(),
    db.assessment.count(),
    db.user.count({
      where: {
        OR: [
          { resume: { isNot: null } },
          { coverLetter: { some: {} } },
          { assessments: { some: {} } },
        ],
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsers7d,
    totalResumes,
    totalCoverLetters,
    totalInterviewSessions,
    activeUsers,
  });
}
