/**
 * URL helper functions for profile routes
 * Converts between query params and clean URL slugs
 */

/**
 * Creates a URL-friendly slug from gameName and tagLine
 * Format: gameName-tagLine (with special characters encoded)
 * @param {string} gameName - The game name
 * @param {string} tagLine - The tag line
 * @returns {string} URL-friendly slug
 */
export function createProfileSlug(gameName, tagLine) {
	if (!gameName || !tagLine) return null;
	
	// Normalize: trim and encode special characters
	const normalizedGameName = encodeURIComponent(gameName.trim());
	const normalizedTagLine = encodeURIComponent(tagLine.trim());
	
	return `${normalizedGameName}-${normalizedTagLine}`;
}

/**
 * Decodes a profile slug back to gameName and tagLine
 * @param {string} slug - The URL slug (format: gameName-tagLine)
 * @returns {{gameName: string, tagLine: string} | null}
 */
export function decodeProfileSlug(slug) {
	if (!slug) return null;
	
	const parts = slug.split('-');
	if (parts.length < 2) return null;
	
	// The last part is always the tagLine, everything before is gameName
	// This handles game names with hyphens
	const tagLine = decodeURIComponent(parts[parts.length - 1]);
	const gameName = decodeURIComponent(parts.slice(0, -1).join('-'));
	
	return { gameName, tagLine };
}

/**
 * Normalizes region to lowercase for URL
 * @param {string} region - Region code (e.g., "EUW1", "KR")
 * @returns {string} Lowercase region
 */
export function normalizeRegionForUrl(region) {
	if (!region) return null;
	return region.toLowerCase();
}

/**
 * Denormalizes region from URL to API format
 * @param {string} region - Lowercase region from URL
 * @returns {string} Uppercase region for API
 */
export function denormalizeRegionFromUrl(region) {
	if (!region) return null;
	return region.toUpperCase();
}

/**
 * Builds a profile URL using the new clean format
 * @param {string} gameType - "league" or "tft"
 * @param {string} region - Region code
 * @param {string} gameName - Game name
 * @param {string} tagLine - Tag line
 * @returns {string} Clean profile URL
 */
export function buildProfileUrl(gameType, region, gameName, tagLine) {
	const normalizedRegion = normalizeRegionForUrl(region);
	const slug = createProfileSlug(gameName, tagLine);
	if (!slug || !normalizedRegion) return null;
	return `/${gameType}/profile/${normalizedRegion}/${slug}`;
}

/**
 * Parses a profile URL to extract parameters
 * @param {string} pathname - The pathname (e.g., "/league/profile/euw/Faker-KR1")
 * @returns {{gameType: string, region: string, gameName: string, tagLine: string} | null}
 */
export function parseProfileUrl(pathname) {
	if (!pathname) return null;
	
	const match = pathname.match(/\/(league|tft)\/profile\/([^\/]+)\/(.+)/);
	if (!match) return null;
	
	const [, gameType, region, slug] = match;
	const decoded = decodeProfileSlug(slug);
	if (!decoded) return null;
	
	return {
		gameType,
		region: denormalizeRegionFromUrl(region),
		gameName: decoded.gameName,
		tagLine: decoded.tagLine,
	};
}

