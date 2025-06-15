// Token Metrics Resistance & Support API endpoint
const RESISTANCE_SUPPORT_API_URL = "https://api.tokenmetrics.com/v2/resistance-support";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Get token_id from args
const tokenId = args[0];

if (!tokenId) {
  throw Error("token_id is required");
}

// Make HTTP request to Token Metrics Resistance & Support API
const response = await Functions.makeHttpRequest({
  url: RESISTANCE_SUPPORT_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    token_id: tokenId,
    limit: 1,
    page: 1,
  },
  timeout: REQUEST_TIMEOUT,
});

if (response.error) {
  if (response.error.message.includes("timeout")) {
    throw Error("Request timed out. Please try again.");
  }
  throw Error(
    `Token Metrics Resistance & Support API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Resistance & Support API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data[0].HISTORICAL_RESISTANCE_SUPPORT_LEVELS) ||
  apiResponse.data[0].HISTORICAL_RESISTANCE_SUPPORT_LEVELS.length === 0
) {
  throw Error("No resistance and support levels data received");
}

// Get the first (top) level from the response
const topLevel = apiResponse.data[0].HISTORICAL_RESISTANCE_SUPPORT_LEVELS[0];
if (!topLevel || typeof topLevel.level !== "number") {
  throw Error("Invalid resistance and support level data received");
}

const level = ethers.parseUnits(topLevel.level.toString(), 18);

// Return the encoded level
return Functions.encodeUint256(level); 