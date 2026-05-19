"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Explicitly destructure every field
  const {
    fullName,
    email,
    phone,
    address,
    currentTitle,
    currentOrganization,
    yearsOfExperience,
    keySkills,
    companyName,
    jobTitle,
    jobDescription,
  } = data;

  const prompt = `
You are an expert career coach and professional cover letter writer.

Write a compelling, personalized, professional cover letter using EXACTLY the details below.
Do NOT use placeholder text. Do NOT write "undefined". Use only what is provided.

---

APPLICANT DETAILS:
- Full Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- Address: ${address}

PROFESSIONAL BACKGROUND:
- Current Role: ${currentTitle}
- Current Company: ${currentOrganization}
- Years of Experience: ${yearsOfExperience}
- Key Skills: ${keySkills}

TARGET JOB:
- Applying To Company: ${companyName}
- Position: ${jobTitle}
- Job Description: ${jobDescription}

---

WRITING INSTRUCTIONS:
1. Start with a header block containing: ${fullName}, ${email}, ${phone}, ${address}, and today's date
2. Address the letter to: "Hiring Manager at ${companyName}"
3. Opening paragraph: Express enthusiastic interest in the ${jobTitle} role at ${companyName}
4. Second paragraph: Highlight ${yearsOfExperience} years of experience and key skills (${keySkills}), connecting them directly to the job description
5. Third paragraph: Show specific knowledge of ${companyName} and why you want to work there
6. Closing paragraph: Confident call to action, thank them, express eagerness to interview
7. Sign off with: Sincerely, ${fullName}
8. Format the entire letter in clean markdown
9. DO NOT invent or add any information not provided above
`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription,
        companyName,
        jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Cover letter generation error:", error.message);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return db.coverLetter.findUnique({
    where: { id, userId: user.id },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return db.coverLetter.delete({
    where: { id, userId: user.id },
  });
}