// Helper: ABI encode uint256[]
function abiEncodeUint256Array(values) {
  const encodedValues = values.map((val) => val.toString(16).padStart(64, "0"));

  // Encode array length as first 32 bytes
  const lengthEncoded = values.length.toString(16).padStart(64, "0");

  const fullEncoded = "0x" + lengthEncoded + encodedValues.join("");

  return fullEncoded;
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

// Example: token_id = "34008,33305" (multiple tokens separated by comma)
const token_id = args[0];

if (!token_id) {
  throw Error("token_id is required as first argument");
}

// Parse token IDs to maintain order
const requestedTokenIds = token_id.split(',').map(id => id.trim());
console.log(`Requested token IDs in order: ${requestedTokenIds.join(', ')}`);

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
console.log(`Received ${priceData.length} price entries`);

// Create a map of token_id -> price for quick lookup
const priceMap = {};
priceData.forEach(item => {
  const tokenId = item.TOKEN_ID?.toString();
  if (tokenId && typeof item.CURRENT_PRICE === 'number') {
    priceMap[tokenId] = item.CURRENT_PRICE;
    console.log(`Token ${tokenId}: $${item.CURRENT_PRICE}`);
  }
});

// Order prices according to the args order
const orderedPrices = [];
for (const tokenId of requestedTokenIds) {
  const price = priceMap[tokenId];
  if (price === undefined) {
    throw Error(`Price not found for token_id: ${tokenId}`);
  }
  orderedPrices.push(ethers.parseUnits(price.toString(), 18));
}

console.log(`Returning ${orderedPrices.length} prices in requested order`);

// ABI encode array in the correct order
const encodedArray = abiEncodeUint256Array(orderedPrices);

// Return encoded array
return ethers.getBytes(encodedArray);
