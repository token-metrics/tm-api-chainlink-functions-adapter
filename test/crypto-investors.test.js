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

console.log("🧪 Token Metrics Crypto Investors Adapter Test\n");

// Load the crypto investors adapter source code
const sourceCode = fs.readFileSync("./functions/crypto-investors.js", "utf8");

// Helper function to decode crypto investors data
function decodeCryptoInvestorsData(hexString) {
  try {
    if (!hexString) {
      throw new Error("No hex string provided");
    }
    // Convert hex string to UTF-8 string
    const bytes = Buffer.from(hexString.slice(2), "hex");
    return bytes.toString("utf8");
  } catch (error) {
    throw new Error(`Failed to decode crypto investors data: ${error.message}`);
  }
}

// Test crypto investors
async function testCryptoInvestors() {
  console.log("Testing fetch crypto investors...");

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

    const investorName = decodeCryptoInvestorsData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Crypto Investors data:");
    console.log(`   Investor Name: ${investorName}`);
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

  await testCryptoInvestors();

  console.log("\n🏁 Done!");
}

main(); 