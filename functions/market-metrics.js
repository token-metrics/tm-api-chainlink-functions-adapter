// Token Metrics Market Metrics API endpoint
const MARKET_METRICS_API_URL = "https://api.tokenmetrics.com/v2/market-metrics";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Make HTTP request to Token Metrics Market Metrics API
const response = await Functions.makeHttpRequest({
  url: MARKET_METRICS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
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
    `Token Metrics Market Metrics API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Market Metrics API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No market metrics data received for token_id: ${token_id}`);
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.TOTAL_CRYPTO_MCAP !== "number") {
  throw Error(`Invalid market metrics data received for token_id: ${token_id}`);
}

// Convert total crypto market cap to wei (18 decimals)
const totalMarketCap = ethers.parseUnits(item.TOTAL_CRYPTO_MCAP.toString(), 18);

// Return the encoded total market cap
return Functions.encodeUint256(totalMarketCap);
