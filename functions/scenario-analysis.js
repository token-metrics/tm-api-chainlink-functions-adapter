// Token Metrics Scenario Analysis API endpoint
const SCENARIO_ANALYSIS_API_URL =
  "https://api.tokenmetrics.com/v2/scenario-analysis";
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

// Make HTTP request to Token Metrics Scenario Analysis API
const response = await Functions.makeHttpRequest({
  url: SCENARIO_ANALYSIS_API_URL,
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
    `Token Metrics Scenario Analysis API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Scenario Analysis API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error("No scenario analysis data received");
}

// Get the first (and should be only) item from the response
const item = apiResponse.data[0];
if (
  !item ||
  !item.SCENARIO_PREDICTION ||
  !item.SCENARIO_PREDICTION.scenario_prediction
) {
  throw Error("Invalid scenario analysis data received");
}

const moonScenario =
  item.SCENARIO_PREDICTION.scenario_prediction[0]?.predicted_price_moon;

if (!moonScenario || typeof moonScenario !== "number") {
  throw Error("No moon scenario prediction found");
}

// Convert predicted price to wei (18 decimals)
// First convert to string with fixed precision to avoid floating point issues
const predictedPriceStr = moonScenario.toFixed(18);
// Remove trailing zeros after decimal point
const cleanPredictedPriceStr = predictedPriceStr.replace(/\.?0+$/, '');
const predictedPrice = ethers.parseUnits(cleanPredictedPriceStr, 18);

// Return the encoded predicted price
return Functions.encodeUint256(predictedPrice);
