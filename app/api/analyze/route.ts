import { ApiError, extractText, fail, gemini, rateLimit } from "@/lib/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    rateLimit(req.headers.get("x-forwarded-for")?.split(",")[0] || "local");
    const form = await req.formData();
    const file = form.get("file");
    const jd = String(form.get("jd") || "").trim();

    if (!(file instanceof File)) throw new ApiError(400, "Please upload a resume.");
    if (jd.length < 80) throw new ApiError(400, "Job description is too short (min 80 characters).");
    if (jd.length > 15000) throw new ApiError(400, "Job description is too long.");

    const resumeText = await extractText(file);
    const analysis = await gemini(`You are a strict ATS analyzer. Compare the RESUME to the JOB DESCRIPTION. Use ONLY facts present in the resume; never invent anything. Return JSON exactly: {"overallScore":0-100,"skillsMatchPercent":0-100,"matchedSkills":[],"missingSkills":[],"keywordsFound":[],"keywordsMissing":[],"technicalAnalysis":"","experienceRelevance":"","educationRelevance":"","strengths":[],"weaknesses":[],"recommendations":[{"area":"Professional summary|Technical skills|Projects|Achievements|Keywords|Formatting","advice":""}]}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jd}`);
    return Response.json({ analysis, resumeText });
  } catch (error) {
    return fail(error);
  }
}
