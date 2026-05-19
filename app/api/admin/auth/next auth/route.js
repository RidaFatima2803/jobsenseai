import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) throw new Error("No admin found");

        const isValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isValid) throw new Error("Invalid password");

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },

  // ✅ ADD THESE CALLBACKS
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // 
});

export { handler as GET, handler as POST };