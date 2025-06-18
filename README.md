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

## 🔄 Development Flow

1. **Create JavaScript Adapter Script**
   - Implement the source code that will be executed off-chain by Chainlink DON nodes
   - Handle API calls, data processing, and error handling
   - Test the adapter script locally

2. **Encrypt and Upload Secrets**
   - Encrypt sensitive data (API keys, credentials)
   - Upload to Chainlink's DON (Decentralized Oracle Network) or use offchain storage (self hosting service)
   - Store encrypted secrets URL securely

3. **Create Smart Contract**
   - Implement contract inheriting from FunctionsClient and ConfirmedOwner
   - Add state variables for request tracking
   - Implement sendRequest and fulfillRequest functions
   - Deploy to target chain (e.g., Sepolia testnet)

4. **Setup Subscription**
   - Create a Chainlink Functions subscription
   - Fund it with LINK tokens for oracle execution fees
   - Get subscription ID for contract configuration

5. **Add Consumer Contract**
   - Add your deployed contract as a consumer to the subscription
   - This authorizes your contract to use the subscription's LINK balance

6. **Test Integration**
   - Use Remix or hardhat for testing
   - Send test requests through your consumer contract
   - Verify response handling and data storage

---

## 📊 Available Adapters

All adapters follow a consistent implementation pattern:
- Inherit from FunctionsClient and ConfirmedOwner
- Use Chainlink Sepolia configuration
- Include state variables for request tracking
- Contain inline JavaScript for API calls
- Implement sendRequest and fulfillRequest functions
- Provide getter functions for stored data
- Handle API errors, timeouts, and data validation

### 1. Price
- **Input**: Token ID
- **Output**: Token price (multiplied by 1e18)
- **Test Cases**:
  - Valid token ID
  - Invalid token ID
  - Missing token ID

### 2. Tokens
- **Input**: Token ID or Token Symbol/Name
- **Output**: 
  - If input is Token ID → returns Token Symbol
  - If input is Token Symbol/Name → returns Token ID
- **Test Cases**:
  - Valid token ID
  - Valid token symbol
  - Valid token name
  - Invalid input
  - Missing input

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

Each adapter includes comprehensive test cases to ensure reliability and exact compatibility with their JavaScript counterparts:

- Valid input scenarios
- Invalid input handling
- Missing input handling
- API timeout handling
- Error response handling
- Response processing validation
- State variable consistency
- Type checking and validation

Key testing focus areas:
- Error message consistency
- API endpoint URLs accuracy
- Parameter handling
- Response processing
- State variable naming
- Type checking and validation

To run tests:

```bash
# Test specific adapter
node test/<adapter-name>.test.js

# or 
npm run test <adapter-name>.test.js

# Run default test (price.test.js)
npm run test
```

Required environment variables:

- `TOKEN_METRICS_API_KEY`: Your Token Metrics API key
- `PRIVATE_KEY`: Your wallet private key for contract deployment
- `SUBSCRIPTION_ID`: Chainlink Functions subscription ID

## 📁 Project Structure

```
├── contracts/               # Solidity smart contracts
│   ├── ai-reports.sol
│   ├── price.sol
│   ├── indices.sol
│   └── ... (other adapters)
├── functions/                    # JavaScript adapter source code
│   ├── ai-reports.js
│   ├── price.js
│   ├── indices.js
│   └── ... (other adapters)
├── test/                   # Test files
│   ├── ai-reports.test.js
│   ├── price.test.js
│   ├── indices.test.js
│   └── ... (other adapters)
└── README.md
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
