import { Functions } from "@chainlink/functions-toolkit";

// Token Metrics API mapping:
const apiUrls = {
    TOKENS: "https://api.tokenmetrics.com/v2/tokens",
    TRADER_GRADES: "https://api.tokenmetrics.com/v2/trader-grades",
    HOURLY_OHLCV: "https://api.tokenmetrics.com/v2/hourly-ohlcv",
    DAILY_OHLCV: "https://api.tokenmetrics.com/v2/daily-ohlcv",
    INVESTOR_GRADES: "https://api.tokenmetrics.com/v2/investor-grades",
    MARKET_METRICS: "https://api.tokenmetrics.com/v2/market-metrics",
    TRADING_SIGNALS: "https://api.tokenmetrics.com/v2/trading-signals",
    AI_REPORTS: "https://api.tokenmetrics.com/v2/ai-reports",
    CRYPTO_INVESTORS: "https://api.tokenmetrics.com/v2/crypto-investors",
    TOP_TOKENS: "https://api.tokenmetrics.com/v2/top-tokens-by-market-cap",
    RESISTANCE_SUPPORT: "https://api.tokenmetrics.com/v2/resistance-support",
    HOURLY_TRADING_SIGNALS: "https://api.tokenmetrics.com/v2/hourly-trading-signals",
    PRICE: "https://api.tokenmetrics.com/v2/price",
    SENTIMENT: "https://api.tokenmetrics.com/v2/sentiment",
    QUANTMETRICS: "https://api.tokenmetrics.com/v2/quantmetrics",
    SCENARIO_ANALYSIS: "https://api.tokenmetrics.com/v2/scenario-analysis",
    CORRELATION: "https://api.tokenmetrics.com/v2/correlation",
    INDICES: "https://api.tokenmetrics.com/v2/indices",
    INDICES_HOLDINGS: "https://api.tokenmetrics.com/v2/indices-holdings",
    INDICES_PERFORMANCE: "https://api.tokenmetrics.com/v2/indices-performance"
};

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
    throw Error("API_KEY is required for Token Metrics API");
}

// Get endpoint identifier from args[0]
const endpointKey = args[0]; // Example: "TOKENS", "PRICE", "TRADING_SIGNALS"

// Check if API endpoint exists
if (!apiUrls[endpointKey]) {
    throw Error(`Unknown API endpoint: ${endpointKey}. Available endpoints: ${Object.keys(apiUrls).join(', ')}`);
}

// Build URL with token_id parameter
let url = apiUrls[endpointKey];
let token_id = args[1];
if (token_id) {
    url += `?token_id=${token_id}`;
}

// Make HTTP request to Token Metrics API
const response = await Functions.makeHttpRequest({
    url: url,
    headers: {
        "x-api-key": `${apiKey}`,
        "accept": "application/json"
    },
});

if (response.error) {
    throw Error(`Token Metrics API ${endpointKey} failed: ${response.error.message}`);
}

// Extract data from API response
// Token Metrics API returns: { success: true, data: [...] }
const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
    throw Error(`API request failed: ${apiResponse?.message || 'Unknown error'}`);
}

if (!apiResponse.data || !Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
    throw Error(`No data received from Token Metrics API endpoint: ${endpointKey}`);
}

// Get the first data item
const dataItem = apiResponse.data[0];

// Handle different response types based on endpoint
let result;
switch (endpointKey) {
    case "PRICE":
        // Price endpoint returns CURRENT_PRICE
        result = dataItem.CURRENT_PRICE;
        if (typeof result !== 'number') {
            throw Error(`Invalid price data received: ${JSON.stringify(dataItem)}`);
        }
        return Functions.encodeUint256(Math.floor(result * 100)); // Multiply by 100 to preserve 2 decimal places

    case "TRADING_SIGNALS":
    case "HOURLY_TRADING_SIGNALS":
        // Trading signals might return a signal strength or recommendation
        result = dataItem.signal || dataItem.recommendation || dataItem.score;
        if (typeof result === 'string') {
            return Functions.encodeString(result);
        }
        return Functions.encodeUint256(Math.floor(result * 100));

    case "TRADER_GRADES":
    case "INVESTOR_GRADES":
        // Grades typically return a score or grade
        result = dataItem.grade || dataItem.score || dataItem.rating;
        return Functions.encodeUint256(Math.floor(result * 100));

    case "SENTIMENT":
        // Sentiment might return a score between -1 and 1, or 0-100
        result = dataItem.sentiment_score || dataItem.score;
        return Functions.encodeUint256(Math.floor((result + 1) * 50)); // Convert -1,1 range to 0,100

    case "TOKENS":
        // For tokens endpoint, return the count of tokens
        return Functions.encodeUint256(apiResponse.data.length);

    default:
        // For other endpoints, try to extract a numeric value
        result = dataItem.value || dataItem.price || dataItem.score || dataItem.rating;
        if (typeof result === 'string') {
            return Functions.encodeString(result);
        }
        if (typeof result === 'number') {
            return Functions.encodeUint256(Math.floor(result * 100));
        }
        // If no numeric value found, return the raw data as string
        return Functions.encodeString(JSON.stringify(dataItem));
}
  