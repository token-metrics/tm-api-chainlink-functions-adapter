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

console.log("🧪 Token Metrics Indices Adapter Test\n");

// Load the indices adapter source code
const sourceCode = fs.readFileSync(
  "./functions/indices.js",
  "utf8"
);

// Helper function to decode indices data
function decodeIndicesData(hexString) {
  try {
    if (!hexString) {
      throw new Error("No hex string provided");
    }
    // Convert hex to UTF-8 string
    const bytes = Buffer.from(hexString.slice(2), 'hex');
    return bytes.toString('utf8');
  } catch (error) {
    throw new Error(
      `Failed to decode indices data: ${error.message}`
    );
  }
}

// Test indices
async function testIndices() {
  console.log("Testing fetch indices...");
  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: [], // No arguments needed
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

    const ticker = decodeIndicesData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Indices data:");
    console.log(`   Ticker: ${ticker}`);
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

  await testIndices();

  console.log("\n🏁 Done!");
}

main(); 