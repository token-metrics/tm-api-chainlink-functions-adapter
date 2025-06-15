import { simulateScript } from "@chainlink/functions-toolkit";
import fs from "fs";
import dotenv from "dotenv";
import os from "os";

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

console.log("🧪 Token Metrics Hourly Trading Signals Adapter Test\n");

// Load the hourly trading signals adapter source code
const sourceCode = fs.readFileSync(
  "./functions/hourly-trading-signals.js",
  "utf8"
);

// Helper function to decode hourly trading signals data
function decodeHourlyTradingSignalsData(hexString) {
  try {
    if (!hexString) {
      throw new Error("No hex string provided");
    }
    // Convert hex string to UTF-8 string
    const decoded = Buffer.from(hexString.slice(2), "hex").toString("utf8");
    if (!decoded) {
      throw new Error("Failed to decode string value");
    }
    return decoded;
  } catch (error) {
    throw new Error(
      `Failed to decode hourly trading signals data: ${error.message}`
    );
  }
}

// Test hourly trading signals
async function testHourlyTradingSignals() {
  console.log("Testing fetch hourly trading signals...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: ["36697"], // Using BTC token ID as an example
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

    const signal = decodeHourlyTradingSignalsData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Hourly Trading Signals data:");
    console.log(`   Token ID: 36697 (BTC)`);
    console.log(`   Signal: ${signal}`);
    console.log(
      `   Response size: ${result.responseBytesHexstring.length / 2 - 1} bytes`
    );
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

// Run tests
async function main() {
  if (!process.env.TOKEN_METRICS_API_KEY) {
    console.log("⚠️  Set TOKEN_METRICS_API_KEY for real API testing");
  }

  await testHourlyTradingSignals();

  console.log("\n🏁 Done!");
}

main(); 