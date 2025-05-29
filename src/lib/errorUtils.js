/**
 * Utility functions for error handling across the application
 */

/**
 * Extract detailed error information from a failed API response
 * @param {Response} response - The failed fetch response
 * @returns {Promise<Object>} - Detailed error object with message, code, details, etc.
 */
export async function extractErrorMessage(response) {
	let errorInfo = {
		message: `HTTP ${response.status}: ${response.statusText}`,
		status: response.status,
		statusText: response.statusText,
	};

	try {
		// Try to parse JSON error response for detailed information
		const errorData = await response.json();

		// Check for various possible error message fields and extract detailed information
		if (errorData.error) {
			errorInfo.message = errorData.error;
		} else if (errorData.message) {
			errorInfo.message = errorData.message;
		} else if (errorData.details) {
			errorInfo.message = errorData.details;
		} else if (typeof errorData === "string") {
			errorInfo.message = errorData;
		}

		// Extract additional error details if available
		if (errorData.code) {
			errorInfo.code = errorData.code;
		}
		if (errorData.details) {
			errorInfo.details = errorData.details;
		}
		if (errorData.hint) {
			errorInfo.hint = errorData.hint;
		}
		if (errorData.stack && process.env.NODE_ENV === "development") {
			errorInfo.stack = errorData.stack;
		}

		// If no specific error fields found, include the raw response
		if (
			!errorData.error &&
			!errorData.message &&
			!errorData.details &&
			typeof errorData !== "string"
		) {
			errorInfo.rawResponse = errorData;
		}
	} catch (parseError) {
		// If JSON parsing fails, try to get text content
		try {
			const errorText = await response.text();
			if (errorText) {
				errorInfo.message = `${errorInfo.message} - ${errorText}`;
			}
		} catch (textError) {
			// If both JSON and text parsing fail, use the original HTTP error
			console.warn("Failed to parse error response:", textError);
		}
	}

	return errorInfo;
}

/**
 * Create a comprehensive error object with all available information
 * @param {Error} error - The original error
 * @param {string} context - Additional context about where the error occurred
 * @returns {object} - Detailed error object
 */
export function createDetailedError(error, context = "") {
	const errorDetails = {
		message: error.message || "Unknown error occurred",
		context,
		timestamp: new Date().toISOString(),
	};

	// Include stack trace in development
	if (process.env.NODE_ENV === "development") {
		errorDetails.stack = error.stack;
	}

	// Include specific database error information if available
	if (error.code) {
		errorDetails.code = error.code;
	}

	if (error.details) {
		errorDetails.details = error.details;
	}

	if (error.hint) {
		errorDetails.hint = error.hint;
	}

	return errorDetails;
}

/**
 * Enhanced fetch wrapper that provides better error handling
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - The response data or throws detailed error
 */
export async function fetchWithErrorHandling(url, options = {}) {
	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			const errorInfo = await extractErrorMessage(response);
			const error = new Error(errorInfo.message);

			// Attach additional error details to the error object
			error.status = errorInfo.status;
			error.statusText = errorInfo.statusText;
			if (errorInfo.code) error.code = errorInfo.code;
			if (errorInfo.details) error.details = errorInfo.details;
			if (errorInfo.hint) error.hint = errorInfo.hint;
			if (errorInfo.stack) error.serverStack = errorInfo.stack;
			if (errorInfo.rawResponse) error.rawResponse = errorInfo.rawResponse;

			throw error;
		}

		return await response.json();
	} catch (error) {
		// If it's already our enhanced error, re-throw it
		if (error.status || error.code || error.details) {
			throw error;
		}

		// Otherwise, create a basic detailed error
		const enhancedError = new Error(
			error.message || "Network or parsing error occurred"
		);
		enhancedError.originalError = error;
		enhancedError.context = `Fetching ${url}`;
		throw enhancedError;
	}
}

/**
 * Format error information for display to users
 * @param {Error|Object} error - The error object
 * @returns {Object} - Formatted error information for display
 */
export function formatErrorForDisplay(error) {
	const errorDisplay = {
		primaryMessage: error.message || "Unknown error occurred",
		details: [],
	};

	// Add HTTP status information if available
	if (error.status) {
		errorDisplay.details.push(
			`Status: ${error.status} ${error.statusText || ""}`
		);
	}

	// Add error code if available
	if (error.code) {
		errorDisplay.details.push(`Code: ${error.code}`);
	}

	// Add detailed error information if available
	if (error.details && error.details !== error.message) {
		errorDisplay.details.push(`Details: ${error.details}`);
	}

	// Add helpful hints if available
	if (error.hint) {
		errorDisplay.details.push(`Hint: ${error.hint}`);
	}

	// Add context if available
	if (error.context) {
		errorDisplay.details.push(`Context: ${error.context}`);
	}

	// Include stack trace in development
	if (process.env.NODE_ENV === "development") {
		if (error.stack) {
			errorDisplay.stack = error.stack;
		}
		if (error.serverStack) {
			errorDisplay.serverStack = error.serverStack;
		}
	}

	return errorDisplay;
}
