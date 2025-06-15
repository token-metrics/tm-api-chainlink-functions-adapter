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

console.log("🧪 Token Metrics Tokens Adapter Test\n");

// Load the tokens adapter source code
const sourceCode = fs.readFileSync("./functions/tokens.js", "utf8");

// Helper function to decode token data
function decodeTokenData(hexString) {
  try {
    // The response is a simple string (either token symbol or token ID)
    return ethers.toUtf8String(hexString);
  } catch (error) {
    throw new Error(`Failed to decode token data: ${error.message}`);
  }
}

// Test with token ID
async function testTokenById() {
  console.log("Testing fetch token by ID (34008)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["34008", "", ""],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      const tokenSymbol = decodeTokenData(result.responseBytesHexstring);

      console.log("✅ SUCCESS! Token data:");
      console.log(`   Symbol: ${tokenSymbol}`);
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

// Test with token name
async function testTokenByName() {
  console.log("\nTesting fetch token by name (Bitcoin)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["", "Bitcoin", ""],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      const tokenId = decodeTokenData(result.responseBytesHexstring);

      console.log("✅ SUCCESS! Token data:");
      console.log(`   ID: ${tokenId}`);
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

// Test with symbol
async function testTokenBySymbol() {
  console.log("\nTesting fetch token by symbol (BTC)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["", "", "BTC"],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      const tokenId = decodeTokenData(result.responseBytesHexstring);

      console.log("✅ SUCCESS! Token data:");
      console.log(`   ID: ${tokenId}`);
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

// Test with no parameters
async function testNoParameters() {
  console.log("\nTesting fetch token with no parameters...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["", "", ""],
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      maxExecutionTimeMs: 15000,
      numAllowedQueries: 1,
      returnType: "bytes",
    });

    console.log("Simulation completed");

    if (result.responseBytesHexstring && !result.errorString) {
      const tokenId = decodeTokenData(result.responseBytesHexstring);

      console.log("✅ SUCCESS! Token data:");
      console.log(`   ID: ${tokenId}`);
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

// Run tests
async function main() {
  if (!process.env.TOKEN_METRICS_API_KEY) {
    console.log("⚠️  Set TOKEN_METRICS_API_KEY for real API testing");
  }

  await testTokenById();
  await testTokenByName();
  await testTokenBySymbol();
  await testNoParameters();

  console.log("\n🏁 Done!");
}

main(); 