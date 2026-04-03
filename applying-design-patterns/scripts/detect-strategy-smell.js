'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * Strategy Pattern Smell Detector
 *
 * Identifies switch statements and long if/else chains that may be
 * candidates for the Strategy pattern or polymorphic dispatch.
 *
 * Detection method: Regex-based heuristic with case counting.
 *
 * IMPORTANT: This is a HEURISTIC detector. Not every switch statement
 * should be refactored to a Strategy pattern. Legitimate uses include:
 *   - Reducers / state machines
 *   - Parser/lexer token handling
 *   - Simple data mapping (2-3 cases)
 *
 * The detector flags:
 *   - Switch statements with ≥ 5 case clauses (configurable via CASE_THRESHOLD)
 *   - If/else-if chains with ≥ 4 branches comparing the same-style equality
 *
 * Limitations:
 *   - Cannot distinguish behavioral switches (good refactor candidates)
 *     from data-mapping switches (usually fine as-is).
 *   - Case counting is approximate: a `case` keyword inside a comment or
 *     string literal within the switch block could inflate the count.
 *   - Nested switches will each be evaluated independently.
 */

const CASE_THRESHOLD = parseInt(process.env.STRATEGY_CASE_THRESHOLD, 10) || 5;
const ELIF_THRESHOLD = parseInt(process.env.STRATEGY_ELIF_THRESHOLD, 10) || 4;

/**
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function checkFile(filePath, reporter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let inSwitch = false;
  let switchStartLine = 0;
  let switchDepth = 0;
  let caseCount = 0;

  let elseIfChainStart = 0;
  let elseIfCount = 0;
  let inElseIfChain = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip pure comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // --- Switch detection ---
    if (/\bswitch\s*\(/.test(line)) {
      inSwitch = true;
      switchStartLine = i + 1;
      switchDepth = 0;
      caseCount = 0;
    }

    if (inSwitch) {
      // Count braces to track switch scope
      for (const ch of line) {
        if (ch === '{') switchDepth++;
        if (ch === '}') switchDepth--;
      }

      // Count case clauses
      const caseMatches = line.match(/\bcase\s+/g);
      if (caseMatches) caseCount += caseMatches.length;

      // Switch closed
      if (switchDepth <= 0 && caseCount > 0) {
        if (caseCount >= CASE_THRESHOLD) {
          reporter.add({
            ruleId: 'STRATEGY-SMELL',
            severity: 'MEDIUM',
            file: filePath,
            line: switchStartLine,
            message: `Switch statement with ${caseCount} cases (threshold: ${CASE_THRESHOLD}). Consider Strategy pattern if cases represent varying behavior. (Heuristic — may be a valid data mapping.)`,
          });
        }
        inSwitch = false;
      }
    }

    // --- Else-if chain detection ---
    // Track if we're in an if/else-if structure by watching for the pattern:
    //   if (...) { ... } else if (...) { ... } else if (...) { ... }
    // We count else-if occurrences and only report when the chain ends.
    if (/\bif\s*\(/.test(line) && !/\belse\s+if/.test(line) && elseIfCount === 0) {
      // Start of a potential chain (first `if`)
      elseIfChainStart = i;
      elseIfCount = 0;
      inElseIfChain = true;
    } else if (/\belse\s+if\s*\(/.test(line)) {
      if (!inElseIfChain) {
        elseIfChainStart = i;
        inElseIfChain = true;
      }
      elseIfCount++;
    }

    // Detect end of chain: a line with a standalone `}` at depth 0 of the function
    // followed by no `else`. We use a simple approach: if we see a closing `}`
    // not followed by `else` on the same or next line, the chain ends.
    if (inElseIfChain && elseIfCount > 0) {
      // Check if this line closes the chain (has `}` but no following `else`)
      if (trimmed === '}' || /\}\s*$/.test(line)) {
        // Peek at next non-empty line
        let nextIdx = i + 1;
        while (nextIdx < lines.length && lines[nextIdx].trim() === '') nextIdx++;
        const nextLine = nextIdx < lines.length ? lines[nextIdx].trim() : '';
        if (!nextLine.startsWith('else') && !nextLine.startsWith('}')) {
          // Chain ended
          if (elseIfCount >= ELIF_THRESHOLD) {
            reporter.add({
              ruleId: 'STRATEGY-SMELL',
              severity: 'MEDIUM',
              file: filePath,
              line: elseIfChainStart + 1,
              message: `Long if/else-if chain with ${elseIfCount} branches (threshold: ${ELIF_THRESHOLD}). Consider Strategy pattern or lookup map. (Heuristic.)`,
            });
          }
          elseIfCount = 0;
          inElseIfChain = false;
        }
      }
    }
  }

  // Flush any remaining chain at EOF
  if (elseIfCount >= ELIF_THRESHOLD) {
    reporter.add({
      ruleId: 'STRATEGY-SMELL',
      severity: 'MEDIUM',
      file: filePath,
      line: elseIfChainStart + 1,
      message: `Long if/else-if chain with ${elseIfCount} branches (threshold: ${ELIF_THRESHOLD}). Consider Strategy pattern or lookup map. (Heuristic.)`,
    });
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

const exitCode = reporter.flush('Strategy Smell Detector');
process.exit(exitCode);
