/**
 * Fetch Counter Utility
 * 
 * A debugging tool to track and log the number of fetch requests made during page load.
 * This helps verify that server-side subrequests stay below Cloudflare's 50 request limit.
 * 
 * Usage:
 * - Server-side: Import and use `countedFetch` instead of `fetch` in API routes
 * - Client-side: Call `enableFetchCounter()` to wrap the global fetch
 * 
 * Enable via environment variable: NEXT_PUBLIC_DEBUG_FETCH_COUNTER=true
 */

// Global counter for tracking requests
let requestCounter = 0;

/**
 * Check if fetch counting is enabled
 */
const isCounterEnabled = () => {
	if (typeof window !== "undefined") {
		// Client-side
		return process.env.NEXT_PUBLIC_DEBUG_FETCH_COUNTER === "true";
	}
	// Server-side
	return process.env.DEBUG_FETCH_COUNTER === "true" || 
		   process.env.NEXT_PUBLIC_DEBUG_FETCH_COUNTER === "true";
};

/**
 * Reset the request counter (useful at the start of a new request context)
 */
export const resetFetchCounter = () => {
	requestCounter = 0;
};

/**
 * Get the current request count
 */
export const getFetchCount = () => requestCounter;

/**
 * A fetch wrapper that counts and logs requests
 * Use this in place of fetch() when you want to track requests
 * 
 * @param {string|Request} input - The URL or Request object
 * @param {RequestInit} init - Optional fetch options
 * @returns {Promise<Response>}
 */
export const countedFetch = async (input, init) => {
	requestCounter++;
	const url = typeof input === "string" ? input : input.url;
	
	if (isCounterEnabled()) {
		console.log(`[Request Counter] Request #${requestCounter}: fetching ${url}`);
	}
	
	return fetch(input, init);
};

/**
 * Enable fetch counting globally on the client side
 * Call this once at app initialization to wrap the global fetch
 */
export const enableFetchCounter = () => {
	if (typeof window === "undefined") {
		console.warn("[Fetch Counter] enableFetchCounter should only be called on the client side");
		return;
	}

	if (!isCounterEnabled()) {
		return;
	}

	// Store the original fetch
	const originalFetch = window.fetch;

	// Replace global fetch with our counted version
	window.fetch = async (input, init) => {
		requestCounter++;
		const url = typeof input === "string" ? input : input.url;
		console.log(`[Request Counter] Request #${requestCounter}: fetching ${url}`);
		return originalFetch(input, init);
	};

	console.log("[Fetch Counter] Global fetch counter enabled");
};

/**
 * Log a summary of fetch requests made
 * Useful to call at the end of a server request or page load
 */
export const logFetchSummary = (context = "") => {
	if (isCounterEnabled()) {
		const prefix = context ? `[${context}] ` : "";
		console.log(`${prefix}[Request Counter] Total requests made: ${requestCounter}`);
		if (requestCounter > 50) {
			console.warn(`${prefix}[Request Counter] ⚠️ WARNING: Exceeded 50 subrequest limit!`);
		}
	}
};

/**
 * Create a scoped counter for tracking requests in a specific context
 * Useful for tracking requests within a single API route or component
 */
export const createScopedCounter = (scopeName) => {
	let scopedCount = 0;
	
	return {
		fetch: async (input, init) => {
			scopedCount++;
			requestCounter++;
			const url = typeof input === "string" ? input : input.url;
			
			if (isCounterEnabled()) {
				console.log(`[Request Counter] [${scopeName}] Request #${scopedCount} (global #${requestCounter}): fetching ${url}`);
			}
			
			return fetch(input, init);
		},
		getCount: () => scopedCount,
		logSummary: () => {
			if (isCounterEnabled()) {
				console.log(`[Request Counter] [${scopeName}] Total requests: ${scopedCount}`);
			}
		},
	};
};

export default {
	countedFetch,
	enableFetchCounter,
	resetFetchCounter,
	getFetchCount,
	logFetchSummary,
	createScopedCounter,
};

