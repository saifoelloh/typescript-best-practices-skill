const fs = require('fs');
const path = require('path');

/**
 * Strategy Pattern Smell Detector
 * 
 * Searches for 'switch' statements or long 'if/else if' chains
 * that are candidates for the Strategy Pattern.
 */

function findSmells(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const smells = [];

  let switchCount = 0;
  let currentSwitchLine = 0;

  lines.forEach((line, index) => {
    // Detect switch statements
    if (line.includes('switch (') || line.includes('switch(')) {
      switchCount++;
      currentSwitchLine = index + 1;
    }

    // Heuristic: switch statements with many cases (> 3)
    // This is a simple counter, for real use use an AST parser like ts-morph
    if (line.includes('case ') && switchCount > 0) {
      // In a real script, we'd count cases per switch
    }

    // Detect long if-else-if chains
    if (line.includes('else if') && line.includes('===')) {
      smells.push(`Line ${index + 1}: Potential Strategy smell (long if/else chain).`);
    }
  });

  if (switchCount > 0) {
    smells.push(`Found ${switchCount} switch statement(s). Check if they can be refactored to Strategy pattern.`);
  }

  return smells;
}

const target = process.argv[2] || './src';
if (fs.existsSync(target)) {
   console.log(`Analyzing ${target} for design pattern smells...`);
   // Recursion logic omitted for brevity in skill-demonstration
} else {
   console.error(`Target path ${target} not found.`);
}
