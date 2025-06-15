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

console.log("🧪 Token Metrics Indices Holdings Adapter Test\n");

// Load the indices holdings adapter source code
const sourceCode = fs.readFileSync(
  "./functions/indices-holdings.js",
  "utf8"
);

// Helper function to decode indices holdings data
function decodeIndicesHoldingsData(hexString) {
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
      `Failed to decode indices holdings data: ${error.message}`
    );
  }
}

// Test indices holdings
async function testIndicesHoldings() {
  // Test case 1: Valid index ID
  console.log("\nTest Case 1: Valid index ID");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: ['5'], // Using index ID 1 as an example
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

    const numberOfHoldings = decodeIndicesHoldingsData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Indices Holdings data:");
    console.log(`   Index ID: 5`);
    console.log(`   Number of Holdings: ${numberOfHoldings}`);
    console.log(
      `   Response size: ${result.responseBytesHexstring.length / 2 - 1} bytes`
    );
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  // Test case 2: Invalid index ID
  console.log("\nTest Case 2: Invalid index ID");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: ["999999"], // Using an invalid index ID
      maxExecutionTimeMs: 12000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      console.log("✅ SUCCESS! Expected error for invalid index ID:");
      console.log(`   Error: ${result.errorString}`);
    } else {
      console.log("❌ FAILED: Expected error for invalid index ID but got success");
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  // Test case 3: Missing index ID
  console.log("\nTest Case 3: Missing index ID");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: [], // No index ID provided
      maxExecutionTimeMs: 12000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    if (!result) {
      throw new Error("No result received from simulation");
    }

    if (result.errorString) {
      console.log("✅ SUCCESS! Expected error for missing index ID:");
      console.log(`   Error: ${result.errorString}`);
    } else {
      console.log("❌ FAILED: Expected error for missing index ID but got success");
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

  await testIndicesHoldings();

  console.log("\n🏁 Done!");
}

main(); 