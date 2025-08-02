// Token Metrics Trading Signals API endpoint
const TRADING_SIGNALS_API_URL =
  "https://api.tokenmetrics.com/v2/trading-signals";

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

// Make HTTP request to Token Metrics Trading Signals API
const response = await Functions.makeHttpRequest({
  url: TRADING_SIGNALS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
    "x-integration": "chainlink",
  },
  params: {
    token_id,
    limit: 1,
    page: 1,
  },
});

if (response.error) {
  throw Error(
    `Token Metrics Trading Signals API failed: ${response.error.message}`
  );
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Trading Signals API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No trading signals data received for token_id: ${token_id}`);
}

const signalsData = apiResponse.data;
console.log(`Received trading signals data for token`);

// Get the first (and should be only) item from the response
const item = signalsData[0];
if (!item) {
  throw Error(
    `Invalid trading signals data received for token_id: ${token_id}`
  );
}

console.log(`Token ${item.TOKEN_ID}: Trading Signal ${item.TRADING_SIGNAL}`);

// Return the trading signal as a string
return Functions.encodeString(item.TRADING_SIGNAL.toString());
