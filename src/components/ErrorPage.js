import React, { useState } from "react";
import Image from "next/image";
import {
	FaExclamationTriangle,
	FaSyncAlt,
	FaRedo,
	FaSadTear,
	FaChevronDown,
	FaChevronUp,
	FaCode,
} from "react-icons/fa";
import PropTypes from "prop-types";
import { formatErrorForDisplay } from "@/lib/errorUtils";

const ErrorPage = ({ error, retryCountdown, onRetry }) => {
	const [showDetails, setShowDetails] = useState(false);

	// Format the error for display, handling both string and object errors
	const errorInfo =
		typeof error === "string"
			? { primaryMessage: error, details: [] }
			: formatErrorForDisplay(error || {});

	return (
		<div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto">
			<div className="relative w-28 h-28 mb-6">
				<div className="absolute inset-0 bg-[--error] opacity-20 rounded-full blur-xl"></div>
				<div className="relative z-10 w-full h-full flex items-center justify-center bg-[--card-bg] rounded-full border border-[--card-border] shadow-lg">
					<FaExclamationTriangle className="text-[--error] text-4xl" />
				</div>
			</div>

			<h2 className="text-2xl font-bold mb-4 text-center">
				Something Went Wrong
			</h2>

			<div className="card-highlight p-4 mb-6 w-full text-center">
				<p className="text-[--text-secondary] mb-3">Error Details:</p>
				<div className="bg-[--card-bg] p-3 rounded-lg text-sm overflow-x-auto text-left">
					<div className="font-mono text-[--error] mb-2">
						{errorInfo.primaryMessage}
					</div>

					{/* Show additional details if available */}
					{errorInfo.details && errorInfo.details.length > 0 && (
						<div className="mt-3">
							<button
								onClick={() => setShowDetails(!showDetails)}
								className="flex items-center text-[--text-secondary] hover:text-[--primary] transition-colors text-xs mb-2"
							>
								{showDetails ? (
									<FaChevronUp className="mr-1" />
								) : (
									<FaChevronDown className="mr-1" />
								)}
								{showDetails ? "Hide Details" : "Show Details"}
							</button>

							{showDetails && (
								<div className="border-t border-[--card-border] pt-2">
									{errorInfo.details.map((detail, index) => (
										<div
											key={index}
											className="text-[--text-secondary] text-xs mb-1 font-mono"
										>
											{detail}
										</div>
									))}

									{/* Development-only stack traces */}
									{process.env.NODE_ENV === "development" &&
										(errorInfo.stack || errorInfo.serverStack) && (
											<div className="mt-3 border-t border-[--card-border] pt-2">
												<div className="flex items-center text-[--warning] text-xs mb-2">
													<FaCode className="mr-1" />
													Development Stack Traces
												</div>
												{errorInfo.stack && (
													<details className="text-xs text-[--text-secondary] mb-2">
														<summary className="cursor-pointer hover:text-[--primary]">
															Client Stack
														</summary>
														<pre className="mt-1 whitespace-pre-wrap break-all">
															{errorInfo.stack}
														</pre>
													</details>
												)}
												{errorInfo.serverStack && (
													<details className="text-xs text-[--text-secondary]">
														<summary className="cursor-pointer hover:text-[--primary]">
															Server Stack
														</summary>
														<pre className="mt-1 whitespace-pre-wrap break-all">
															{errorInfo.serverStack}
														</pre>
													</details>
												)}
											</div>
										)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{retryCountdown > 0 ? (
				<div className="flex flex-col items-center">
					<p className="text-[--warning] mb-3 flex items-center">
						<FaSyncAlt className="animate-spin mr-2" />
						Retrying automatically in {retryCountdown} second
						{retryCountdown !== 1 ? "s" : ""}
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
					<button onClick={onRetry} className="btn-primary flex items-center">
						<FaRedo className="mr-2" />
						Try Again Now
					</button>

					<p className="mt-6 text-sm text-[--text-secondary] text-center max-w-xs">
						If this problem persists, please join our Discord server for
						support, or try again later.
					</p>
				</div>
			)}
		</div>
	);
};

export default ErrorPage;

ErrorPage.propTypes = {
	error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	retryCountdown: PropTypes.number.isRequired,
	onRetry: PropTypes.func.isRequired,
};
