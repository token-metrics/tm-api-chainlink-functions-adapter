# Token Metrics Chainlink Functions Adapter

**Query Token Metrics token price data from any smart contract using Chainlink Functions.**  
Supports secure per-user API keys via DON secrets.  
No server required — fully decentralized.

---

## 🚀 Overview

This Chainlink Functions Adapter allows smart contracts to securely query Token Metrics API for token price data — enabling powerful Web3 use cases such as:

✅ Onchain token analytics  
✅ Trading signals  
✅ Automated portfolio management  
✅ AI-driven DeFi apps  
✅ NFT pricing mechanisms  
✅ Token-gated experiences  

---

## ⚙️ How it works

- Smart contract sends a Chainlink Functions request
- Request includes:
  - Adapter source.js (JS logic to query Token Metrics API)
  - Arguments (token_id)
  - Secure per-user API key (via DON-hosted secrets URL)
- Chainlink Functions Node runs source.js → calls Token Metrics API
- Result is returned to smart contract → fulfillRequest()

---

## 🖼 Architecture

```text
Smart Contract → Chainlink Functions Router → Chainlink Functions Node → Token Metrics API → Result → Smart Contract
