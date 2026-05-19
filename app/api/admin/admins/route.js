import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admins = await db.admin.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Only super admins can create admins" }, { status: 403 });
  }

  const { email, password, name, role = "admin" } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password and name are required" }, { status: 400 });
  }

  const existing = await db.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "An admin with that email already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await db.admin.create({
    data: { email: email.toLowerCase().trim(), password: hashed, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
