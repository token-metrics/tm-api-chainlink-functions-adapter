// Token Metrics Sentiment API endpoint
const SENTIMENT_API_URL = "https://api.tokenmetrics.com/v2/sentiments";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Make HTTP request to Token Metrics Sentiment API
const response = await Functions.makeHttpRequest({
  url: SENTIMENT_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
  },
  timeout: REQUEST_TIMEOUT,
});

if (response.error) {
  if (response.error.message.includes("timeout")) {
    throw Error("Request timed out. Please try again.");
  }
  throw Error(
    `Token Metrics Sentiment API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Sentiment API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No sentiment data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.MARKET_SENTIMENT_GRADE !== "number") {
  throw Error("Invalid sentiment data received");
}

// Convert sentiment grade to wei (18 decimals)
const sentimentGrade = ethers.parseUnits(item.MARKET_SENTIMENT_GRADE.toString(), 18);

// Return the encoded sentiment grade
return Functions.encodeUint256(sentimentGrade); 