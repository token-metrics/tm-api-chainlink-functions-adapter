import { simulateScript } from "@chainlink/functions-toolkit";
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

console.log("🧪 Token Metrics Daily OHLCV Adapter Test\n");

// Load the daily OHLCV adapter source code
const sourceCode = fs.readFileSync("./functions/daily-ohlcv.js", "utf8");

// Helper function to decode OHLCV data
function decodeOHLCVData(hexString) {
  try {
    if (!hexString) {
      throw new Error("No hex string provided");
    }
    const abi = new ethers.AbiCoder();
    const decoded = abi.decode(["uint256"], hexString);
    if (!decoded || !decoded[0]) {
      throw new Error("Failed to decode uint256 value");
    }
    return decoded[0].toString();
  } catch (error) {
    throw new Error(`Failed to decode OHLCV data: ${error.message}`);
  }
}

// Test with token ID
async function testOHLCV() {
  console.log("Testing fetch daily OHLCV for token ID (36697)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["36697"],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 12000, // Increased to account for API timeout
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      if (result.errorString.includes("timeout")) {
        console.log("⚠️ WARNING: Request timed out. Please try again.");
      } else {
        console.log("❌ FAILED:", result.errorString);
      }
      return;
    }

    if (!result.responseBytesHexstring) {
      console.log("❌ FAILED: No response bytes received");
      return;
    }

    const openPrice = decodeOHLCVData(result.responseBytesHexstring);
    const priceInUSD = ethers.formatEther(openPrice);

    console.log("✅ SUCCESS! Daily OHLCV data:");
    console.log(`   Open Price: $${Number(priceInUSD).toFixed(6)}`);
    console.log(
      `   Response size: ${result.responseBytesHexstring.length / 2 - 1} bytes`
    );
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Test with invalid input (multiple tokens)
async function testInvalidInput() {
  console.log("\nTesting invalid input (multiple tokens)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["36697,33305"],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 12000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      console.log("✅ SUCCESS! Correctly rejected multiple tokens:");
      console.log(`   Error: ${result.errorString}`);
    } else {
      console.log("❌ FAILED: Should have rejected multiple tokens");
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

  await testOHLCV();
  await testInvalidInput();

  console.log("\n🏁 Done!");
}

main(); 