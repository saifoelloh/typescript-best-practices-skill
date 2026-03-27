const fs = require('fs');
const path = require('path');

/**
 * Async Code Smell Detector
 * 
 * Rules:
 * 1. Don't use forEach with async functions (use for...of or Promise.all).
 */

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const smells = [];

  lines.forEach((line, index) => {
    // Detect forEach with async callback
    if (line.includes('.forEach(async') || line.includes('.forEach( async')) {
      smells.push(`Line ${index + 1}: Potential async forEach smell. Use for...of or Promise.all instead.`);
    }
  });

  return smells;
}

const target = process.argv[2] || './src';
console.log(`Checking async smells in: ${target}`);
