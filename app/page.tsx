import Analyzer from "@/components/Analyzer";
import Badge from "@/components/Badge";

const steps = [
  ["1", "Upload", "Add your PDF or DOCX resume."],
  ["2", "Paste", "Paste the job description."],
  ["3", "Improve", "Get a score, gaps and rewrites."],
];
const feats = [
  ["ATS score", "Overall score and skills match percentage."],
  ["Keyword gaps", "See found and missing keywords."],
  ["Honest rewrites", "Improve bullets using only your real experience."],
  ["Private", "Files are processed in memory, never stored."],
];

export default function Home() {
  return (
    <main>
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <b className="text-lg">ATSPass<span className="text-indigo-600">.ai</span></b>
          <div className="flex gap-4 text-sm">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#app" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white">Analyze</a>
          </div>
        </div>
      </nav>
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4"><Badge variant="free">100% Free</Badge></div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Beat the ATS. <span className="text-indigo-600">Get the interview.</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-slate-600">Upload your resume, paste a job description, and get an AI-powered ATS score with specific, honest fixes.</p>
        <a href="#app" className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow hover:bg-indigo-700">Analyze my resume – free</a>
      </section>
      <section id="how" className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
        {steps.map((s) => <div key={s[0]} className="rounded-2xl border bg-white p-6"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{s[0]}</div><h3 className="font-semibold">{s[1]}</h3><p className="text-sm text-slate-600">{s[2]}</p></div>)}
      </section>
      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {feats.map((s) => <div key={s[0]} className="rounded-2xl border bg-white p-6"><h3 className="font-semibold">{s[0]}</h3><p className="text-sm text-slate-600">{s[1]}</p></div>)}
      </section>
      <section id="app" className="mx-auto max-w-5xl px-4 py-12"><Analyzer /></section>
      <footer className="border-t py-8 text-center text-sm text-slate-500">© 2026 ATSPass.ai · Resumes are never stored.</footer>
    </main>
  );
}
