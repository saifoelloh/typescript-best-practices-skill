const fs = require('fs');
const path = require('path');

/**
 * Detects "God Objects" and complex functions in TypeScript files.
 * Rule: Extract logic from functions exceeding 300 lines.
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let currentFunction = null;
  let functionStartLine = 0;
  let count = 0;
  
  console.log(`Analyzing: ${filePath}`);
  
  const functionRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/g;
  const methodRegex = /(?:public|private|protected|static)?\s*(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(/g;

  lines.forEach((line, index) => {
    // Simple block-based counting (rough approximation)
    if (line.includes('{')) count++;
    if (line.includes('}')) count--;
    
    // Very basic function detection for demonstration
    const match = functionRegex.exec(line) || methodRegex.exec(line);
    if (match && count === 1) {
      if (currentFunction) {
        const length = index - functionStartLine;
        if (length > 300) {
          console.warn(`[GOD OBJECT] Function "${currentFunction}" is too long: ${length} lines! (Line ${functionStartLine + 1})`);
        }
      }
      currentFunction = match[1];
      functionStartLine = index;
    }
  });
}

// Example usage: node scripts/god_object_check.js <file_path>
const target = process.argv[2];
if (target && fs.existsSync(target)) {
  analyzeFile(target);
} else {
  console.log("Usage: node scripts/god_object_check.js <file_path>");
}
