"use client";

import Profile from "@/components/Profile";
import { useState } from "react";
import useProfileData from "../hooks/useProfileData";

const ProfilePage = () => {
	const { profileData, accountData, error } = useProfileData();

	return (
		<div className="min-h-screen bg-gray-700 overflow-hidden">
			{profileData && accountData ? (
				<Profile accountData={accountData} profileData={profileData} />
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default ProfilePage;
