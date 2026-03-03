"use client";

import SupportForm from "./SupportForm";

export default function SupportPageContent() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">

      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]">
            <svg
              className="w-6 h-6 text-blue-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-400">
            Support Center
          </h1>
        </div>
        <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto leading-relaxed">
          Tell us what&apos;s going on and we&apos;ll get back to you based on your priority level.
        </p>
        <div className="mx-auto mt-8 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </header>

      {/* Form Card */}
      <div className="relative group mb-8">
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 bg-gradient-to-r from-blue-500/30 to-violet-500/30 transition-opacity group-hover:opacity-30 duration-700" />
        <div className="relative bg-[--card-bg] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          <SupportForm />
        </div>
      </div>

      {/* Alternative contact options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 group-hover:opacity-40 transition-opacity duration-700" />
          <div className="relative neon-card p-5 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <svg
                className="w-5 h-5 text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Prefer email?</p>
              <a
                href="mailto:support@clutchgg.lol"
                className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors truncate block"
              >
                support@clutchgg.lol
              </a>
            </div>
          </div>
        </div>

        {/* Discord */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 bg-[#5865F2]/20 group-hover:opacity-40 transition-opacity duration-700" />
          <div className="relative neon-card p-5 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 shrink-0">
              <svg
                className="w-5 h-5 text-[#7289da]"
                fill="currentColor"
                viewBox="0 0 127.14 96.36"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Need quick help?</p>
              <a
                href="https://discord.gg/BeszQxTn9D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#7289da] hover:text-[#99aab5] transition-colors"
              >
                Join our Discord community
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
