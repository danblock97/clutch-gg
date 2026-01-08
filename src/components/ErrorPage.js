"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRedo, FaHome, FaTicketAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import { formatErrorForDisplay } from "@/lib/errorUtils";

const ErrorPage = ({
	error,
	onRetry,
	showHomeButton = true,
	showContactSupport = true,
	title,
	fullPage = true,
}) => {
	const router = useRouter();

	// Format the error for display, handling both string and object errors
	const errorInfo =
		typeof error === "string"
			? { primaryMessage: error, details: [] }
			: formatErrorForDisplay(error || {});

	// Get the raw error object for accessing status, code, hint
	const errorObj = typeof error === "object" ? error : {};

	const containerClasses = fullPage
		? "flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 text-center"
		: "p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-center";

	return (
		<div className={containerClasses}>
			{/* Bee Image with Dramatic Glow Effect */}
			{fullPage && (
				<div className="relative mb-12">
					{/* Multiple layered glows for more drama */}
					<div className="absolute inset-0 bg-yellow-500/30 blur-3xl scale-150 rounded-full"></div>
					<div className="absolute inset-0 bg-yellow-400/20 blur-2xl scale-125 rounded-full"></div>
					<div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full"></div>
					<Image
						src="/images/bee-sad.png"
						alt="Error"
						height={200}
						width={200}
						className="relative z-10 drop-shadow-2xl"
					/>
				</div>
			)}

			{/* Giant Bold Title */}
			<h1
				className={
					fullPage
						? "text-5xl sm:text-6xl md:text-7xl font-black mb-6 text-white tracking-tight leading-none"
						: "text-lg font-bold mb-2"
				}
			>
				{title || "Something Went Wrong"}
			</h1>

			{/* Primary Error Message - Big and Bold */}
			{fullPage && (
				<p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 mb-12 max-w-4xl leading-tight">
					{errorInfo.primaryMessage}
				</p>
			)}

			{/* Error Details Grid - Clean, no borders */}
			{fullPage && (
				<div className="w-full max-w-3xl space-y-8 mb-12">
					{/* Status Code */}
					{errorObj.status && (
						<div className="space-y-2">
							<div className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
								Status Code
							</div>
							<div className="text-5xl font-black text-white font-mono">
								{errorObj.status}
							</div>
							{errorObj.statusText && (
								<div className="text-xl text-gray-300">
									{errorObj.statusText}
								</div>
							)}
						</div>
					)}

					{/* Error Code */}
					{errorObj.code && (
						<div className="space-y-2">
							<div className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
								Error Code
							</div>
							<div className="text-4xl font-black text-red-400 font-mono tracking-wide">
								{errorObj.code}
							</div>
						</div>
					)}

					{/* Hint */}
					{errorObj.hint && (
						<div className="space-y-2">
							<div className="text-lg font-semibold text-yellow-400 uppercase tracking-wider">
								💡 Hint
							</div>
							<div className="text-2xl font-semibold text-yellow-300">
								{errorObj.hint}
							</div>
						</div>
					)}

					{/* Additional Details */}
					{errorInfo.details && errorInfo.details.length > 0 && (
						<div className="space-y-3">
							<div className="text-lg font-semibold text-gray-400 uppercase tracking-wider">
								Details
							</div>
							<div className="space-y-2">
								{errorInfo.details.map((detail, index) => (
									<div
										key={index}
										className="text-base text-gray-300 font-mono"
									>
										{detail}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Development Stack Traces - More prominent */}
					{process.env.NODE_ENV === "development" &&
						(errorInfo.stack || errorInfo.serverStack) && (
							<div className="space-y-4 pt-8">
								<div className="text-xl font-bold text-yellow-400 uppercase tracking-wider">
									🔧 Development Stack Traces
								</div>
								{errorInfo.stack && (
									<div className="space-y-2">
										<h4 className="text-lg font-bold text-yellow-300">
											Client Stack:
										</h4>
										<pre className="text-sm text-gray-400 whitespace-pre-wrap break-all font-mono leading-relaxed max-h-96 overflow-y-auto">
											{errorInfo.stack}
										</pre>
									</div>
								)}
								{errorInfo.serverStack && (
									<div className="space-y-2">
										<h4 className="text-lg font-bold text-yellow-300">
											Server Stack:
										</h4>
										<pre className="text-sm text-gray-400 whitespace-pre-wrap break-all font-mono leading-relaxed max-h-96 overflow-y-auto">
											{errorInfo.serverStack}
										</pre>
									</div>
								)}
							</div>
						)}
				</div>
			)}

			{/* Inline variant - simplified */}
			{!fullPage && (
				<div className="space-y-2">
					<p className="font-mono text-sm text-[--error] break-words">
						{errorInfo.primaryMessage}
					</p>
				</div>
			)}

			{/* Action Buttons - Bigger and bolder */}
			<div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
				{/* Retry Button */}
				{onRetry && (
					<button
						onClick={onRetry}
						className="btn-primary flex-1 py-5 px-8 text-xl font-bold flex items-center justify-center transition-transform hover:scale-105"
					>
						<FaRedo className="mr-3 text-2xl" />
						Try Again
					</button>
				)}

				{/* Home Button */}
				{showHomeButton && fullPage && (
					<button
						onClick={() => router.push("/")}
						className="btn-outline flex-1 py-5 px-8 text-xl font-bold flex items-center justify-center transition-transform hover:scale-105"
					>
						<FaHome className="mr-3 text-2xl" />
						Back to Home
					</button>
				)}

				{/* Contact Support Button */}
				{showContactSupport && fullPage && (
					<button
						onClick={() => router.push("/support")}
						className="btn-secondary flex-1 py-5 px-8 text-xl font-bold flex items-center justify-center transition-transform hover:scale-105"
					>
						<FaTicketAlt className="mr-3 text-2xl" />
						Contact Support
					</button>
				)}
			</div>

			{/* Footer - Bigger text */}
			{fullPage && (
				<p className="mt-12 text-lg text-gray-400 text-center max-w-2xl">
					If this problem persists, please join our Discord server for support,
					or try again later.
				</p>
			)}
		</div>
	);
};

ErrorPage.propTypes = {
	error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	onRetry: PropTypes.func,
	showHomeButton: PropTypes.bool,
	showContactSupport: PropTypes.bool,
	title: PropTypes.string,
	fullPage: PropTypes.bool,
};

export default ErrorPage;
