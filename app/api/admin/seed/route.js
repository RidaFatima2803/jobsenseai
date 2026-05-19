import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// One-time endpoint to create the first super-admin.
// Self-disables once any admin exists.
export async function POST(req) {
  const count = await db.admin.count();
  if (count > 0) {
    return NextResponse.json(
      { error: "Admin account already exists. Use the Admin Portal to manage admins." },
      { status: 400 }
    );
  }

  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password and name are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await db.admin.create({
    data: { email: email.toLowerCase().trim(), password: hashed, name, role: "superadmin" },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ success: true, admin });
}
