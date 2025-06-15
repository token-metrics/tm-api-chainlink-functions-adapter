// Token Metrics Indices Holdings API endpoint
const INDICES_HOLDINGS_API_URL = "https://api.tokenmetrics.com/v2/indices-holdings";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Get id from args
const indexId = args[0];

if (!indexId) {
  throw Error("id is required");
}

// Make HTTP request to Token Metrics Indices Holdings API
const response = await Functions.makeHttpRequest({
  url: INDICES_HOLDINGS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    id: indexId,
  },
  timeout: REQUEST_TIMEOUT,
});

if (response.error) {
  if (response.error.message.includes("timeout")) {
    throw Error("Request timed out. Please try again.");
  }
  throw Error(
    `Token Metrics Indices Holdings API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Indices Holdings API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data)
) {
  throw Error("No indices holdings data received");
}

// Return the encoded number of holdings
return Functions.encodeUint256(apiResponse.data.length); 