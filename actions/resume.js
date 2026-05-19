"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/* =========================
   SAVE RESUME
========================= */

export async function saveResume(
  content
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (
    !content ||
    typeof content !== "string"
  ) {
    throw new Error(
      "Invalid resume content"
    );
  }

  const cleanedContent =
    content.trim();

  if (!cleanedContent) {
    throw new Error(
      "Resume content is empty"
    );
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const resume =
      await db.resume.upsert({
        where: {
          userId: user.id,
        },

        update: {
          content: cleanedContent,
        },

        create: {
          userId: user.id,
          content: cleanedContent,
        },
      });

    revalidatePath("/resume");

    return {
      success: true,
      resume,
    };
  } catch (error) {
    console.error(
      "SAVE RESUME ERROR:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to save resume"
    );
  }
}

/* =========================
   GET RESUME
========================= */

export async function getResume() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    return await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error(
      "GET RESUME ERROR:",
      error
    );

    throw new Error(
      "Failed to fetch resume"
    );
  }
}

/* =========================
   IMPROVE WITH AI
========================= */

export async function improveWithAI({
  current,
  type,
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },

    include: {
      industryInsight: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const prompt = `
Improve this ${type} for a ${
    user.industry || "professional"
  } professional.

CONTENT:
${current}

RULES:
- Keep it concise
- Make it ATS friendly
- Improve grammar and wording
- Return ONLY improved text
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    let improvedContent =
      result.response.text();

    improvedContent =
      improvedContent.trim();

    return improvedContent;
  } catch (error) {
    console.error(
      "IMPROVE AI ERROR:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to improve content"
    );
  }
}

/* =========================
   PARSE RESUME
========================= */

export async function parseResumeWithAI(
  rawText
) {
  const { userId } = await auth();

  if (!rawText?.trim()) {
    throw new Error(
      "No resume text provided"
    );
  }

  const prompt = `
You are an expert ATS resume parser.

Convert the following resume into CLEAN PROFESSIONAL MARKDOWN.

IMPORTANT RULES:
- Return ONLY markdown
- DO NOT wrap in code blocks
- DO NOT use \`\`\`
- No explanations
- No commentary
- Preserve all resume details
- Use proper markdown headings
- Make formatting professional

Resume Text:
${rawText}
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    let output =
      result.response.text();

    // REMOVE CODE BLOCKS
    output = output
      .replace(/```markdown/g, "")
      .replace(/```md/g, "")
      .replace(/```/g, "")
      .trim();

    // REMOVE NULL CHARS
    output = output.replace(
      /\u0000/g,
      ""
    );

    // VALIDATION
    if (
      !output ||
      output.length < 50
    ) {
      throw new Error(
        "Gemini returned incomplete resume data"
      );
    }

    return output;
  } catch (error) {
    console.error(
      "PARSE RESUME AI ERROR:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to parse resume"
    );
  }
}