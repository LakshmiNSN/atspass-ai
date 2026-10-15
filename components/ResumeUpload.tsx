
"use client";

import { useState } from "react";
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    setFile(null);
    setError("");
    setResumeText("");
    setAtsScore(null);
    setMissingKeywords([]);

    if (!selectedFile) return;

    if (!/\.(pdf|docx)$/i.test(selectedFile.name)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      let extractedText = "";

      if (/\.pdf$/i.test(selectedFile.name)) {
        const buffer = await selectedFile.arrayBuffer();
        const pdf = await getDocument({ data: buffer }).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();

          extractedText +=
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" ") + "\n";
        }
      } else {
        const buffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({
          arrayBuffer: buffer,
        });
        extractedText = result.value;
      }

      if (!extractedText.trim()) {
        setError("No readable text found in this resume.");
      } else {
        setResumeText(extractedText);
      }
    } catch (err) {
      console.error(err);
      setError("Could not read this file. Please try another resume.");
    } finally {
      setLoading(false);
    }
  }

  function calculateATSScore() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Upload a resume and enter a job description first.");
      return;
    }

    const stopWords = new Set([
      "the", "and", "for", "with", "you", "your", "are",
      "our", "this", "that", "will", "have", "from", "into",
      "who", "what", "how", "all", "can", "not", "but",
      "job", "role", "work", "using", "should", "their",
      "about", "they", "who", "which", "years", "year"
    ]);

    const words = (text: string) =>
      text.toLowerCase().match(/\b[a-z][a-z+#.]*\b/g) ?? [];

    const jobKeywords = [
      ...new Set(
        words(jobDescription).filter(
          (word) => word.length > 1 && !stopWords.has(word)
        )
      ),
    ];

    if (jobKeywords.length === 0) {
      setError("Please enter a more detailed job description.");
      return;
    }

    const resumeWords = new Set(words(resumeText));
    const matched = jobKeywords.filter((word) =>
      resumeWords.has(word)
    );
    const missing = jobKeywords.filter(
      (word) => !resumeWords.has(word)
    );

    setAtsScore(
      Math.round((matched.length / jobKeywords.length) * 100)
    );
    setMissingKeywords(missing);
    setError("");
  }

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-8">
      <h2 className="text-center text-xl font-bold">
        Upload Your Resume
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        PDF or DOCX, up to 5 MB
      </p>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mt-6 block w-full text-sm"
      />

      {file && (
        <p className="mt-3 text-sm font-medium text-green-700">
          Selected: {file.name}
        </p>
      )}

      {loading && (
        <p className="mt-3 text-sm text-blue-700">
          Reading your resume...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6">
        <label className="block font-bold">
          Paste Job Description
        </label>

        <textarea
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setAtsScore(null);
            setMissingKeywords([]);
          }}
          placeholder="Paste the job description here..."
          className="mt-2 h-40 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={calculateATSScore}
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Calculate ATS Match
      </button>

      {atsScore !== null && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-center text-lg font-bold">
            Keyword Match Score
          </h3>

          <p className="mt-2 text-center text-4xl font-bold text-blue-600">
            {atsScore}%
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            Basic keyword overlap estimate, not an actual employer ATS score.
          </p>

          {missingKeywords.length > 0 && (
            <div className="mt-5">
              <h4 className="font-bold">Potentially Missing Keywords</h4>
              <p className="mt-2 text-sm text-gray-700">
                {missingKeywords.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {resumeText && (
        <div className="mt-6">
          <h3 className="font-bold">Extracted Resume Text</h3>

          <textarea
            readOnly
            value={resumeText}
            className="mt-2 h-48 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm"
          />

          <p className="mt-2 text-sm text-green-700">
            Resume text extracted successfully!
          </p>
        </div>
      )}
    </div>
  );
}
