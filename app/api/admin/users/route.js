import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
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
        _count: {
          select: {
            assessments: true,
            coverLetter: true,
          },
        },
        resume: { select: { id: true, atsScore: true, updatedAt: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
