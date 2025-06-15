// Token Metrics Daily OHLCV API endpoint
const DAILY_OHLCV_API_URL = "https://api.tokenmetrics.com/v2/daily-ohlcv";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Get token_id from args
const token_id = args[0];

if (!token_id) {
  throw Error("token_id is required as first argument");
}

if (token_id.includes(",")) {
  throw Error("token_id must be a single token ID, not a comma-separated list");
}

// Make HTTP request to Token Metrics Daily OHLCV API
const response = await Functions.makeHttpRequest({
  url: DAILY_OHLCV_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    token_id,
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
    `Token Metrics Daily OHLCV API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Daily OHLCV API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No daily OHLCV data received for token_id: ${token_id}`);
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.OPEN !== "number") {
  throw Error(
    `Invalid daily OHLCV data received for token_id: ${token_id}`
  );
}

// Convert OPEN price to wei (18 decimals)
const openPrice = ethers.parseUnits(item.OPEN.toString(), 18);

// Return the encoded OPEN price
return Functions.encodeUint256(openPrice); 