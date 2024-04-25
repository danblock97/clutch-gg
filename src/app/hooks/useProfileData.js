import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const useProfileData = () => {
	const [profileData, setProfileData] = useState(null);
	const [accountData, setAccountData] = useState(null);
	const [rankedData, setRankedData] = useState(null);
	const [error, setError] = useState(null);
	const router = useRouter();
	const gameName = useSearchParams().get("gameName");
	const tagLine = useSearchParams().get("tagLine");

	useEffect(() => {
		if (gameName && tagLine) {
			fetch(`/api/profile?gameName=${gameName}&tagLine=${tagLine}`)
				.then((response) => {
					if (!response.ok) throw new Error("Failed to fetch");
					return response.json();
				})
				.then((data) => {
					setProfileData(data.profileData);
					setAccountData(data.accountData);
					setRankedData(data.rankedData);
				})
				.catch((error) => {
					setError(error.message || "Failed to fetch data");
				});
		}
	}, [router.query, gameName, tagLine]);

	return { profileData, accountData, rankedData, error };
};

export default useProfileData;
