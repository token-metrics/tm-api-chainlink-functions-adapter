// Token Metrics Crypto Investors API endpoint
const CRYPTO_INVESTORS_API_URL = "https://api.tokenmetrics.com/v2/crypto-investors";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Make HTTP request to Token Metrics Crypto Investors API
const response = await Functions.makeHttpRequest({
  url: CRYPTO_INVESTORS_API_URL,
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
    `Token Metrics Crypto Investors API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Crypto Investors API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No crypto investors data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.INVESTOR_NAME !== "string") {
  throw Error("Invalid crypto investors data received");
}

// Return the investor name as a string
return Functions.encodeString(item.INVESTOR_NAME); 