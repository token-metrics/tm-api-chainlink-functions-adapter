const { ethers } = await import("npm:ethers@6.10.0");
const { JsonRpcProvider } = ethers;

// Token Metrics Tokens API endpoint
const TOKENS_API_URL = "https://api.tokenmetrics.com/v2/tokens";

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Optional parameters that can be passed as args
// args[0] = token_id (optional) - Filter by token ID
// args[1] = token_name (optional) - Filter by token name
// args[2] = symbol (optional) - Filter by token symbol
const token_id = args[0] || "";
const token_name = args[1] || "";
const symbol = args[2] || "";

// Build query parameters
const params = {};
if (token_id) params.token_id = token_id;
if (token_name) params.token_name = token_name;
if (symbol) params.symbol = symbol;
params.limit = 1;
params.page = 1;

console.log(`Fetching tokens with params:`, params);

// Make HTTP request to Token Metrics Tokens API
const response = await Functions.makeHttpRequest({
  url: TOKENS_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params,
});

if (response.error) {
  throw Error(`Token Metrics Tokens API failed: ${response.error.message}`);
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Tokens API request failed: ${apiResponse?.message || "Unknown error"}`
  );
}

if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
  throw Error("No token data received from API");
}

const tokens = apiResponse.data;
console.log(`Received ${tokens.length} tokens`);

if (tokens.length === 0) {
  throw Error("No tokens found");
}

// Format token data for response
const formattedTokens = {
  TOKEN_ID: tokens[0].TOKEN_ID,
  TOKEN_SYMBOL: tokens[0].TOKEN_SYMBOL,
  TOKEN_NAME: tokens[0].TOKEN_NAME,
};

let result = "";
if (token_id) {
  result = Functions.encodeString(formattedTokens.TOKEN_SYMBOL);
} else {
  result = Functions.encodeString(formattedTokens.TOKEN_ID);
}

return result;
