"use client";

import { useState, Suspense } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import OutageBanner from "@/components/OutageBanner";
import FeatureAnnouncementBanner from "@/components/FeatureAnnouncementBanner";
import { GameTypeProvider } from "@/context/GameTypeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import PropTypes from "prop-types";

export default function RootLayoutContent({ children }) {
	// Only show banners if there's an actual message
	const outageMessage = process.env.NEXT_PUBLIC_OUTAGE_MESSAGE || "";
	const featureMessage = process.env.NEXT_PUBLIC_FEATURE_ANNOUNCEMENT || "";

	const [isOutageBannerVisible, setIsOutageBannerVisible] = useState(
		outageMessage.trim() !== ""
	);
	const [isFeatureBannerVisible, setIsFeatureBannerVisible] = useState(
		featureMessage.trim() !== ""
	);

	const handleOutageBannerClose = () => {
		setIsOutageBannerVisible(false);
	};

	const handleFeatureBannerClose = () => {
		setIsFeatureBannerVisible(false);
	};

	// Calculate banners visible for navbar positioning
	const bannersVisible =
		(isOutageBannerVisible ? 1 : 0) + (isFeatureBannerVisible ? 1 : 0);

	return (
		<GameTypeProvider>
			<AuthProvider>
				{isOutageBannerVisible && (
					<OutageBanner
						message={outageMessage}
						onClose={handleOutageBannerClose}
					/>
				)}
				{isFeatureBannerVisible && (
					<FeatureAnnouncementBanner
						message={featureMessage}
						onClose={handleFeatureBannerClose}
					/>
				)}
				<Suspense fallback={<div>Loading...</div>}>
					<NavBar bannersVisible={bannersVisible} />
				</Suspense>
				<div>{children}</div>
				<Analytics />
				<SpeedInsights />
				<CookieConsentBanner />
				<Footer />
			</AuthProvider>
		</GameTypeProvider>
	);
}

RootLayoutContent.propTypes = {
	children: PropTypes.node.isRequired,
};