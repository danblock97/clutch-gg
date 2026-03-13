export default function SupportPageContent() {
  const jiraLinks = [
    {
      title: "Feature Request",
      description: "Share an idea or improvement you want to see in ClutchGG.",
      href: "https://danblock97.atlassian.net/jira/software/c/form/1949fe96-9259-44df-b2f0-b423fe7c5766?atlOrigin=eyJpIjoiMTYzZTQwYjQ5NTNmNGRkMWE1ZGQwNTA4MzhiZjI2NjIiLCJwIjoiaiJ9",
      accent: "from-cyan-500/30 to-blue-500/30",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      iconColor: "text-cyan-300",
      linkColor: "text-cyan-300 hover:text-cyan-200",
      cta: "Open Feature Form",
    },
    {
      title: "Bug Report",
      description: "Report something broken, unexpected, or not working correctly.",
      href: "https://danblock97.atlassian.net/jira/software/c/form/e8f1a9ee-a59c-43de-934c-a403c5ddc62e?atlOrigin=eyJpIjoiMTQ2MjBhZTkzNWI2NDk3ZmI5NTZiMzdiNTkyZTQ2YjMiLCJwIjoiaiJ9",
      accent: "from-rose-500/30 to-orange-500/30",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      iconColor: "text-rose-300",
      linkColor: "text-rose-300 hover:text-rose-200",
      cta: "Open Bug Form",
    },
  ];

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
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
          Use the Jira forms below to submit feature requests or bug reports, or contact us directly if you need help another way.
        </p>
        <div className="mx-auto mt-8 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {jiraLinks.map((link) => (
          <div key={link.title} className="relative group">
            <div
              className={`absolute -inset-0.5 rounded-2xl blur opacity-20 bg-gradient-to-r ${link.accent} transition-opacity duration-700 group-hover:opacity-35`}
            />
            <div className="relative bg-[--card-bg] border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-sm h-full flex flex-col">
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 mb-4 ${link.iconBg}`}>
                <svg
                  className={`w-5 h-5 ${link.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">{link.title}</h2>
              <p className="text-sm text-[--text-secondary] mb-6 flex-grow">
                {link.description}
              </p>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${link.linkColor}`}
              >
                {link.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5m0 0v5m0-5L10 14" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9v10h10" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 group-hover:opacity-40 transition-opacity duration-700" />
          <div className="relative neon-card p-5 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <svg
                className="w-5 h-5 text-amber-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m6 2v-2m-7-4h8m-9 10h10a2 2 0 002-2V7a2 2 0 00-2-2h-1l-1-2H9L8 5H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Service issues?</p>
              <a
                href="https://clutchgg-status.statuspage.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
              >
                Check the live system status page
              </a>
            </div>
          </div>
        </div>

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
