const fs = require('fs');
const path = require('path');

/**
 * Error Handling Smell Detector
 * 
 * Rules:
 * 1. No empty catch blocks.
 * 2. Don't throw strings/literals (throw Error objects).
 */

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const smells = [];

  lines.forEach((line, index) => {
    // Detect empty catch
    if (line.match(/catch\s*\(.*\)\s*\{\s*\}/)) {
      smells.push(`Line ${index + 1}: Empty catch block detected.`);
    }
    // Detect throw string
    if (line.match(/throw\s+['"].*['"]/)) {
      smells.push(`Line ${index + 1}: Thrown string literal detected. Throw an Error object instead.`);
    }
  });

  return smells;
}

const target = process.argv[2] || './src';
console.log(`Checking error handling smells in: ${target}`);
