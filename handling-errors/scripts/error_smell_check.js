'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * Error Handling Smell Detector
 *
 * Detects common error handling mistakes:
 *   1. EMPTY-CATCH: Empty catch blocks that swallow errors silently
 *   2. THROW-NON-ERROR: Throwing string literals, numbers, or other non-Error values
 *   3. SWALLOWED-PROMISE-ERROR: .catch(() => {}) or .catch(() => null) on promises
 *
 * Detection method: Regex-based heuristic with multi-line awareness.
 *
 * Limitations:
 *   - Empty catch detection uses brace-matching heuristic. A catch block
 *     containing only a comment (e.g. // intentionally ignored) will NOT
 *     be flagged — this is by design, as commented ignores are acceptable
 *     in some cases.
 *   - Throw detection checks the throw statement line only. Multi-line
 *     throw expressions (rare) may be missed.
 *   - .catch(() => {}) detection is literal pattern matching. Complex
 *     swallowing patterns (e.g. .catch(noop)) are not detected.
 */

/**
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function checkFile(filePath, reporter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip pure comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // 1. Empty catch — single-line: catch(e) {} or catch {}
    if (/catch\s*(\([^)]*\))?\s*\{\s*\}/.test(line)) {
      reporter.add({
        ruleId: 'EMPTY-CATCH',
        severity: 'CRITICAL',
        file: filePath,
        line: i + 1,
        message: 'Empty catch block silently swallows errors. Log, rethrow, or handle the error.',
      });
    }

    // 1b. Empty catch — multi-line: catch { \n }
    if (/catch\s*(\([^)]*\))?\s*\{\s*$/.test(line)) {
      // Check if next non-empty line is just '}'
      let nextLine = i + 1;
      while (nextLine < lines.length && lines[nextLine].trim() === '') nextLine++;
      if (nextLine < lines.length && lines[nextLine].trim() === '}') {
        reporter.add({
          ruleId: 'EMPTY-CATCH',
          severity: 'CRITICAL',
          file: filePath,
          line: i + 1,
          message: 'Empty catch block silently swallows errors. Log, rethrow, or handle the error.',
        });
      }
    }

    // 2. Throw non-Error values
    // throw 'string' or throw "string"
    if (/\bthrow\s+['"]/.test(line)) {
      reporter.add({
        ruleId: 'THROW-NON-ERROR',
        severity: 'HIGH',
        file: filePath,
        line: i + 1,
        message: 'Throwing a string literal loses stack trace. Use `throw new Error(...)` instead.',
      });
    }
    // throw 123 or throw true
    if (/\bthrow\s+\d+/.test(line) || /\bthrow\s+(true|false|null|undefined)\b/.test(line)) {
      reporter.add({
        ruleId: 'THROW-NON-ERROR',
        severity: 'HIGH',
        file: filePath,
        line: i + 1,
        message: 'Throwing a non-Error value loses stack trace. Use `throw new Error(...)` instead.',
      });
    }

    // 3. Swallowed promise errors: .catch(() => {}) or .catch((_) => {}) or .catch(() => null)
    if (/\.catch\s*\(\s*\(?[^)]*\)?\s*=>\s*\{\s*\}\s*\)/.test(line) ||
        /\.catch\s*\(\s*\(?[^)]*\)?\s*=>\s*(null|undefined|void\s+0)\s*\)/.test(line) ||
        /\.catch\s*\(\s*function\s*\([^)]*\)\s*\{\s*\}\s*\)/.test(line)) {
      reporter.add({
        ruleId: 'SWALLOWED-PROMISE',
        severity: 'HIGH',
        file: filePath,
        line: i + 1,
        message: 'Promise .catch() handler swallows the error. Log or propagate it.',
      });
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

for (const filePath of files) {
  checkFile(filePath, reporter);
}

const exitCode = reporter.flush('Error Handling Smell Checker');
process.exit(exitCode);
