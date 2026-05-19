import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/app/api/admin/_lib/require-admin";

export async function PATCH(req, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const update = {};

  if (body.name) update.name = body.name;
  if (body.role) update.role = body.role;
  if (body.password) update.password = await bcrypt.hash(body.password, 12);

  try {
    const admin = await db.admin.update({
      where: { id: params.id },
      data: update,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(admin);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent self-deletion
  if (session.user.id === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    await db.admin.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
