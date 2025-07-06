"use client";

import { useState, useEffect } from "react";
import {
	CheckIcon,
	XMarkIcon,
	Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import CookieSettingsModal from "./CookieSettingsModal";

export default function CookieConsentBanner() {
	const [showBanner, setShowBanner] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem("cookie_consent");
		if (!consent) {
			setShowBanner(true);
		} else {
			const { expiry } = JSON.parse(consent);
			if (new Date().getTime() > expiry) {
				localStorage.removeItem("cookie_consent");
				setShowBanner(true);
			}
		}

		const openSettingsHandler = () => setShowSettings(true);
		window.addEventListener("openCookieSettings", openSettingsHandler);

		return () => {
			window.removeEventListener("openCookieSettings", openSettingsHandler);
		};
	}, []);

	const handleAcceptAll = () => {
		const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
		const consent = {
			necessary: true,
			analytics: true,
			marketing: true,
			expiry,
		};
		localStorage.setItem("cookie_consent", JSON.stringify(consent));
		setShowBanner(false);
		// Add logic to enable all tracking scripts
	};

	const handleDenyAll = () => {
		const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
		const consent = {
			necessary: true,
			analytics: false,
			marketing: false,
			expiry,
		};
		localStorage.setItem("cookie_consent", JSON.stringify(consent));
		setShowBanner(false);
		// Add logic to disable all non-essential tracking scripts
	};

	const handleSaveSettings = (settings) => {
		const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
		const consent = { ...settings, expiry };
		localStorage.setItem("cookie_consent", JSON.stringify(consent));
		setShowBanner(false);
		setShowSettings(false);
		// Add logic to enable/disable scripts based on settings
	};

	if (!showBanner) {
		return null;
	}

	return (
		<>
			<div className="fixed bottom-4 right-4 z-50">
				<div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 max-w-2xl mx-auto p-6 overflow-hidden">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-white">Cookie Consent</h3>
						<p className="text-sm text-gray-300 mt-2">
							We use cookies to enhance your experience, analyze site traffic,
							and for marketing purposes. You can choose to accept all, deny
							all, or customise your settings.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
						<button
							onClick={handleDenyAll}
							className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-white rounded-full transition-all duration-300 transform hover:scale-105"
						>
							<XMarkIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
							Deny All
						</button>
						<button
							onClick={() => setShowSettings(true)}
							className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 text-white rounded-full transition-all duration-300 transform hover:scale-105"
						>
							<Cog6ToothIcon className="w-5 h-5 transition-transform duration-300 group-hover:animate-spin" />
							Customise
						</button>
						<button
							onClick={handleAcceptAll}
							className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 text-white rounded-full transition-all duration-300 transform hover:scale-105"
						>
							<CheckIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />
							Accept All
						</button>
					</div>
				</div>
			</div>
			{showSettings && (
				<CookieSettingsModal
					onClose={() => setShowSettings(false)}
					onSave={handleSaveSettings}
				/>
			)}
		</>
	);
}
