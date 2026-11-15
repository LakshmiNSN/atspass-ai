import { ApiError, fail, gemini, rateLimit } from "@/lib/server";

export async function POST(req: Request) {
  try {
    rateLimit(req.headers.get("x-forwarded-for")?.split(",")[0] || "local");
    const { bullets, resumeText, jd } = await req.json();

    if (typeof bullets !== "string" || bullets.trim().length < 10 || bullets.length > 3000) {
      throw new ApiError(400, "Enter 10–3000 characters of bullets, one per line.");
    }
    if (typeof resumeText !== "string" || typeof jd !== "string") {
      throw new ApiError(400, "Missing context.");
    }

    const result = await gemini(`Rewrite each resume bullet to be achievement-oriented, concise and ATS-friendly, naturally using relevant keywords from the job description. Use ONLY facts in the bullet/resume; do NOT invent numbers, tools or achievements. If a metric is missing, keep it missing (you may add a note). Return JSON {"bullets":[{"original":"","improved":""}]}.

RESUME:
${resumeText.slice(0, 20000)}

JOB DESCRIPTION:
${jd.slice(0, 15000)}

BULLETS:
${bullets}`);
    return Response.json(result);
  } catch (error) {
    return fail(error);
  }
}
