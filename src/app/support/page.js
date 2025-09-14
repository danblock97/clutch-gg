export const metadata = {
  title: "Support | ClutchGG",
  description: "Get help, report bugs, or view our roadmap.",
};

export default function SupportPage() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12">
      {/* Subtle decorative orbs to match homepage */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="orb orb-sm orb-league" style={{ top: "-40px", right: "-60px" }} />
        <div className="orb orb-md orb-league" style={{ bottom: "-80px", left: "-80px" }} />
      </div>

      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="league-gradient-text">Support</span>
        </h1>
        <p className="mt-2 text-[--text-secondary]">
          Get help, report issues, and follow what we’re building.
        </p>
        <div className="mx-auto mt-4 h-px w-24 rounded bg-gradient-to-r from-[--primary] to-[--secondary] opacity-70" />
      </header>

      {/* Primary actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-3">
        <a
          href="https://roomy-pick-4e2.notion.site/26d05d85e5838133b81bd3e02d7525e0?pvs=105"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-sm font-semibold text-white select-none
                     bg-gradient-to-b from-[--primary] to-[--primary-dark]
                     shadow-[0_6px_0_0_rgba(0,0,0,0.45)] hover:shadow-[0_7px_0_0_rgba(0,0,0,0.45)]
                     transition-all active:translate-y-[2px] active:shadow-[0_4px_0_0_rgba(0,0,0,0.45)]
                     border border-white/10 hover:border-white/20"
        >
          Report a bug
        </a>

        <a
          href="https://www.notion.so/ClutchGG-Public-Roadmap-26d05d85e58380cba371cad98d72b25e?source=copy_link"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-sm font-semibold text-white select-none
                     bg-gradient-to-b from-[--secondary] to-[#5c25b6]
                     shadow-[0_6px_0_0_rgba(0,0,0,0.45)] hover:shadow-[0_7px_0_0_rgba(0,0,0,0.45)]
                     transition-all active:translate-y-[2px] active:shadow-[0_4px_0_0_rgba(0,0,0,0.45)]
                     border border-white/10 hover:border-white/20"
        >
          View roadmap
        </a>
      </div>

      {/* Helpful info cards */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="feature-card p-5">
          <h3 className="text-base font-semibold">Write a great bug report</h3>
          <ul className="mt-3 space-y-2 text-sm text-[--text-secondary]">
            <li>• Steps to reproduce</li>
            <li>• Expected vs actual result</li>
            <li>• Link to profile/match if relevant</li>
            <li>• Region + Riot ID (Name#Tag)</li>
            <li>• Screenshot if possible</li>
          </ul>
        </div>

        <div className="feature-card p-5">
          <h3 className="text-base font-semibold">Roadmap & updates</h3>
          <p className="mt-3 text-sm text-[--text-secondary]">
            Track features in progress, ideas we’re exploring, and recently shipped changes.
          </p>
          <a
            href="https://www.notion.so/ClutchGG-Public-Roadmap-26d05d85e58380cba371cad98d72b25e?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[--primary] transition-colors"
          >
            Open roadmap →
          </a>
        </div>

        <div className="feature-card p-5">
          <h3 className="text-base font-semibold">Status & announcements</h3>
          <p className="mt-3 text-sm text-[--text-secondary]">
            We post downtime notices and fixes in our Discord announcements channel.
          </p>
          <a
            href="https://discord.gg/BeszQxTn9D"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[--secondary] transition-colors"
          >
            Join Discord →
          </a>
        </div>
      </section>

      {/* Service notes */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="neon-card p-5">
          <h3 className="text-base font-semibold">Data & regions</h3>
          <p className="mt-2 text-sm text-[--text-secondary]">
            We support multiple regions. Some stats may take a short time to refresh due to rate limits and caching.
          </p>
        </div>
        <div className="neon-card p-5">
          <h3 className="text-base font-semibold">Privacy</h3>
          <p className="mt-2 text-sm text-[--text-secondary]">
            We respect your privacy. Learn how we handle data in our
            <a href="/legal/privacy-policy" className="ml-1 text-white hover:text-[--primary] transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </section>

      {/* Small contact chips (no heading) */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <a
          href="https://discord.gg/BeszQxTn9D"
          target="_blank"
          rel="noopener noreferrer"
          className="neon-chip hover:text-white hover:border-white/30 transition-colors"
        >
          Discord
        </a>
      </div>
    </div>
  );
}
