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

console.log("🧪 Token Metrics Top Market Cap Tokens Adapter Test\n");

// Load the top market cap tokens adapter source code
const sourceCode = fs.readFileSync(
  "./functions/top-market-cap-tokens.js",
  "utf8"
);

// Helper function to decode top market cap tokens data
function decodeTopMarketCapTokensData(hexString) {
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
      `Failed to decode top market cap tokens data: ${error.message}`
    );
  }
}

// Test top market cap tokens
async function testTopMarketCapTokens() {
  console.log("Testing fetch top market cap tokens...");

  try {
    const result = await simulateScript({
      source: sourceCode,
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

    const tokenId = decodeTopMarketCapTokensData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Top Market Cap Tokens data:");
    console.log(`   Token ID: ${tokenId}`);
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

  await testTopMarketCapTokens();

  console.log("\n🏁 Done!");
}

main();
