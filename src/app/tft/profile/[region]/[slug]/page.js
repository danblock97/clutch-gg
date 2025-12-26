import { Suspense } from "react";
import { redirect } from "next/navigation";
import { decodeProfileSlug, denormalizeRegionFromUrl } from "@/lib/utils/urlHelpers";
import ProfilePageContent from "./ProfilePageContent";
import Loading from "@/components/Loading";

export async function generateMetadata({ params }) {
	const resolvedParams = await params;
	const { region, slug } = resolvedParams;
	
	const decoded = decodeProfileSlug(slug);
	if (!decoded) {
		return {
			title: "Profile Not Found | ClutchGG",
			description: "The requested profile could not be found.",
		};
	}
	
	const { gameName, tagLine } = decoded;
	const normalizedRegion = denormalizeRegionFromUrl(region);
	
	return {
		title: `${gameName}#${tagLine} - TFT Profile | ClutchGG`,
		description: `View ${gameName}'s Teamfight Tactics stats, match history, rank progression, unit performance, and trait analysis on ClutchGG.`,
		keywords: [
			`${gameName} TFT`,
			`${gameName} Teamfight Tactics`,
			`${gameName} TFT stats`,
			"TFT profile",
			"Teamfight Tactics statistics",
			normalizedRegion,
		],
		alternates: {
			canonical: `https://clutchgg.lol/tft/profile/${region}/${slug}`,
		},
		openGraph: {
			title: `${gameName}#${tagLine} - TFT Profile | ClutchGG`,
			description: `View ${gameName}'s Teamfight Tactics stats, match history, rank progression, unit performance, and trait analysis on ClutchGG.`,
			type: "profile",
			url: `https://clutchgg.lol/tft/profile/${region}/${slug}`,
			images: [
				{
					url: "/images/og-image.png",
					width: 1200,
					height: 630,
					alt: `${gameName} - Teamfight Tactics Profile`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${gameName}#${tagLine} - TFT Profile | ClutchGG`,
			description: `View ${gameName}'s Teamfight Tactics stats, match history, rank progression, unit performance, and trait analysis on ClutchGG.`,
			images: ["/images/og-image.png"],
		},
	};
}

export default async function TFTProfilePage({ params }) {
	const resolvedParams = await params;
	const { region, slug } = resolvedParams;
	
	const decoded = decodeProfileSlug(slug);
	if (!decoded) {
		redirect("/");
	}
	
	const { gameName, tagLine } = decoded;
	const normalizedRegion = denormalizeRegionFromUrl(region);
	
	return (
		<Suspense fallback={<Loading />}>
			<ProfilePageContent
				gameName={gameName}
				tagLine={tagLine}
				region={normalizedRegion}
			/>
		</Suspense>
	);
}

