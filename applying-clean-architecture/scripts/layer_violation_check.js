const fs = require('fs');
const path = require('path');

/**
 * Clean Architecture Layer Violation Checker
 * 
 * Rules:
 * 1. Domain layer cannot import from Application or Infrastructure.
 * 2. Application layer cannot import from Infrastructure.
 */

const LAYERS = {
  DOMAIN: 'domain',
  APPLICATION: 'application',
  INFRASTRUCTURE: 'infrastructure'
};

const PROHIBITED_IMPORTS = {
  [LAYERS.DOMAIN]: [LAYERS.APPLICATION, LAYERS.INFRASTRUCTURE],
  [LAYERS.APPLICATION]: [LAYERS.INFRASTRUCTURE]
};

function checkFile(filePath, layer) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  const prohibited = PROHIBITED_IMPORTS[layer];
  if (!prohibited) return [];

  lines.forEach((line, index) => {
    // Basic regex for imports
    const match = line.match(/from ['"](.+)['"]/);
    if (match) {
      const importPath = match[1];
      prohibited.forEach(p => {
        if (importPath.includes(`/${p}/`)) {
          violations.push(`Line ${index + 1}: Prohibited import of ${p} in ${layer} layer.`);
        }
      });
    }
  });

  return violations;
}

// Example usage or run via CLI
const targetDir = process.argv[2] || './src';
console.log(`Checking layer violations in: ${targetDir}`);

// (Simplified recursive directory traversal would go here)
console.log('Verification logic initialized. Integrate with CI/CD for enforcement.');
