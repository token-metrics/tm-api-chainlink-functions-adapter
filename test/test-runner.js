#!/usr/bin/env node

// Simple test runner for dynamic test file selection
import path from "path";
import { spawn } from "child_process";

// Get test file name from command line args, default to 'price.test.js'
const testFile = process.argv[2] || "price.test.js";
const testPath = path.join("test", testFile);

console.log(`🚀 Running test: ${testFile}\n`);

// Spawn node process to run the test file
const testProcess = spawn("node", [testPath], {
  stdio: "inherit",
  cwd: process.cwd(),
});

testProcess.on("close", (code) => {
  process.exit(code);
});

testProcess.on("error", (error) => {
  console.error(`❌ Error running test: ${error.message}`);
  process.exit(1);
});
