import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

export async function GET(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      resume: true,
      coverLetter: { orderBy: { createdAt: "desc" } },
      assessments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const allowed = ["name", "email", "bio", "industry", "experience"];
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  try {
    const user = await db.user.update({
      where: { id: params.id },
      data: update,
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await db.$transaction([
      db.assessment.deleteMany({ where: { userId: params.id } }),
      db.coverLetter.deleteMany({ where: { userId: params.id } }),
      db.resume.deleteMany({ where: { userId: params.id } }),
      db.user.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
