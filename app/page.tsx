
import ResumeUpload from "@/components/ResumeUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <nav className="flex items-center justify-between px-6 py-5 md:px-16">
        <h1 className="text-2xl font-bold text-blue-600">
          ATSPass.ai
        </h1>

        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
          100% Free
        </span>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
          Your Resume.
          <span className="text-blue-600">
            {" "}Your Next Opportunity.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Optimize your resume for ATS systems with AI.
          Find missing keywords, improve your resume, and
          prepare for your next job opportunity.
        </p>

        <ResumeUpload />
      </section>
    </main>
  );
}

