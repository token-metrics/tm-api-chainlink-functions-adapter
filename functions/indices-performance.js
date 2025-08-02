// Token Metrics Indices Performance API endpoint
const INDICES_PERFORMANCE_API_URL = "https://api.tokenmetrics.com/v2/indices-performance";
const REQUEST_TIMEOUT = 15000; // 15 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

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

// Make HTTP request to Token Metrics Indices Performance API
const response = await Functions.makeHttpRequest({
  url: INDICES_PERFORMANCE_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
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
    `Token Metrics Indices Performance API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Indices Performance API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0 ||
  !apiResponse.data[0].INDEX_CUMULATIVE_ROI
) {
  throw Error("No indices performance data received");
}

const cumulativeROI = ethers.parseUnits(apiResponse.data[0].INDEX_CUMULATIVE_ROI.toString(), 18);

// Return the encoded cumulative ROI
return Functions.encodeUint256(cumulativeROI); 