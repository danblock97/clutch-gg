"use client";
import React, { useCallback, useMemo, useRef, useState, Children, isValidElement, cloneElement } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaTwitter, FaRedditAlien, FaLink } from "react-icons/fa";
import ExportFrame from "@/components/card/ExportFrame";
import { exportNodeToPng } from "@/utils/exportImage";

export default function CardPageChrome({ mode, gameName, tagLine, region, children }) {
  const { user, loginWithRiot, navigateToProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const cardMountRef = useRef(null);
  const exportRef = useRef(null);
  const [exportDims, setExportDims] = useState({ w: null, h: null });
  const [exporting, setExporting] = useState(false);
  const [exportBgUrl, setExportBgUrl] = useState(null);

  const profileHref = useMemo(() => {
    const params = new URLSearchParams({ gameName, tagLine, region });
    return `/${mode}/profile?` + params.toString();
  }, [mode, gameName, tagLine, region]);

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);

  const onShareX = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`My ${mode.toUpperCase()} card on ClutchGG.LOL`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  }, [mode]);

  const onShareReddit = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`My ${mode.toUpperCase()} card on ClutchGG.LOL`);
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, "_blank");
  }, [mode]);

  const onDownloadImage = useCallback(async () => {
    try {
      const host = cardMountRef.current;
      const liveCard = host ? host.querySelector('.pc-card') : null;
      if (!liveCard) {
        setExportDims({ w: 360, h: 520 });
      } else {
        const rect = liveCard.getBoundingClientRect();
        setExportDims({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
      // Try to resolve champion background from the live card
      if (host) {
        let bg = null;
        const img = host.querySelector('.pc-bg-img');
        if (img && img.getAttribute('src')) {
          bg = img.getAttribute('src');
        } else {
          const bgDiv = host.querySelector('.pc-bg');
          if (bgDiv) {
            const s = bgDiv.style.backgroundImage || window.getComputedStyle(bgDiv).backgroundImage;
            const m = s && s.match(/url\(("|')?([^"')]+)("|')?\)/);
            if (m && m[2]) bg = m[2];
          }
        }
        setExportBgUrl(bg);
      } else {
        setExportBgUrl(null);
      }
      setExporting(true);
      await new Promise(r => requestAnimationFrame(() => r()));
      const node = exportRef.current;
      if (!node) return;
      await exportNodeToPng(node, `clutchgg-${mode}-card.png`, 2);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  }, [mode]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#06070d] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-indigo-500/12 blur-2xl" />
        <div className="absolute right-[-6%] top-40 h-56 w-56 rounded-full bg-emerald-400/10 blur-[90px]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 h-28 w-[50%] max-w-3xl rounded-full bg-white/4 blur-2xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 py-14 lg:py-16 space-y-10">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-7 lg:px-8 lg:py-9 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/8 via-transparent to-emerald-400/8" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">ClutchGG Card</p>
              <h1 className="text-3xl lg:text-4xl font-black leading-tight">
                Your {mode?.toUpperCase?.() || mode} card is live
              </h1>
              <p className="text-white/70 max-w-3xl text-base lg:text-lg">
                Showcase your profile with a premium shareable card. Use the quick actions to spread
                it, download a high-res image, or jump to your full profile.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
                  {mode?.toUpperCase?.() || "MODE"}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
                  {region}
                </span>
                {gameName && tagLine ? (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
                    {gameName}#{tagLine}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] w-full max-w-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/50">Profile</p>
                  <p className="text-base font-semibold text-white/90">View full stats & history</p>
                </div>
                <a
                  href={profileHref}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500/90 to-emerald-500/90 px-4 py-2 text-sm font-semibold shadow-[0_12px_35px_rgba(99,102,241,0.35)] hover:brightness-110 transition"
                >
                  Open
                </a>
              </div>
              <div className="mt-3 text-xs text-white/60">
                Keep the card fresh — visit your profile anytime to regenerate.
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Actions & CTA */}
          <aside className="lg:col-span-2 w-full space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_12px_45px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-indigo-500/12" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Share your card</h2>
                    <p className="text-white/70 text-sm">Publish instantly or grab a direct link.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/60 whitespace-nowrap">
                    Quick actions
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={onShareX}
                    title="Share on X"
                    className="group h-14 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white/90 text-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                    aria-label="Share on X"
                    type="button"
                  >
                    <FaTwitter className="group-hover:scale-105 transition-transform" />
                  </button>
                  <button
                    onClick={onShareReddit}
                    title="Share on Reddit"
                    className="group h-14 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white/90 text-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                    aria-label="Share on Reddit"
                    type="button"
                  >
                    <FaRedditAlien className="group-hover:scale-105 transition-transform" />
                  </button>
                  <button
                    onClick={onCopyLink}
                    title="Copy link"
                    className="group h-14 rounded-2xl border border-indigo-300/50 ring-1 ring-indigo-400/60 bg-indigo-500/90 hover:bg-indigo-400 transition grid place-items-center text-white text-xl shadow-[0_12px_40px_rgba(99,102,241,0.45)]"
                    aria-label="Copy link"
                    type="button"
                  >
                    <FaLink className="group-hover:scale-105 transition-transform" />
                  </button>
                  <button
                    onClick={onDownloadImage}
                    title="Download image"
                    className="group h-14 rounded-2xl border border-emerald-300/50 ring-1 ring-emerald-400/60 bg-emerald-500/90 hover:bg-emerald-400 transition text-white text-sm font-semibold shadow-[0_12px_40px_rgba(16,185,129,0.45)]"
                    aria-label="Download image"
                    type="button"
                  >
                    Download PNG
                  </button>
                </div>
                <div className="text-sm text-white/70 h-5">{copied ? "Link copied" : ""}</div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_12px_45px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/12 via-transparent to-indigo-500/12" />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center text-sm font-bold">
                    CG
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Need your own card?</p>
                    <p className="text-base font-semibold">Create your ClutchGG Card</p>
                  </div>
                </div>
                <ol className="list-decimal pl-5 space-y-1.5 text-sm text-white/80">
                  <li>Sign in with your Riot account</li>
                  <li>Claim your League and/or TFT profiles</li>
                  <li>Open your profile and click “Create ClutchGG Card”</li>
                </ol>
                <div className="flex flex-wrap gap-3 pt-2">
                  {!user && (
                    <button
                      onClick={loginWithRiot}
                      className="rounded-xl px-4 py-2 border border-indigo-300/50 ring-1 ring-indigo-400/60 bg-indigo-500/90 hover:bg-indigo-400 text-sm font-semibold shadow-[0_10px_35px_rgba(99,102,241,0.45)]"
                    >
                      Sign in with Riot
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold"
                  >
                    How it works
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Card */}
          <section className="lg:col-span-3 w-full">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_14px_55px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/14 via-transparent to-emerald-500/12" />
              <div className="relative rounded-2xl border border-white/5 bg-gradient-to-b from-white/8 via-[#0a0d14] to-[#0a0d14] p-4">
                <div className="absolute inset-x-10 -top-12 h-24 rounded-full bg-indigo-400/10 blur-2xl" />
                <div className="absolute inset-x-12 -bottom-16 h-24 rounded-full bg-emerald-400/10 blur-2xl" />
                <div
                  ref={cardMountRef}
                  className="relative z-10 w-full grid place-items-center"
                >
                  {children}
                  {exporting && (
                    <div
                      style={{
                        position: 'fixed',
                        left: -99999,
                        top: -99999,
                        pointerEvents: 'none',
                        zIndex: -1,
                      }}
                    >
                      <div ref={exportRef}>
                        <ExportFrame
                          width={(exportDims.w || 360) + 64}
                          height={(exportDims.h || 520) + 120}
                          padding={24}
                          appName="clutchgg.lol"
                          watermarkText="clutchgg.lol"
                        >
                          {(() => {
                            const only = Children.only(children);
                            return isValidElement(only)
                              ? cloneElement(only, { enableTilt: false, exportMode: true, backgroundUrl: exportBgUrl || undefined })
                              : children;
                          })()}
                        </ExportFrame>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-2xl border border-white/10 bg-[rgba(12,16,22,0.9)] backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Create your ClutchGG Card</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white text-sm">Close</button>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-white/80">
              <li>Sign in with your Riot account</li>
              <li>Claim your League and/or TFT profiles</li>
              <li>Open your profile and click “Create ClutchGG Card”</li>
            </ol>
            <div className="mt-5 flex items-center gap-2">
              {!user && (
                <button onClick={loginWithRiot} className="rounded-lg px-4 py-2 border border-indigo-300/50 ring-1 ring-indigo-400/60 bg-indigo-500/90 hover:bg-indigo-400 text-white text-sm font-semibold shadow-[0_0_14px_rgba(99,102,241,0.55)]">Sign in with Riot</button>
              )}
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
