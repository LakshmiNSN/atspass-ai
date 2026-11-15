import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATSPass.ai – AI ATS Resume Analyzer",
  description: "Score your resume against any job description and fix keyword gaps with AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
