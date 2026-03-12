"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import { GoogleAnalytics } from "@next/third-parties/google";

const COOKIE_CONSENT_KEY = "clutchgg_cookie_consent_v1";
const CONSENT_GRANTED = "granted";
const CONSENT_DENIED = "denied";
const CONSENT_UNSET = "unset";

export default function CookieConsentManager({ gaId }) {
	const [consent, setConsent] = useState(null);

	useEffect(() => {
		if (!gaId) {
			setConsent(CONSENT_DENIED);
			return;
		}

		try {
			const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
			if (storedConsent === CONSENT_GRANTED || storedConsent === CONSENT_DENIED) {
				setConsent(storedConsent);
				return;
			}
		} catch (error) {
			console.error("Unable to read cookie consent preference:", error);
		}

		setConsent(CONSENT_UNSET);
	}, [gaId]);

	const setConsentPreference = (value) => {
		try {
			window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
		} catch (error) {
			console.error("Unable to save cookie consent preference:", error);
		}

		setConsent(value);
	};

	if (!gaId) {
		return null;
	}

	return (
		<>
			{consent === CONSENT_GRANTED && <GoogleAnalytics gaId={gaId} />}

			{consent === CONSENT_UNSET && (
				<div className="fixed inset-x-0 bottom-0 z-[100] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
					<div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[--card-border] bg-[--card-bg]/95 shadow-2xl backdrop-blur-xl">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60" />
						<div className="relative bg-gradient-to-r from-[--primary]/10 via-transparent to-[--secondary]/10 p-4 sm:p-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="text-sm text-[--text-secondary]">
									<p className="font-semibold text-[--text-primary]">
										Cookie consent
									</p>
									<p>
										We use Google Analytics cookies to measure page views and
										improve the site. You can accept or decline analytics cookies.
										{" "}
										<Link
											href="/legal/privacy-policy"
											className="font-medium text-[--primary] underline underline-offset-2 hover:opacity-90"
										>
											Privacy Policy
										</Link>
									</p>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										onClick={() => setConsentPreference(CONSENT_DENIED)}
										className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[--text-primary] transition hover:bg-white/10"
									>
										Decline
									</button>
									<button
										type="button"
										onClick={() => setConsentPreference(CONSENT_GRANTED)}
										className="rounded-lg border border-[--primary]/40 bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[--primary]/20 transition hover:opacity-95"
									>
										Accept analytics
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

CookieConsentManager.propTypes = {
	gaId: PropTypes.string,
};
