import { Suspense } from "react";
import FeaturedGamesPageContent from "./FeaturedGamesPageContent";
import Loading from "@/components/Loading";

export const metadata = {
	title: "Live Games | Clutch.GG",
	description: "Watch high-elo live games.",
};

export default function FeaturedGamesPage() {
	return (
		<Suspense fallback={<Loading />}>
			<FeaturedGamesPageContent />
		</Suspense>
	);
}
