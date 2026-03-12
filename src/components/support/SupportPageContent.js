const supportChannels = [
  {
    title: "Open a GitHub issue",
    eyebrow: "Track bugs and ideas",
    description:
      "Use GitHub to choose a bug report or feature request template so your issue lands with the right details from the start.",
    href: "https://github.com/danblock97/clutch-gg/issues/new",
    cta: "Choose a template",
    accent: "from-cyan-400/30 via-sky-400/10 to-transparent",
    glow: "bg-cyan-400/20",
    ring: "border-cyan-400/20",
    iconWrap: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    linkColor: "text-cyan-200 hover:text-cyan-100",
    bullets: ["Bug reports", "Feature requests", "Structured forms"],
    iconPath:
      "M12 2C6.477 2 2 6.589 2 12.25c0 4.53 2.865 8.372 6.839 9.729.5.096.683-.221.683-.492 0-.243-.009-.888-.014-1.743-2.782.619-3.37-1.377-3.37-1.377-.455-1.182-1.11-1.497-1.11-1.497-.908-.636.069-.623.069-.623 1.004.073 1.533 1.056 1.533 1.056.892 1.563 2.341 1.112 2.91.85.091-.663.35-1.112.636-1.367-2.221-.261-4.555-1.14-4.555-5.074 0-1.121.39-2.038 1.03-2.756-.104-.262-.446-1.315.098-2.742 0 0 .84-.277 2.75 1.052A9.322 9.322 0 0112 6.838c.85.004 1.706.117 2.506.344 1.908-1.329 2.747-1.052 2.747-1.052.546 1.427.203 2.48.1 2.742.642.718 1.029 1.635 1.029 2.756 0 3.944-2.338 4.81-4.566 5.065.359.32.679.952.679 1.919 0 1.386-.013 2.504-.013 2.845 0 .273.18.593.688.491C19.138 20.618 22 16.778 22 12.25 22 6.589 17.523 2 12 2Z",
  },
  {
    title: "Join the Discord",
    eyebrow: "Fastest way to ask",
    description:
      "Use Discord for quick questions, account-specific troubleshooting, and checking whether an issue is already known.",
    href: "https://discord.gg/BeszQxTn9D",
    cta: "Join Discord",
    accent: "from-[#5865F2]/35 via-indigo-400/10 to-transparent",
    glow: "bg-[#5865F2]/20",
    ring: "border-[#5865F2]/20",
    iconWrap: "border-[#5865F2]/20 bg-[#5865F2]/10 text-[#c7d2fe]",
    linkColor: "text-[#c7d2fe] hover:text-white",
    bullets: ["Quick help", "Live feedback", "Community support"],
    iconPath:
      "M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21A105.73 105.73 0 0 0 32.71 96.36a77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.25 105.25 0 0 0 126.6 80.22c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z",
    iconViewBox: "0 0 127.14 96.36",
  },
];

const issueChecklist = [
  "What you expected to happen",
  "What actually happened",
  "The page or feature you were using",
  "Your game, region, and player tag if relevant",
  "Screenshots or exact error text if you have it",
];

const fallbackOptions = [
  {
    label: "Email",
    value: "support@clutchgg.lol",
    href: "mailto:support@clutchgg.lol",
    accent: "text-emerald-300 hover:text-emerald-200",
  },
  {
    label: "Public issue queue",
    value: "github.com/danblock97/clutch-gg",
    href: "https://github.com/danblock97/clutch-gg/issues",
    accent: "text-cyan-200 hover:text-cyan-100",
  },
];

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17 17 7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h9v9" />
    </svg>
  );
}

export default function SupportPageContent() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(58,134,255,0.22),transparent_48%),radial-gradient(circle_at_80%_10%,rgba(88,101,242,0.18),transparent_32%)]" />
      <div className="absolute left-1/2 top-20 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-6xl flex-col px-4 py-12">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[--text-secondary]">
            Support
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Support that meets you where you are
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[--text-secondary]">
            ClutchGG support now runs through GitHub issues for trackable reports
            and Discord for faster back-and-forth help.
          </p>
          <div className="mx-auto mt-8 h-px w-28 rounded-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {supportChannels.map((channel) => (
              <article key={channel.title} className="relative group">
                <div
                  className={`absolute -inset-0.5 rounded-[28px] blur-2xl opacity-25 transition-opacity duration-500 group-hover:opacity-45 bg-gradient-to-br ${channel.accent}`}
                />
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-7 backdrop-blur-xl ${channel.ring}`}
                >
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--text-secondary]">
                        {channel.eyebrow}
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-white">{channel.title}</h2>
                    </div>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${channel.iconWrap}`}
                    >
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox={channel.iconViewBox || "0 0 24 24"}
                      >
                        <path d={channel.iconPath} />
                      </svg>
                    </div>
                  </div>

                  <p className="mb-6 text-sm leading-7 text-[--text-secondary]">
                    {channel.description}
                  </p>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {channel.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-white/90 ${channel.ring} ${channel.glow}`}
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>

                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-colors ${channel.linkColor}`}
                  >
                    {channel.cta}
                    <ArrowIcon />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,15,21,0.96),rgba(26,29,38,0.92))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-200">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--text-secondary]">
                    Before you send it
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Include the useful bits</h2>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-[--text-secondary]">
                {issueChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-amber-300 to-orange-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--text-secondary]">
                Fallback contact
              </p>
              <div className="mt-5 space-y-4">
                {fallbackOptions.map((option) => (
                  <a
                    key={option.label}
                    href={option.href}
                    target={option.href.startsWith("http") ? "_blank" : undefined}
                    rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition-colors hover:border-white/20 hover:bg-black/30"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{option.label}</p>
                      <p className={`text-sm transition-colors ${option.accent}`}>{option.value}</p>
                    </div>
                    <ArrowIcon />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
