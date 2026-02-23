"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import OutageBanner from "@/components/OutageBanner";
import FeatureAnnouncementBanner from "@/components/FeatureAnnouncementBanner";
import CookieConsentManager from "@/components/CookieConsentManager";
import { GameTypeProvider } from "@/context/GameTypeContext";
import { AuthProvider } from "@/context/AuthContext";
import PropTypes from "prop-types";

export default function RootLayoutContent({ children, gaId }) {
	const [outageMessage, setOutageMessage] = useState("");
	const [featureMessage, setFeatureMessage] = useState("");
	const [isOutageBannerVisible, setIsOutageBannerVisible] = useState(false);
	const [isFeatureBannerVisible, setIsFeatureBannerVisible] = useState(false);

	useEffect(() => {
		// Fetch active banners from API
		fetch("/api/banners")
			.then((res) => res.json())
			.then((data) => {
				if (data.outageMessage && data.outageMessage.trim()) {
					setOutageMessage(data.outageMessage);
					setIsOutageBannerVisible(true);
				}
				if (data.featureMessage && data.featureMessage.trim()) {
					setFeatureMessage(data.featureMessage);
					setIsFeatureBannerVisible(true);
				}
			})
			.catch((err) => console.error("Failed to fetch banners:", err));
	}, []);

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
				{isOutageBannerVisible && outageMessage && (
					<OutageBanner
						message={outageMessage}
						onClose={handleOutageBannerClose}
					/>
				)}
				{isFeatureBannerVisible && featureMessage && (
					<FeatureAnnouncementBanner
						message={featureMessage}
						onClose={handleFeatureBannerClose}
					/>
				)}
				<Suspense fallback={<div>Loading...</div>}>
					<NavBar bannersVisible={bannersVisible} />
				</Suspense>
				<div>{children}</div>
				<Footer />
				<CookieConsentManager gaId={gaId} />
			</AuthProvider>
		</GameTypeProvider>
	);
}

RootLayoutContent.propTypes = {
	children: PropTypes.node.isRequired,
	gaId: PropTypes.string,
};
