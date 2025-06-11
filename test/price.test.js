import { simulateScript, decodeResult } from "@chainlink/functions-toolkit";
import fs from "fs";
import dotenv from "dotenv";
import os from "os";
import { ethers } from "ethers";

// Load environment variables
dotenv.config();

// Ensure Deno is in PATH for Windows
if (os.platform() === "win32") {
  const denoPath = `${os.homedir()}\\.deno\\bin`;
  if (!process.env.PATH.includes(denoPath)) {
    process.env.PATH = `${process.env.PATH};${denoPath}`;
    console.log(`✅ Added Deno to PATH: ${denoPath}`);
  }
}

console.log(
  "🧪 Multi-Token Metrics Price Adapter Test (Simplified Encoding)\n"
);

// Load the ethers-encoded price adapter source code
const sourceCode = fs.readFileSync("./functions/price.js", "utf8");

// Helper function to decode custom ABI-encoded uint256 array
function decodeUint256Array(hexString) {
  // Remove 0x prefix if present
  const cleanHex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;

  // First 32 bytes (64 hex chars) represent the array length
  const lengthHex = cleanHex.slice(0, 64);
  const length = parseInt(lengthHex, 16);

  // Each subsequent 32 bytes represents a uint256 value
  const values = [];
  for (let i = 0; i < length; i++) {
    const start = 64 + i * 64;
    const end = start + 64;
    const valueHex = cleanHex.slice(start, end);
    values.push(BigInt("0x" + valueHex));
  }

  return values;
}

// Test function for multiple tokens
async function testSimplifiedEncoding() {
  console.log("Testing simplified encoding (34008,33305)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["34008,33305"], // Multiple token IDs - comma separated, no spaces
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000, // Longer timeout for ethers import
      numAllowedQueries: 1,
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      // Decode as bytes first
      const bytesData = decodeResult(result.responseBytesHexstring, "bytes");

      // Now decode the custom-encoded uint256 array
      const prices = decodeUint256Array(bytesData);

      console.log("✅ SUCCESS! Decoded price array:");
      console.log(`   Number of prices received: ${prices.length}`);

      // Display each price
      prices.forEach((price, index) => {
        const priceInUSD = ethers.formatEther(price);

        console.log(`   Token ${index + 1}:`);
        console.log(`     Price: $${Number(priceInUSD).toFixed(6)}`);
      });

      console.log(
        `   Response size: ${
          result.responseBytesHexstring.length / 2 - 1
        } bytes`
      );
    } else {
      console.log("❌ FAILED:", result.errorString);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Test single token
async function testSingleTokenSimplified() {
  console.log(
    "\nTesting single token with simplified encoding (USDT: 34008)..."
  );

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["34008"], // Single token ID
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
    });

    if (result.responseBytesHexstring && !result.errorString) {
      // Decode as bytes first
      const bytesData = decodeResult(result.responseBytesHexstring, "bytes");

      // Now decode the custom-encoded uint256 array
      const prices = decodeUint256Array(bytesData);

      if (prices.length > 0) {
        const price = prices[0];
        const priceInUSD = ethers.formatEther(price);

        console.log("✅ SUCCESS! Single token price:");
        console.log(`   Price: $${Number(priceInUSD).toFixed(6)}`);
        console.log(
          `   Response size: ${
            result.responseBytesHexstring.length / 2 - 1
          } bytes`
        );
      }
    } else {
      console.log("❌ FAILED:", result.errorString);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Run tests
async function main() {
  if (!process.env.TOKEN_METRICS_API_KEY) {
    console.log("⚠️  Set TOKEN_METRICS_API_KEY for real API testing");
  }

  await testSimplifiedEncoding();
  await testSingleTokenSimplified();

  console.log("\n🏁 Done!");
}

main();
