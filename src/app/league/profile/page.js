"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";
import Loading from "@/components/Loading";

// Redirect handler for old query-param URLs to new clean URLs
const ProfilePageContent = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	
	const gameName = searchParams.get("gameName");
	const tagLine = searchParams.get("tagLine");
	const region = searchParams.get("region");

	useEffect(() => {
		if (gameName && tagLine && region) {
			const newUrl = buildProfileUrl("league", region, gameName, tagLine);
			if (newUrl) {
				router.replace(newUrl);
			}
		}
	}, [gameName, tagLine, region, router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<Loading />
		</div>
	);
};

const ProfilePage = () => (
	<Suspense fallback={<Loading />}>
		<ProfilePageContent />
	</Suspense>
);

export default ProfilePage;
