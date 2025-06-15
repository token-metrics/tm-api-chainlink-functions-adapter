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

console.log("🧪 Token Metrics Scenario Analysis Adapter Test\n");

// Load the scenario analysis adapter source code
const sourceCode = fs.readFileSync(
  "./functions/scenario-analysis.js",
  "utf8"
);

// Helper function to decode scenario analysis data
function decodeScenarioAnalysisData(hexString) {
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
    throw new Error(
      `Failed to decode scenario analysis data: ${error.message}`
    );
  }
}

// Test scenario analysis
async function testScenarioAnalysis() {
  // Test case 1: Valid token ID (TMAI)
  console.log("\nTest Case 1: Valid token ID (TMAI)");
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

    const predictedPrice = decodeScenarioAnalysisData(result.responseBytesHexstring);
    const predictedPriceInDecimal = ethers.formatEther(predictedPrice);

    console.log("✅ SUCCESS! Scenario Analysis data:");
    console.log(`   Token ID: 36697 (TMAI)`);
    console.log(`   Moon Scenario Predicted Price: ${Number(predictedPriceInDecimal)}`);
    console.log(
      `   Response size: ${result.responseBytesHexstring.length / 2 - 1} bytes`
    );
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  // Test case 2: Invalid token ID
  console.log("\nTest Case 2: Invalid token ID");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: ["999999"], // Using an invalid token ID
      maxExecutionTimeMs: 12000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      console.log("✅ SUCCESS! Expected error for invalid token ID:");
      console.log(`   Error: ${result.errorString}`);
    } else {
      console.log("❌ FAILED: Expected error for invalid token ID but got success");
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  // Test case 3: Missing token ID
  console.log("\nTest Case 3: Missing token ID");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: [], // No token ID provided
      maxExecutionTimeMs: 12000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      console.log("✅ SUCCESS! Expected error for missing token ID:");
      console.log(`   Error: ${result.errorString}`);
    } else {
      console.log("❌ FAILED: Expected error for missing token ID but got success");
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

  await testScenarioAnalysis();

  console.log("\n🏁 Done!");
}

main(); 