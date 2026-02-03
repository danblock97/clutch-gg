"use client";

import { useGameType } from "@/context/GameTypeContext";

export default function SupportThisAppContent() {
  const { gameType } = useGameType();
  const isTft = gameType === "tft";

  const glowShadow = isTft
    ? "shadow-[0_0_15px_-3px_rgba(255,154,60,0.25)]"
    : "shadow-[0_0_15px_-3px_rgba(58,134,255,0.25)]";
  const iconClasses = isTft
    ? "text-[--tft-primary]"
    : "text-[--primary]";
  const headerGradient = isTft
    ? "bg-gradient-to-r from-[--tft-primary] to-[--tft-secondary]"
    : "bg-gradient-to-r from-[--primary] to-[--secondary]";
  const dividerGradient = isTft
    ? "bg-gradient-to-r from-transparent via-[--tft-primary]/50 to-transparent"
    : "bg-gradient-to-r from-transparent via-[--primary]/50 to-transparent";
  const cardGlowGradient = isTft
    ? "bg-gradient-to-r from-[--tft-primary]/20 to-[--tft-secondary]/20"
    : "bg-gradient-to-r from-[--primary]/20 to-[--secondary]/20";
  const buttonGradient = isTft
    ? "bg-gradient-to-r from-[--tft-primary] to-[--tft-secondary] hover:from-[--tft-primary-dark] hover:to-[--tft-secondary]"
    : "bg-gradient-to-r from-[--primary] to-[--secondary] hover:from-[--primary-dark] hover:to-[--secondary]";
  const iconWrapperClasses = isTft
    ? "border border-[--tft-primary]/20 bg-[--tft-primary]/10"
    : "border border-[--primary]/20 bg-[--primary]/10";

  const supportLinks = [
    {
      amount: "£5",
      url: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_URL_5,
      description: "Buy us a coffee and keep the lights on.",
    },
    {
      amount: "£15",
      url: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_URL_15,
      description: "Help cover hosting and API costs.",
    },
    {
      amount: "£25",
      url: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_URL_25,
      description: "Fuel new features and improvements.",
    },
  ].filter((link) => Boolean(link.url));

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-5">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${iconWrapperClasses} ${glowShadow}`}
          >
            <svg
              className={`w-6 h-6 ${iconClasses}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2s-3 1.343-3 3 1.343 3 3 3zm6 4h-1.26a5.99 5.99 0 00-9.48 0H6a4 4 0 00-4 4v2h20v-2a4 4 0 00-4-4z"
              />
            </svg>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent ${headerGradient}`}
          >
            Support This App
          </h1>
        </div>
        <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto leading-relaxed">
          ClutchGG is free to use. If it’s helped you, you can support ongoing
          development and hosting costs with a one-time tip.
        </p>
        <div className={`mx-auto mt-6 h-px w-24 rounded-full ${dividerGradient}`} />
      </header>

      {supportLinks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {supportLinks.map((link) => (
            <div key={link.amount} className="relative group">
              <div
                className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 ${cardGlowGradient}`}
              ></div>
              <div className="relative bg-[--card-bg] border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-sm h-full flex flex-col">
                <div className="text-3xl font-extrabold mb-2">{link.amount}</div>
                <p className="text-[--text-secondary] mb-6 flex-grow">
                  {link.description}
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl
                    text-white
                    ${buttonGradient}
                    shadow-md hover:shadow-lg transition-all duration-200`}
                >
                  Support with {link.amount}
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="neon-card p-6 text-center mb-10">
          <p className="text-[--text-secondary]">
            Donations are temporarily unavailable. Please check back soon.
          </p>
        </div>
      )}

      <div className="neon-card p-6 text-center">
        <p className="text-sm text-[--text-secondary]">
          Payments are processed securely by Stripe. Donations are optional and
          do not unlock any additional features.
        </p>
      </div>
    </div>
  );
}
