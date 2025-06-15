// Token Metrics Trader Grades API endpoint
const TRADER_GRADES_API_URL = "https://api.tokenmetrics.com/v2/trader-grades";
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

// Make HTTP request to Token Metrics Trader Grades API
const response = await Functions.makeHttpRequest({
  url: TRADER_GRADES_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    token_id,
    limit: 1,
    page: 1,
  },
});

if (response.error) {
  throw Error(
    `Token Metrics Trader Grades API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Trader Grades API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No trader grades data received for token_id: ${token_id}`);
}

const gradesData = apiResponse.data;
console.log(`Received trader grades data for token`);

// Get the first (and should be only) item from the response
const item = gradesData[0];
if (!item || typeof item.TM_TRADER_GRADE !== "number") {
  throw Error(
    `Invalid trader grades data received for token_id: ${token_id}`
  );
}

const traderGrade = ethers.parseUnits(item.TM_TRADER_GRADE.toString(), 18);

return Functions.encodeUint256(traderGrade);

