import React from "react";

const ErrorPage = ({ error, retryCountdown }) => {
	return (
		<div className="mt-8 text-red-500">
			<p>{error}</p>
			{retryCountdown > 0 && (
				<p className="text-yellow-500">
					Failed to fetch, automatic retry in {retryCountdown} second
					{retryCountdown > 1 && "s"}
				</p>
			)}
		</div>
	);
};

export default ErrorPage;
