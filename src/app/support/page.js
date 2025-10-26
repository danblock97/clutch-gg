export const metadata = {
  title: "Support | ClutchGG",
  description: "Get help, report bugs, and request features on our Discord server.",
};

export default function SupportPage() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="orb orb-lg orb-league" style={{ top: "-120px", right: "-100px" }} />
        <div className="orb orb-md orb-league" style={{ bottom: "-60px", left: "-60px", opacity: 0.2 }} />
        <div className="orb orb-sm" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle at 30% 30%, rgba(131, 56, 236, 0.15), transparent 60%)", opacity: 0.3 }} />
      </div>

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <svg className="w-12 h-12 text-[--primary]" fill="currentColor" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="league-gradient-text">Support</span>
          </h1>
        </div>
        <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto">
          Join our Discord community for support, bug reports, feature requests, and updates
        </p>
        <div className="mx-auto mt-6 h-px w-32 rounded bg-gradient-to-r from-transparent via-[--primary] to-transparent opacity-50" />
      </header>

      {/* Main Discord CTA */}
      <div className="relative mb-12 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[--primary] via-[--secondary] to-[--primary] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
        <div className="relative feature-card p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#404EED] shadow-lg mb-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">Join Our Discord Server</h2>
            <p className="text-[--text-secondary] max-w-xl mx-auto">
              Connect with the community, get instant support, and stay updated with the latest news and features
            </p>
          </div>

          <a
            href="https://discord.gg/BeszQxTn9D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-xl
                      bg-gradient-to-r from-[#5865F2] to-[#404EED]
                      hover:from-[#4752C4] hover:to-[#3C45C0]
                      shadow-[0_8px_0_0_rgba(0,0,0,0.4)] hover:shadow-[0_10px_0_0_rgba(0,0,0,0.4)]
                      transition-all duration-200 active:translate-y-[3px] active:shadow-[0_5px_0_0_rgba(0,0,0,0.4)]
                      border-2 border-white/10 hover:border-white/20"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            Join Discord Server
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>

      {/* What You Can Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bug Reports */}
        <div className="neon-card p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start gap-4">
            <div className="icon-badge-league flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Report Bugs</h3>
              <p className="text-[--text-secondary] text-sm mb-4">
                Found an issue? Let us know in the #bug-reports channel with:
              </p>
              <ul className="space-y-1.5 text-sm text-[--text-secondary]">
                <li className="flex items-start gap-2">
                  <span className="text-[--primary] mt-0.5">▸</span>
                  <span>Steps to reproduce the issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--primary] mt-0.5">▸</span>
                  <span>Expected vs actual behavior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--primary] mt-0.5">▸</span>
                  <span>Screenshots or profile links</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--primary] mt-0.5">▸</span>
                  <span>Your Riot ID and region</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Requests */}
        <div className="neon-card p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-md bg-gradient-to-br from-[--secondary] to-[--accent]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Request Features</h3>
              <p className="text-[--text-secondary] text-sm mb-4">
                Have an idea to improve ClutchGG? Share it in #feature-requests and help shape the future of the platform.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--secondary]/10 border border-[--secondary]/20 text-sm">
                <span className="text-[--secondary]">💡</span>
                <span className="text-[--text-secondary]">We review every suggestion</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Support */}
        <div className="neon-card p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-md bg-gradient-to-br from-[--success] to-[#059669]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Get Help</h3>
              <p className="text-[--text-secondary] text-sm mb-4">
                Need assistance? Our community and team are ready to help in #support. Get quick answers to questions about stats, features, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Updates & Announcements */}
        <div className="neon-card p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-md bg-gradient-to-br from-[--warning] to-[#d97706]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-[--text-secondary] text-sm mb-4">
                Follow #announcements for downtime notices, new features, bug fixes, and important updates about the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto">
        <div className="feature-card p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-semibold mb-1 text-sm">Fast Response</h4>
          <p className="text-xs text-[--text-secondary]">Active community ready to help</p>
        </div>
        <div className="feature-card p-4 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <h4 className="font-semibold mb-1 text-sm">Privacy First</h4>
          <p className="text-xs text-[--text-secondary]">
            <a href="/legal/privacy-policy" className="hover:text-[--primary] transition-colors">View our privacy policy</a>
          </p>
        </div>
        <div className="feature-card p-4 text-center">
          <div className="text-2xl mb-2">🌍</div>
          <h4 className="font-semibold mb-1 text-sm">All Regions</h4>
          <p className="text-xs text-[--text-secondary]">Supporting players worldwide</p>
        </div>
      </div>
    </div>
  );
}
