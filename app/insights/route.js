import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { skill } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Give industry insights for "${skill}" in Pakistan.

Return ONLY JSON:

{
  "marketOutlook": "Positive | Neutral | Negative",
  "growthRate": number,
  "demandLevel": "High | Medium | Low",
  "salaryRanges": [
    { "role": "Junior", "min": number, "median": number, "max": number },
    { "role": "Mid", "min": number, "median": number, "max": number },
    { "role": "Senior", "min": number, "median": number, "max": number }
  ],
  "topSkills": [],
  "keyTrends": [],
  "recommendedSkills": []
}

Rules:
- Salaries must be monthly PKR
- Pakistan market only
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    text = text.replace(/```json|```/g, "").trim();

    const data = JSON.parse(text);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
