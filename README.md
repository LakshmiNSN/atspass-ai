# ATSPass.ai

AI-powered ATS resume analyzer. Upload a resume (PDF/DOCX), paste a job description, and get an AI-generated compatibility analysis, keyword gaps, recommendations, and more honest resume bullet rewrites.

## Features
- Responsive landing page and resume analysis dashboard
- Drag-and-drop or browse upload for PDF and DOCX resumes (5 MB maximum)
- Job description validation (80–15,000 characters)
- Server-side PDF/DOCX text extraction
- Gemini-powered ATS score, skills match, keyword gaps, strengths, weaknesses, and recommendations
- Bullet-point rewriting grounded in the resume and job description
- Input validation, readable error messages, and basic per-IP rate limiting
- Resume files are processed in memory and are not stored by this application

## Tech stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · pdfjs-dist · mammoth · Google Gemini API

## Run locally
1. Install Node.js 22 or later.
2. Install dependencies:
   `npm install`
3. Copy `.env.example` to `.env.local`.
4. Add your Gemini API key to `.env.local`:
   `GEMINI_API_KEY=your_key`
5. Start the development server:
   `npm run dev`
6. Open http://localhost:3000.

Get a Gemini API key from https://aistudio.google.com/apikey. Never commit your real API key.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` |

## API
- `POST /api/analyze`: multipart form with `file` (PDF/DOCX) and `jd` (job description). Returns analysis and extracted resume text.
- `POST /api/improve`: JSON body with `bullets`, `resumeText`, and `jd`. Returns rewritten bullets.

The ATS score is an AI-generated estimate, not a guarantee of how any employer's ATS will rank a resume. Always review generated suggestions before using them.

## Deploy
Import this repository into Vercel and set `GEMINI_API_KEY` in the project's environment variables before deploying.

## Current limitations
- Scanned/image-only PDFs are not supported; the resume must contain extractable text.
- The in-memory rate limiter is per server instance and is not a distributed production rate limiter.
- Real Gemini responses require a valid API key and may be subject to provider quotas.
