import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch, FaTicketAlt, FaHome } from "react-icons/fa";

const NoProfileFound = () => {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] p-6 max-w-xl mx-auto text-center">
			{/* Sad Bee Image with Glow Effect */}
			<div className="relative mb-8">
				<div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
				<Image
					src="/images/bee-sad.png"
					alt="Sad Bee"
					height={150}
					width={150}
					className="relative z-10"
				/>
			</div>

			{/* Error Title */}
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
				Summoner Not Found
			</h1>

			{/* Error Description */}
			<p className="text-[--text-secondary] mb-8 leading-relaxed">
				We couldn't find this summoner profile. Please ensure you're using the
				correct region and Riot ID format (Name#Tag).
			</p>

			{/* Action Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
				<button
					onClick={() => router.push("/")}
					className="btn-outline flex-1 py-3 flex items-center justify-center"
				>
					<FaHome className="mr-2" />
					Back to Home
				</button>

				<button
					onClick={() => router.push("/")}
					className="btn-primary flex-1 py-3 flex items-center justify-center"
				>
					<FaSearch className="mr-2" />
					Search Again
				</button>
			</div>

			{/* Support Link */}
			<div className="mt-8 border-t border-[--card-border] pt-6 w-full max-w-md">
				<p className="text-sm text-[--text-secondary] mb-4">
					Need help or experiencing an issue?
				</p>
				<Link
					href="/support"
					className="btn-secondary flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors"
				>
					<FaTicketAlt />
					<span>Raise a ticket straight to the developers</span>{" "}
				</Link>
			</div>
		</div>
	);
};

export default NoProfileFound;
