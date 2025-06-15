// Token Metrics AI Reports API endpoint
const AI_REPORTS_API_URL = "https://api.tokenmetrics.com/v2/ai-reports";
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

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

// Make HTTP request to Token Metrics AI Reports API
const response = await Functions.makeHttpRequest({
  url: AI_REPORTS_API_URL,
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
    `Token Metrics AI Reports API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `AI Reports API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No AI reports data received for token_id: ${token_id}`);
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (!item || typeof item.INVESTMENT_ANALYSIS !== "string") {
  throw Error(
    `Invalid AI reports data received for token_id: ${token_id}`
  );
}

const encodedAnalysis = Functions.encodeString(item.INVESTMENT_ANALYSIS);

return encodedAnalysis.slice(0, 256);
