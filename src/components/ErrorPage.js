import React from "react";
import Image from "next/image";
import { FaExclamationTriangle, FaSyncAlt, FaRedo, FaSadTear } from "react-icons/fa";

const ErrorPage = ({ error, retryCountdown, onRetry }) => {
	return (
		<div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto">
			<div className="relative w-28 h-28 mb-6">
				<div className="absolute inset-0 bg-[--error] opacity-20 rounded-full blur-xl"></div>
				<div className="relative z-10 w-full h-full flex items-center justify-center bg-[--card-bg] rounded-full border border-[--card-border] shadow-lg">
					<FaExclamationTriangle className="text-[--error] text-4xl" />
				</div>
			</div>

			<h2 className="text-2xl font-bold mb-4 text-center">Something Went Wrong</h2>

			<div className="card-highlight p-4 mb-6 w-full text-center">
				<p className="text-[--text-secondary] mb-3">Error Details:</p>
				<div className="bg-[--card-bg] p-3 rounded-lg font-mono text-sm overflow-x-auto">
					{error || "Unknown error occurred"}
				</div>
			</div>

			{retryCountdown > 0 ? (
				<div className="flex flex-col items-center">
					<p className="text-[--warning] mb-3 flex items-center">
						<FaSyncAlt className="animate-spin mr-2" />
						Retrying automatically in {retryCountdown} second{retryCountdown !== 1 ? 's' : ''}
					</p>
					<div className="w-full bg-[--card-bg] h-2 rounded-full overflow-hidden">
						<div
							className="h-full bg-[--warning] transition-all duration-1000 ease-linear"
							style={{ width: `${(retryCountdown / 10) * 100}%` }}
						></div>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center">
					<button
						onClick={onRetry}
						className="btn-primary flex items-center"
					>
						<FaRedo className="mr-2" />
						Try Again Now
					</button>

					<p className="mt-6 text-sm text-[--text-secondary] text-center max-w-xs">
						If this problem persists, please join our Discord server for support, or try again later.
					</p>
				</div>
			)}
		</div>
	);
};

export default ErrorPage;