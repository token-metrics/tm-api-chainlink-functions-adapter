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

console.log("🧪 Token Metrics AI Reports Adapter Test\n");

// Load the AI reports adapter source code
const sourceCode = fs.readFileSync("./functions/ai-reports.js", "utf8");

// Helper function to decode AI reports data
function decodeAIReportsData(hexString) {
  try {
    if (!hexString) {
      throw new Error("No hex string provided");
    }
    // Convert hex string to UTF-8 string
    const bytes = Buffer.from(hexString.slice(2), "hex");
    return bytes.toString("utf8");
  } catch (error) {
    throw new Error(`Failed to decode AI reports data: ${error.message}`);
  }
}

// Test with token ID
async function testAIReports() {
  console.log("Testing fetch AI reports for token ID (3375)...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      args: ["3375"],
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

    const investmentAnalysis = decodeAIReportsData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! AI Reports data:");
    console.log("   Investment Analysis:");
    console.log("   " + investmentAnalysis.split("\n").join("\n   "));
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

  await testAIReports();
  await testInvalidInput();

  console.log("\n🏁 Done!");
}

main(); 