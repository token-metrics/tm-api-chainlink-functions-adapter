// Token Metrics Correlation API endpoint
const CORRELATION_API_URL = "https://api.tokenmetrics.com/v2/correlation";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

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

// Make HTTP request to Token Metrics Correlation API
const response = await Functions.makeHttpRequest({
  url: CORRELATION_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
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
    `Token Metrics Correlation API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Correlation API request failed: ${apiResponse?.message || "Unknown error"}`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No correlation data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (
  !item ||
  !item.TOP_CORRELATION ||
  !Array.isArray(item.TOP_CORRELATION) ||
  item.TOP_CORRELATION.length === 0
) {
  throw Error("Invalid correlation data received");
}

// Get the top correlated token
const topCorrelatedToken = item.TOP_CORRELATION[0]?.token;

if (!topCorrelatedToken) {
  throw Error("No top correlated token found");
}

// Return the encoded token
return Functions.encodeString(topCorrelatedToken);
