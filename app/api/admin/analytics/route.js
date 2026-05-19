import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

const fmt = (date) => date.toISOString().split("T")[0];

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [users, resumes, coverLetters, assessments] = await Promise.all([
    db.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    db.resume.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    db.coverLetter.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    db.assessment.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Build a 30-day date array
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return fmt(d);
  });

  const regMap = {};
  users.forEach((u) => {
    const k = fmt(u.createdAt);
    regMap[k] = (regMap[k] || 0) + 1;
  });

  const activityMap = {};
  [...resumes, ...coverLetters, ...assessments].forEach((item) => {
    const k = fmt(item.createdAt);
    activityMap[k] = (activityMap[k] || 0) + 1;
  });

  const registrationsTrend = last30.map((date) => ({
    date,
    users: regMap[date] || 0,
  }));

  const activityTrend = last30.map((date) => ({
    date,
    activity: activityMap[date] || 0,
  }));

  const [totalResumes, totalCoverLetters, totalInterviews] = await Promise.all([
    db.resume.count(),
    db.coverLetter.count(),
    db.assessment.count(),
  ]);

  const featureUsage = [
    { feature: "Resumes", count: totalResumes },
    { feature: "Cover Letters", count: totalCoverLetters },
    { feature: "Interviews", count: totalInterviews },
  ];

  return NextResponse.json({ registrationsTrend, activityTrend, featureUsage });
}
