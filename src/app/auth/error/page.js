"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

function ErrorContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error") || "Unknown authentication error";

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1015] text-white p-4">
			<div className="card max-w-md w-full p-8 text-center">
				<h1 className="text-2xl font-bold mb-4 text-red-500">
					Authentication Error
				</h1>
				<p className="mb-6">
					{error === "no_code" &&
						"No authorization code was received from Riot."}
					{error === "token_exchange_failed" &&
						"Failed to exchange the authorization code for a token."}
					{error === "account_fetch_failed" &&
						"Failed to fetch your account details."}
					{error !== "no_code" &&
						error !== "token_exchange_failed" &&
						error !== "account_fetch_failed" &&
						error}
				</p>
				<p className="mb-6 text-sm text-[--text-secondary]">
					This could be due to a misconfiguration or an issue with the Riot
					authentication service.
				</p>
				<Link
					href="/"
					className="inline-flex items-center px-4 py-2 bg-[--primary] text-white rounded-md hover:bg-[--primary-dark]"
				>
					<FaArrowLeft className="mr-2" />
					Return to Home
				</Link>
			</div>
		</div>
	);
}

export default function AuthError() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-[#0e1015] text-white">
					Loading...
				</div>
			}
		>
			<ErrorContent />
		</Suspense>
	);
}
