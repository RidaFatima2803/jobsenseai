import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { search } = req.query;

  const users = await prisma.user.findMany({
    where: search
      ? {
          email: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {},
    include: {
      activities: true,
      features: true,
    },
  });

  res.json(users);
}
