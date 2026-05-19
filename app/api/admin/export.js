import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";

export default async function handler(req, res) {
  const users = await prisma.user.findMany();

  const parser = new Parser();
  const csv = parser.parse(users);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");

  res.status(200).send(csv);
}
