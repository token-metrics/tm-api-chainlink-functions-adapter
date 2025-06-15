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

console.log("🧪 Token Metrics Trading Signals Adapter Test\n");

// Load the trading signals adapter source code
const sourceCode = fs.readFileSync("./functions/trading-signals.js", "utf8");

// Helper function to decode trading signal data
function decodeTradingSignalData(hexString) {
  try {
    // The response is a simple string containing the trading signal value
    return ethers.toUtf8String(hexString);
  } catch (error) {
    throw new Error(`Failed to decode trading signal data: ${error.message}`);
  }
}

// Test with token ID
async function testTradingSignal() {
  console.log("Testing fetch trading signal for token ID (36697)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["36697"],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      const tradingSignal = decodeTradingSignalData(result.responseBytesHexstring);

      console.log("✅ SUCCESS! Trading signal data:");
      console.log(`   Signal: ${tradingSignal}`);
      console.log(
        `   Response size: ${result.responseBytesHexstring.length / 2 - 1} bytes`
      );
    } else {
      console.log("❌ FAILED:", result.errorString);
    }
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
      args: ["34008,33305"],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

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

  await testTradingSignal();
  await testInvalidInput();

  console.log("\n🏁 Done!");
}

main(); 