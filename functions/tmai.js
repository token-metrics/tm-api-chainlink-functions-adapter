// Token Metrics AI API endpoint
const TMAI_API_URL = "https://api.tokenmetrics.com/v2/tmai";
const REQUEST_TIMEOUT = 20000; // 10 seconds timeout

const { ethers } = await import("npm:ethers@6.10.0");

// Read API key from secrets (required for Token Metrics API)
const apiKey = secrets?.API_KEY;

if (!apiKey) {
  throw Error("API_KEY is required for Token Metrics API");
}

// Get user message from args
const userMessage = args[0];

if (!userMessage) {
  throw Error("user message is required");
}

// Make HTTP request to Token Metrics AI API
const response = await Functions.makeHttpRequest({
  url: TMAI_API_URL,
  method: "POST",
  headers: {
    "x-api-key": `${apiKey}`,
    "Content-Type": "application/json",
    accept: "application/json",
    "x-integration": "chainlink",
  },
  data: {
    messages: [
      {
        user: userMessage,
      },
    ],
  },
  timeout: REQUEST_TIMEOUT,
});

if (response.error) {
  if (response.error.message.includes("timeout")) {
    throw Error("Request timed out. Please try again.");
  }
  throw Error(`Token Metrics AI API failed: ${response.error.message}`);
}

const apiResponse = response.data;

if (!apiResponse || !apiResponse.success) {
  throw Error(
    `Token Metrics AI API request failed: ${
      apiResponse?.message || "Unknown error"
    }`
  );
}

if (!apiResponse.data || !apiResponse.data.answer) {
  throw Error("No answer received from Token Metrics AI");
}

const encodedAnswer = Functions.encodeString(apiResponse.data.answer);

return encodedAnswer.slice(0, 256);