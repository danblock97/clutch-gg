/**
 * Functions for scraping ladder ranking data from OP.GG
 */

/**
 * Scrape League of Legends ladder ranking data from OP.GG
 * @param {string} gameName - The player's game name
 * @param {string} tagLine - The player's tag line
 * @param {string} region - The player's region (e.g., 'euw', 'na', etc.)
 * @returns {Promise<Object>} - The ladder ranking data
 */
export const scrapeLeagueLadderRanking = async (gameName, tagLine, region) => {
  try {
    // Use the API endpoint to fetch ladder ranking data
    const apiUrl = `/api/league/ladderRanking?gameName=${encodeURIComponent(
      gameName
    )}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
      region
    )}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ladder ranking: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error scraping League ladder ranking:", error);
    return null;
  }
};

/**
 * Scrape TFT ladder ranking data from OP.GG
 * @param {string} gameName - The player's game name
 * @param {string} tagLine - The player's tag line
 * @param {string} region - The player's region (e.g., 'euw', 'na', etc.)
 * @returns {Promise<Object>} - The ladder ranking data
 */
export const scrapeTFTLadderRanking = async (gameName, tagLine, region) => {
  try {
    // Use the API endpoint to fetch TFT ladder ranking data
    const apiUrl = `/api/tft/ladderRanking?gameName=${encodeURIComponent(
      gameName
    )}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
      region
    )}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch TFT ladder ranking: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error scraping TFT ladder ranking:", error);
    return null;
  }
};
