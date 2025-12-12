"use client";

import { useEffect, useMemo, useRef, useState } from "react";

let turnstileScriptPromise;

function loadTurnstileScript() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.turnstile) return Promise.resolve();
	if (turnstileScriptPromise) return turnstileScriptPromise;

	turnstileScriptPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector(
			'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
		);
		if (existing) {
			existing.addEventListener("load", () => resolve());
			existing.addEventListener("error", () =>
				reject(new Error("Failed to load Turnstile script"))
			);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Turnstile script"));
		document.head.appendChild(script);
	});

	return turnstileScriptPromise;
}

export default function TurnstileWidget({ siteKey, onToken, onError }) {
	const containerRef = useRef(null);
	const widgetIdRef = useRef(null);
	const [ready, setReady] = useState(false);

	const stableOnToken = useMemo(() => onToken, [onToken]);
	const stableOnError = useMemo(() => onError, [onError]);

	useEffect(() => {
		let cancelled = false;

		async function init() {
			try {
				await loadTurnstileScript();
				if (cancelled) return;
				if (!window.turnstile) throw new Error("Turnstile not available");
				if (!containerRef.current) return;

				// Reset any previous instance
				if (widgetIdRef.current != null) {
					try {
						window.turnstile.remove(widgetIdRef.current);
					} catch (_) {
						// ignore
					}
					widgetIdRef.current = null;
				}

				widgetIdRef.current = window.turnstile.render(containerRef.current, {
					sitekey: siteKey,
					theme: "auto",
					callback: (token) => {
						stableOnToken?.(token);
					},
					"expired-callback": () => {
						stableOnToken?.("");
					},
					"error-callback": () => {
						stableOnToken?.("");
						stableOnError?.(new Error("Turnstile challenge failed"));
					},
				});

				setReady(true);
			} catch (e) {
				stableOnError?.(e);
			}
		}

		init();

		return () => {
			cancelled = true;
			if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current != null) {
				try {
					window.turnstile.remove(widgetIdRef.current);
				} catch (_) {
					// ignore
				}
				widgetIdRef.current = null;
			}
		};
	}, [siteKey, stableOnError, stableOnToken]);

	return (
		<div className="space-y-2">
			<div ref={containerRef} />
			{!ready ? (
				<p className="text-sm text-[--text-secondary]">Loading verification…</p>
			) : null}
		</div>
	);
}


