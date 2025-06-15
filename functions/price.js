// Helper function to convert 0x hex string to Uint8Array
function hexStringToUint8Array(hexString) {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Token Metrics Price API endpoint
const PRICE_API_URL = "https://api.tokenmetrics.com/v2/price";

// Import ethers for ABI encoding
const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Get single token_id from args
const token_id = args[0];

if (!token_id) {
  throw Error("token_id is required as first argument");
}

if (token_id.includes(",")) {
  throw Error("token_id must be a single token ID, not a comma-separated list");
}

console.log(`Requested token ID: ${token_id}`);

// Make HTTP request to Token Metrics Price API
const response = await Functions.makeHttpRequest({
  url: PRICE_API_URL,
  headers: {
    "x-api-key": `${apiKey}`,
    accept: "application/json",
  },
  params: {
    token_id,
  },
});

if (response.error) {
  throw Error(`Token Metrics Price API failed: ${response.error.message}`);
}

// Token Metrics API returns: { success: true, message: "", length: 1, data: [...] }
const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Price API request failed: ${apiResponse?.message || "Unknown error"}`
  );
}

if (
  !apiResponse.data ||
  !Array.isArray(apiResponse.data) ||
  apiResponse.data.length === 0
) {
  throw Error(`No price data received for token_id: ${token_id}`);
}

const priceData = apiResponse.data;
console.log(`Received price data for token`);

// Get the first (and should be only) item from the response
const item = priceData[0];
if (!item || typeof item.CURRENT_PRICE !== "number") {
  throw Error(`Invalid price data received for token_id: ${token_id}`);
}

console.log(
  `Token ${item.TOKEN_ID}: $${item.CURRENT_PRICE} (${
    item.TOKEN_NAME || item.NAME || ""
  })`
);

// Convert price to wei (18 decimals)
const price = ethers.parseUnits(item.CURRENT_PRICE.toString(), 18);

// Return encoded data as Uint8Array for Chainlink Functions
return Functions.encodeUint256(price);
