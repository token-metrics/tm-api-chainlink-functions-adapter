// Token Metrics Hourly OHLCV API endpoint
const HOURLY_OHLCV_API_URL = "https://api.tokenmetrics.com/v2/hourly-ohlcv";
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

console.log(`Requested token ID: ${token_id}`);

// Make HTTP request to Token Metrics Hourly OHLCV API
const response = await Functions.makeHttpRequest({
  url: HOURLY_OHLCV_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
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
    `Token Metrics Hourly OHLCV API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Hourly OHLCV API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No hourly OHLCV data received for token_id: ${token_id}`);
}

const ohlcvData = apiResponse.data;
console.log(`Received hourly OHLCV data for token`);

// Get the first (and should be only) item from the response
const item = ohlcvData[0];
if (!item || typeof item.OPEN !== "number") {
  throw Error(`Invalid hourly OHLCV data received for token_id: ${token_id}`);
}

console.log(`Token ${item.TOKEN_ID}: Open Price ${item.OPEN}`);

// Convert OPEN price to wei (18 decimals)
const openPrice = ethers.parseUnits(item.OPEN.toString(), 18);

// Return the encoded OPEN price
return Functions.encodeUint256(openPrice);
