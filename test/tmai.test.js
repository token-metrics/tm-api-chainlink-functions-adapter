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

console.log("🧪 Token Metrics AI Adapter Test\n");

// Load the Token Metrics AI adapter source code
const sourceCode = fs.readFileSync(
  "./functions/tmai.js",
  "utf8"
);

// Helper function to decode Token Metrics AI data
function decodeTMAIData(hexString) {
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
      `Failed to decode Token Metrics AI data: ${error.message}`
    );
  }
}

// Test Token Metrics AI
async function testTMAI() {
  console.log("Testing Token Metrics AI...");

  try {
    const result = await simulateScript({
      source: sourceCode,
      secrets: {
        API_KEY: process.env.TOKEN_METRICS_API_KEY || "test-key",
      },
      args: ["What is the next 100x coin?"], // Example question
      maxExecutionTimeMs: 20000, // Increased to account for API timeout
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

    const answer = decodeTMAIData(result.responseBytesHexstring);

    console.log("✅ SUCCESS! Token Metrics AI response:");
    console.log(`   Question: What is the next 100x coin?`);
    console.log(`   Answer: ${answer}`);
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

  await testTMAI();

  console.log("\n🏁 Done!");
}

main(); 