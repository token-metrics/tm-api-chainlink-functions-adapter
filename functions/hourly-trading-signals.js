// Token Metrics Hourly Trading Signals API endpoint
const HOURLY_TRADING_SIGNALS_API_URL = "https://api.tokenmetrics.com/v2/hourly-trading-signals";
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

// Make HTTP request to Token Metrics Hourly Trading Signals API
const response = await Functions.makeHttpRequest({
  url: HOURLY_TRADING_SIGNALS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    token_id: tokenId,
  },
  timeout: REQUEST_TIMEOUT,
});

if (response.error) {
  if (response.error.message.includes("timeout")) {
    throw Error("Request timed out. Please try again.");
  }
  throw Error(
    `Token Metrics Hourly Trading Signals API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Hourly Trading Signals API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No hourly trading signals data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.SIGNAL !== "string") {
  throw Error("Invalid hourly trading signals data received");
}

// Return the encoded signal
return Functions.encodeString(item.SIGNAL); 