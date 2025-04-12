"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function AuthSuccess() {
	const router = useRouter();

	useEffect(() => {
		// This page is just a placeholder, the actual logic happens in the callback route
		// Users will be redirected to home page automatically
		const timer = setTimeout(() => {
			router.push("/");
		}, 2000);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1015] text-white">
			<h1 className="text-2xl font-bold mb-4">Authentication Successful</h1>
			<p className="mb-8">You are now logged in with your Riot account</p>
			<Loading />
			<p className="mt-4 text-sm text-[--text-secondary]">
				Redirecting to home page...
			</p>
		</div>
	);
}
