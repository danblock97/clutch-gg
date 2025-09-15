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
    <div className="min-h-[80vh] w-full">
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Actions & CTA */}
          <aside className="lg:col-span-2 w-full">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold mb-3 tracking-tight">Share your card</h2>
                <p className="text-white/70 text-base mb-5">Get the word out on social or copy a direct link.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={onShareX}
                    title="Share on X"
                    className="w-14 h-14 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 grid place-items-center text-white/90 text-xl"
                    aria-label="Share on X"
                    type="button"
                  >
                    <FaTwitter />
                  </button>
                  <button
                    onClick={onShareReddit}
                    title="Share on Reddit"
                    className="w-14 h-14 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 grid place-items-center text-white/90 text-xl"
                    aria-label="Share on Reddit"
                    type="button"
                  >
                    <FaRedditAlien />
                  </button>
                  <button
                    onClick={onCopyLink}
                    title="Copy link"
                    className="w-14 h-14 rounded-xl border border-indigo-300/50 ring-1 ring-indigo-400/60 bg-indigo-500/90 hover:bg-indigo-400 grid place-items-center text-white text-xl shadow-[0_0_18px_rgba(99,102,241,0.55)]"
                    aria-label="Copy link"
                    type="button"
                  >
                    <FaLink />
                  </button>
                  <button
                    onClick={onDownloadImage}
                    title="Download image"
                    className="px-4 h-14 rounded-xl border border-emerald-300/50 ring-1 ring-emerald-400/60 bg-emerald-500/90 hover:bg-emerald-400 text-white text-sm font-semibold shadow-[0_0_14px_rgba(16,185,129,0.55)]"
                    aria-label="Download image"
                    type="button"
                  >
                    Download PNG
                  </button>
                </div>
                <div className="mt-3 text-sm text-white/70 h-5">{copied ? "Link copied" : ""}</div>
              </div>

              <div>
                <a href={profileHref} className="inline-flex items-center rounded-lg px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 transition text-sm font-semibold">
                  View full profile
                </a>
              </div>

              <div className="text-base text-white/80">
                <button onClick={() => setShowModal(true)} className="underline hover:text-white">Create your ClutchGG Card</button>
              </div>
            </div>
          </aside>

          {/* Right: Card */}
          <section ref={cardMountRef} className="lg:col-span-3 w-full grid place-items-center relative">
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
