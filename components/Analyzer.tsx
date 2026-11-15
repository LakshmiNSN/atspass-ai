"use client";

import { useRef, useState } from "react";
import type { Analysis } from "@/lib/types";
import Button from "@/components/Button";

const Chips = ({ title, items, color }: { title: string; items: string[]; color: string }) => (
  <div><h4 className="mb-2 font-medium">{title}</h4><div className="flex flex-wrap gap-2">
    {items?.length ? items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-xs ${color}`}>{item}</span>) : <span className="text-sm text-slate-400">None</span>}
  </div></div>
);
const List = ({ title, items }: { title: string; items: string[] }) => (
  <div><h4 className="mb-2 font-medium">{title}</h4><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{items?.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
);
const Card = ({ children }: { children: React.ReactNode }) => <div className="up rounded-2xl border bg-white p-6 shadow-sm">{children}</div>;

function Ring({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const score = Math.max(0, Math.min(100, Number(value) || 0));
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  return <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Score ${score}`}>
    <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
    <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} transform="rotate(-90 70 70)" />
    <text x="70" y="78" textAnchor="middle" fontSize="32" fontWeight="700">{score}</text>
  </svg>;
}

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ analysis: Analysis; resumeText: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const [bullets, setBullets] = useState("");
  const [improved, setImproved] = useState<{ original: string; improved: string }[]>([]);
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(next?: File) {
    setError("");
    if (!next) return;
    const name = next.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) return setError("Only PDF or DOCX files are allowed.");
    if (next.size > 5 * 1024 * 1024) return setError("File must be under 5 MB.");
    setFile(next);
  }

  async function analyze() {
    setError("");
    if (!file) return setError("Please upload your resume.");
    if (jd.trim().length < 80) return setError("Please paste a fuller job description (at least 80 characters).");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jd", jd);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function improveBullets() {
    if (!result) return;
    setImproveError("");
    setImproving(true);
    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets, resumeText: result.resumeText, jd }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not improve bullets.");
      setImproved(data.bullets || []);
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setImproving(false);
    }
  }

  function reset() {
    setResult(null);
    setFile(null);
    setJd("");
    setImproved([]);
    setBullets("");
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    const analysis = result.analysis;
    return <div id="results" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><h3 className="mb-2 font-semibold">ATS score</h3><Ring value={analysis.overallScore} /></Card>
        <Card><h3 className="mb-2 font-semibold">Skills match</h3><p className="text-4xl font-bold">{analysis.skillsMatchPercent}%</p><div className="mt-3 h-3 rounded-full bg-slate-200"><div className="h-3 rounded-full bg-indigo-600" style={{ width: `${analysis.skillsMatchPercent}%` }} /></div></Card>
        <Card><h3 className="mb-2 font-semibold">Summary</h3><p className="text-sm text-slate-600">{analysis.matchedSkills?.length || 0} skills matched, {analysis.missingSkills?.length || 0} missing.</p><Button variant="secondary" onClick={reset} className="mt-4 !py-2 !text-sm">Analyze another resume</Button></Card>
      </div>
      <Card><div className="grid gap-6 sm:grid-cols-2">
        <Chips title="Matched skills" items={analysis.matchedSkills || []} color="bg-green-100 text-green-800" />
        <Chips title="Missing skills" items={analysis.missingSkills || []} color="bg-red-100 text-red-800" />
        <Chips title="Keywords found" items={analysis.keywordsFound || []} color="bg-green-50 text-green-700" />
        <Chips title="Keywords missing" items={analysis.keywordsMissing || []} color="bg-amber-100 text-amber-800" />
      </div></Card>
      <Card><div className="grid gap-6 text-sm text-slate-700 sm:grid-cols-3">
        <div><h4 className="font-medium text-slate-900">Technical skills</h4><p>{analysis.technicalAnalysis}</p></div>
        <div><h4 className="font-medium text-slate-900">Experience relevance</h4><p>{analysis.experienceRelevance}</p></div>
        <div><h4 className="font-medium text-slate-900">Education relevance</h4><p>{analysis.educationRelevance}</p></div>
      </div></Card>
      <div className="grid gap-4 sm:grid-cols-2"><Card><List title="Strengths" items={analysis.strengths || []} /></Card><Card><List title="Weaknesses" items={analysis.weaknesses || []} /></Card></div>
      <Card><h3 className="mb-3 font-semibold">Recommendations</h3><div className="space-y-3">{analysis.recommendations?.map((item, index) => <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{item.area}: </b>{item.advice}</div>)}</div></Card>
      <Card><h3 className="font-semibold">Improve my bullet points</h3><p className="mb-2 text-sm text-slate-500">Paste bullets from your resume (one per line). Rewrites use only your real facts.</p>
        <textarea value={bullets} onChange={(event) => setBullets(event.target.value)} rows={4} className="w-full rounded-xl border p-3 text-sm" placeholder="Built a REST API using FastAPI…" />
        {improveError && <p className="mt-2 text-sm text-red-600">{improveError}</p>}
        <Button onClick={improveBullets} disabled={improving || bullets.trim().length < 10} className="mt-2 !py-2 !text-sm">{improving ? "Improving…" : "Improve bullets"}</Button>
        <div className="mt-4 space-y-3">{improved.map((item, index) => <div key={index} className="rounded-xl border p-3 text-sm"><p className="text-slate-500 line-through">{item.original}</p><p className="mt-1 text-green-800">{item.improved}</p></div>)}</div>
      </Card>
    </div>;
  }

  return <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
    <h2 className="mb-6 text-2xl font-bold">Analyze your resume</h2>
    <div onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); pickFile(event.dataTransfer.files[0]); }} onClick={() => !file && inputRef.current?.click()} className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${drag ? "border-indigo-500 bg-indigo-50" : "border-slate-300"}`}>
      <input ref={inputRef} type="file" hidden accept=".pdf,.docx" onChange={(event) => pickFile(event.target.files?.[0])} />
      {file ? <div className="flex items-center gap-3 text-sm"><span className="font-medium">{file.name}</span><button type="button" onClick={(event) => { event.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ""; }} className="rounded border px-2 py-0.5 text-red-600">Remove</button></div> : <><p className="font-medium">Drag & drop your resume or click to browse</p><p className="text-xs text-slate-500">PDF or DOCX · max 5 MB</p></>}
    </div>
    <label className="mb-1 mt-6 block text-sm font-medium">Job description</label>
    <textarea value={jd} onChange={(event) => setJd(event.target.value)} rows={9} className="w-full rounded-xl border p-3 text-sm" placeholder="Paste the full job description here…" />
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button onClick={analyze} disabled={busy} fullWidth className="mt-5">{busy ? "Analyzing… this takes ~10 seconds" : "Analyze resume"}</Button>
  </div>;
}
