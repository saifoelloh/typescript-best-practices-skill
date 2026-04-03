'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * Clean Architecture Layer Violation Checker
 *
 * Detects forbidden imports that violate the Dependency Rule:
 *   - Domain layer must NOT import from Application or Infrastructure
 *   - Application layer must NOT import from Infrastructure
 *
 * Detection method: Regex-based heuristic matching on import paths.
 * Checks for ES import/export, require(), and dynamic import().
 *
 * Limitations:
 *   - Path aliases (@domain/, @infra/) are NOT resolved. Only relative/absolute
 *     path segments containing layer keywords are matched.
 *   - Barrel re-exports may mask the true origin of an import.
 *   - Layer detection is based on directory name matching in the file path.
 *     Projects using non-standard layer names will need to configure LAYER_DIRS.
 */

// Maps a layer to the directory names that identify it.
// Users can extend this for their project structure.
const LAYER_DIRS = {
  domain:         ['domain', 'entities', 'core'],
  application:    ['application', 'use-cases', 'usecases', 'app'],
  infrastructure: ['infrastructure', 'infra', 'adapters', 'frameworks', 'drivers'],
};

// What each layer is forbidden from importing
const PROHIBITED = {
  domain:      ['application', 'infrastructure'],
  application: ['infrastructure'],
  // infrastructure can import from anything
};

// Regex patterns to extract import sources
const IMPORT_PATTERNS = [
  /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,           // import X from 'path'
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,                // import('path')
  /export\s+.*?\s+from\s+['"]([^'"]+)['"]/g,             // export { X } from 'path'
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,                // require('path')
];

/**
 * Determine which layer a file belongs to, based on its path segments.
 * @param {string} filePath
 * @returns {string|null} 'domain' | 'application' | 'infrastructure' | null
 */
function detectLayer(filePath) {
  const segments = filePath.split(path.sep).map(s => s.toLowerCase());
  for (const [layer, dirNames] of Object.entries(LAYER_DIRS)) {
    if (segments.some(seg => dirNames.includes(seg))) {
      return layer;
    }
  }
  return null;
}

/**
 * Determine which layer an import path points to.
 * @param {string} importPath - The import specifier (e.g. '../../infrastructure/db')
 * @returns {string|null}
 */
function detectImportLayer(importPath) {
  const parts = importPath.split('/').map(s => s.toLowerCase());
  for (const [layer, dirNames] of Object.entries(LAYER_DIRS)) {
    if (parts.some(part => dirNames.includes(part))) {
      return layer;
    }
  }
  return null;
}

/**
 * Check a single file for layer violations.
 * @param {string} filePath
 * @param {string} layer - The layer this file belongs to
 * @param {Reporter} reporter
 */
function checkFile(filePath, layer, reporter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const prohibited = PROHIBITED[layer];
  if (!prohibited) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    for (const pattern of IMPORT_PATTERNS) {
      // Reset lastIndex for each line since we reuse the regex
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const importPath = match[1];
        // Skip node built-ins and npm packages (no relative path indicators)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) continue;

        const importLayer = detectImportLayer(importPath);
        if (importLayer && prohibited.includes(importLayer)) {
          reporter.add({
            ruleId: 'LAYER-VIOLATION',
            severity: 'CRITICAL',
            file: filePath,
            line: i + 1,
            message: `${layer} layer imports from ${importLayer} layer: "${importPath}"`,
          });
        }
      }
    }
  }
}

// --- Main ---
const { target, json } = parseArgs(process.argv);
const reporter = new Reporter({ json, cwd: target });

const resolvedTarget = path.resolve(target);
if (!fs.existsSync(resolvedTarget)) {
  console.error(`Error: Target path "${target}" does not exist.`);
  process.exit(2);
}

const files = scanDirectory(resolvedTarget);
let scanned = 0;

for (const filePath of files) {
  const layer = detectLayer(filePath);
  if (layer) {
    checkFile(filePath, layer, reporter);
    scanned++;
  }
}

if (scanned === 0) {
  console.log(`No files found in recognized layers (domain, application, infrastructure) under: ${resolvedTarget}`);
  console.log('Hint: This checker expects directories named: ' +
    Object.values(LAYER_DIRS).flat().join(', '));
}

const exitCode = reporter.flush('Layer Violation Checker');
process.exit(exitCode);
