import {
  Users,
  FileText,
  MessageSquare,
  BarChart2,
  UserPlus,
  Activity,
} from "lucide-react";
import { db } from "@/lib/prisma";
import StatsCard from "../_components/stats-card";
import {
  RegistrationChart,
  FeatureUsageChart,
  ActivityChart,
} from "../_components/overview-charts";

async function getStats() {
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
    db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
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

  return {
    totalUsers,
    newUsers7d,
    totalResumes,
    totalCoverLetters,
    totalInterviewSessions,
    activeUsers,
  };
}

const fmt = (d) => d.toISOString().split("T")[0];

async function getAnalytics() {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  const [users, resumes, coverLetters, assessments] =
    await Promise.all([
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

  const actMap = {};
  [...resumes, ...coverLetters, ...assessments].forEach(
    (item) => {
      const k = fmt(item.createdAt);
      actMap[k] = (actMap[k] || 0) + 1;
    }
  );

  const registrationsTrend = last30.map((date) => ({
    date,
    users: regMap[date] || 0,
  }));

  const activityTrend = last30.map((date) => ({
    date,
    activity: actMap[date] || 0,
  }));

  const [
    totalResumes,
    totalCoverLetters,
    totalInterviews,
  ] = await Promise.all([
    db.resume.count(),
    db.coverLetter.count(),
    db.assessment.count(),
  ]);

  const featureUsage = [
    {
      feature: "Resumes",
      count: totalResumes,
    },
    {
      feature: "Cover Letters",
      count: totalCoverLetters,
    },
    {
      feature: "Interviews",
      count: totalInterviews,
    },
  ];

  return {
    registrationsTrend,
    activityTrend,
    featureUsage,
  };
}

export default async function AdminDashboardPage() {
  const [stats, analytics] =
    await Promise.all([
      getStats(),
      getAnalytics(),
    ]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      description:
        "Users with at least one document",
    },
    {
      title: "Resumes Generated",
      value: stats.totalResumes.toLocaleString(),
      icon: FileText,
      description:
        "Total resumes created",
    },
    {
      title: "Cover Letters",
      value: stats.totalCoverLetters.toLocaleString(),
      icon: MessageSquare,
      description:
        "Total cover letters created",
    },
    {
      title: "Interview Sessions",
      value:
        stats.totalInterviewSessions.toLocaleString(),
      icon: BarChart2,
      description:
        "Total quiz attempts",
    },
    {
      title: "New Users (7d)",
      value: stats.newUsers7d.toLocaleString(),
      icon: UserPlus,
      description:
        "Signed up in the last 7 days",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-white">

      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-sm text-gray-300 mt-1">
          Platform overview and usage metrics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatsCard
            key={card.title}
            {...card}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RegistrationChart
          data={analytics.registrationsTrend}
        />

        <FeatureUsageChart
          data={analytics.featureUsage}
        />
      </div>

      <ActivityChart
        data={analytics.activityTrend}
      />
    </div>
  );
}