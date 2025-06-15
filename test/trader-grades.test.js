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

console.log("🧪 Token Metrics Trader Grades Adapter Test\n");

// Load the trader grades adapter source code
const sourceCode = fs.readFileSync("./functions/trader-grades.js", "utf8");

// Helper function to decode trader grade data
function decodeTraderGradeData(hexString) {
  try {
    // The response is a simple string containing the trader grade value
    const abi = new ethers.AbiCoder();
    const decoded = abi.decode(["uint256"], hexString);
    return decoded[0].toString();
  } catch (error) {
    throw new Error(`Failed to decode trader grade data: ${error.message}`);
  }
}

// Test with token ID
async function testTraderGrade() {
  console.log("Testing fetch trader grade for token ID (36697)...");

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
      const traderGrade = decodeTraderGradeData(result.responseBytesHexstring);
      const traderGradeNumber = ethers.formatUnits(traderGrade, 18);

      console.log("✅ SUCCESS! Trader grade data:");
      console.log(`   Grade: ${traderGradeNumber}`);
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
      args: ["36697,33305"],
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

  await testTraderGrade();
  await testInvalidInput();

  console.log("\n🏁 Done!");
}

main(); 