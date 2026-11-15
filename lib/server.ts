import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const requests = new Map<string, number[]>();

/** Basic in-memory limiter: 5 requests per minute per IP, per server instance. */
export function rateLimit(ip: string) {
  const now = Date.now();
  const recent = (requests.get(ip) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 5) throw new ApiError(429, "Too many requests. Please wait a minute.");
  recent.push(now);
  requests.set(ip, recent);
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const document = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  let output = "";
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    output += content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "")).join("") + "\n";
  }
  return output;
}

export async function extractText(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new ApiError(400, "File exceeds 5 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  let text = "";

  try {
    if (name.endsWith(".pdf") && buffer.subarray(0, 4).toString() === "%PDF") {
      text = await extractPdf(buffer);
    } else if (name.endsWith(".docx") && buffer.subarray(0, 2).toString() === "PK") {
      text = (await mammoth.extractRawText({ buffer })).value;
    } else {
      throw new ApiError(400, "Only valid PDF or DOCX files are supported.");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, "Could not read this file. It may be corrupted or password-protected.");
  }

  text = text.replace(/[ \t]+\n/g, "\n").trim();
  if (text.length < 100) throw new ApiError(422, "Very little text found. Scanned/image-only resumes are not supported.");
  return text.slice(0, 20_000);
}

export async function gemini(prompt: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ApiError(500, "Server is missing GEMINI_API_KEY.");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new ApiError(502, "Could not reach the AI service. Please try again.");
  }

  if (!response.ok) {
    throw new ApiError(502, response.status === 429 ? "AI service is busy (free-tier limit). Try again shortly." : "AI service failed. Please try again.");
  }

  try {
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch {
    throw new ApiError(502, "AI returned an unreadable response. Please retry.");
  }
}

export function fail(error: unknown) {
  const apiError = error instanceof ApiError ? error : new ApiError(500, "Unexpected server error.");
  return Response.json({ error: apiError.message }, { status: apiError.status });
}
