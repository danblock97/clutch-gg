"use client";
import { useSearchParams } from "next/navigation";
import MatchDetails from "../../components/MatchDetails";

const Page = () => {
	const searchParams = useSearchParams();
	console.log("Search Params:", searchParams);

	const matchId = searchParams.get("matchId");

	return <MatchDetails matchId={matchId} />;
};

export default Page;
