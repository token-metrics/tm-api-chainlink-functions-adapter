# Token Metrics Chainlink Functions Adapter

**Query Token Metrics data from any smart contract using Chainlink Functions.**  
Supports secure per-user API keys via DON secrets.  
No server required — fully decentralized.

---

## 🚀 Overview

This Chainlink Functions Adapter allows smart contracts to securely query Token Metrics API for various data points — enabling powerful Web3 use cases such as:

✅ Onchain token analytics  
✅ Trading signals  
✅ TOKEN pricing  
✅ Token-gated experiences

---

## 📊 Available Adapters

### 1. Price
- **Input**: Token ID
- **Output**: Token price (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 2. Tokens
- **Input**: Token ID
- **Output**: Token data as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 3. Trading Signals
- **Input**: Token ID
- **Output**: Trading signal as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 4. Hourly OHLCV
- **Input**: Token ID
- **Output**: OHLCV data as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 5. Daily OHLCV
- **Input**: Token ID
- **Output**: OHLCV data as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 6. Trader Grades
- **Input**: Token ID
- **Output**: Trader grade as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 7. Investor Grades
- **Input**: Token ID
- **Output**: Investor grade as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 8. Market Metrics
- **Input**: Token ID
- **Output**: Market metrics as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 9. AI Reports
- **Input**: Token ID
- **Output**: AI report as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 10. Crypto Investors
- **Input**: Token ID
- **Output**: Investor data as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 11. Top Market Cap Tokens
- **Input**: None
- **Output**: Token ID as string
- **Test Cases**:
  - Valid API response
  - API timeout handling
  - Missing API key

### 12. Resistance & Support
- **Input**: Token ID
- **Output**: Top historical resistance/support level (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 13. Token Metrics AI (TMAI)
- **Input**: User message
- **Output**: AI's answer (limited to 256 characters)
- **Test Cases**:
  - Valid message
  - Empty message
  - API timeout handling

### 14. Hourly Trading Signals
- **Input**: Token ID
- **Output**: Trading signal as string
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 15. Sentiment
- **Input**: None
- **Output**: Market sentiment grade (multiplied by 1e18)
- **Test Cases**:
  - Valid API response
  - API timeout handling
  - Missing API key

### 16. Quantmetrics
- **Input**: Token ID
- **Output**: Volatility (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 17. Scenario Analysis
- **Input**: Token ID
- **Output**: Predicted prices (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 18. Correlation
- **Input**: Token ID
- **Output**: Correlation value (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 19. Indices
- **Input**: None
- **Output**: Index ticker as string
- **Test Cases**:
  - Valid API response
  - API timeout handling
  - Missing API key

### 20. Indices Holdings
- **Input**: Index ID
- **Output**: Number of holdings as uint256
- **Test Cases**:
  - Valid index ID
  - Invalid index ID
  - Missing index ID

### 21. Indices Performance
- **Input**: Index ID
- **Output**: Cumulative ROI (multiplied by 1e18)
- **Test Cases**:
  - Valid index ID
  - Invalid index ID
  - Missing index ID

---

## ⚙️ How it works

- Smart contract sends a Chainlink Functions request
- Request includes:
  - Adapter source.js (JS logic to query Token Metrics API)
  - Arguments (if required by the adapter)
  - Secure per-user API key (via DON-hosted secrets URL)
- Chainlink Functions Node runs source.js → calls Token Metrics API
- Result is returned to smart contract → fulfillRequest()

---

## 🖼 Architecture

```text
Smart Contract → Chainlink Functions Router → Chainlink Functions Node → Token Metrics API → Result → Smart Contract
```

---

## 🧪 Testing

Each adapter includes comprehensive test cases to ensure reliability:

- Valid input scenarios
- Invalid input handling
- Missing input handling
- API timeout handling
- Error response handling

To run tests:

```bash
node test/<adapter-name>.test.js

npm run test <adapter-name>.test.js
```

Required environment variables:

- `TOKEN_METRICS_API_KEY`: Your Token Metrics API key
