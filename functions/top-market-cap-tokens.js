// Token Metrics Top Market Cap Tokens API endpoint
const TOP_MARKET_CAP_TOKENS_API_URL =
  "https://api.tokenmetrics.com/v2/top-market-cap-tokens";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Make HTTP request to Token Metrics Top Market Cap Tokens API
const response = await Functions.makeHttpRequest({
  url: TOP_MARKET_CAP_TOKENS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
  },
  params: {
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
    `Token Metrics Top Market Cap Tokens API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Top Market Cap Tokens API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No top market cap tokens data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.TOKEN_ID !== "number") {
  throw Error("Invalid top market cap tokens data received");
}

// Return the encoded token ID
return Functions.encodeString(item.TOKEN_ID.toString());
