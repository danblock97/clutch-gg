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
		title: `${gameName}#${tagLine} - League Profile | ClutchGG`,
		description: `View ${gameName}'s League of Legends stats, match history, ranked info, and champion mastery on ClutchGG.`,
		keywords: [
			`${gameName} League of Legends`,
			`${gameName} LoL stats`,
			`${gameName} match history`,
			"League of Legends profile",
			"LoL statistics",
			normalizedRegion,
		],
		alternates: {
			canonical: `https://clutchgg.lol/league/profile/${region}/${slug}`,
		},
		openGraph: {
			title: `${gameName}#${tagLine} - League Profile | ClutchGG`,
			description: `View ${gameName}'s League of Legends stats, match history, and ranked info on ClutchGG.`,
			type: "profile",
			url: `https://clutchgg.lol/league/profile/${region}/${slug}`,
			images: [
				{
					url: "/images/og-image.png",
					width: 1200,
					height: 630,
					alt: `${gameName} - League of Legends Profile`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${gameName}#${tagLine} - League Profile | ClutchGG`,
			description: `View ${gameName}'s League of Legends stats, match history, and ranked info on ClutchGG.`,
			images: ["/images/og-image.png"],
		},
	};
}

export default async function LeagueProfilePage({ params }) {
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

