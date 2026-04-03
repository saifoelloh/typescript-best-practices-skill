'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * Strict Mode & Type Safety Checker
 *
 * Analyzes a TypeScript project for:
 *   1. tsconfig.json strict mode settings
 *   2. Unsafe escape hatches: @ts-ignore, @ts-nocheck, @ts-expect-error
 *   3. Unsafe type assertions: `as any`, `as unknown`
 *   4. Explicit `any` type annotations
 *
 * Detection method: Regex-based heuristic.
 *
 * Limitations:
 *   - String matching may trigger on occurrences inside comments or string
 *     literals (e.g. a comment explaining "don't use as any").
 *   - `any` detection looks for `: any` patterns, which may miss complex
 *     generic usages like `Promise<any>`.
 *   - Does not track `@ts-ignore` with justification comments (TS 3.9+
 *     @ts-expect-error is preferred but both are flagged).
 */

/**
 * Check tsconfig.json for strict settings.
 * @param {string} targetDir
 * @param {Reporter} reporter
 */
function checkTsConfig(targetDir, reporter) {
  const tsconfigPath = path.join(targetDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    reporter.add({
      ruleId: 'STRICT-MODE',
      severity: 'HIGH',
      file: tsconfigPath,
      line: null,
      message: 'tsconfig.json not found. Strict mode cannot be verified.',
    });
    return;
  }

  try {
    // Strip comments from tsconfig (JSON with comments is common)
    const raw = fs.readFileSync(tsconfigPath, 'utf8');
    const stripped = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const tsconfig = JSON.parse(stripped);
    const options = tsconfig.compilerOptions || {};

    if (options.strict !== true) {
      reporter.add({
        ruleId: 'STRICT-MODE',
        severity: 'HIGH',
        file: tsconfigPath,
        line: null,
        message: '`strict` is not set to true. Enable `"strict": true` for full type safety.',
      });
    }

    // Check individual strict flags only if strict is not globally true
    if (options.strict !== true) {
      const flags = [
        'noImplicitAny', 'strictNullChecks', 'strictFunctionTypes',
        'strictBindCallApply', 'strictPropertyInitialization',
        'noImplicitThis', 'alwaysStrict',
      ];
      for (const flag of flags) {
        if (options[flag] !== true) {
          reporter.add({
            ruleId: 'STRICT-MODE',
            severity: 'MEDIUM',
            file: tsconfigPath,
            line: null,
            message: `Strict sub-flag "${flag}" is not enabled.`,
          });
        }
      }
    }
  } catch (err) {
    reporter.add({
      ruleId: 'STRICT-MODE',
      severity: 'HIGH',
      file: tsconfigPath,
      line: null,
      message: `Error parsing tsconfig.json: ${err.message}`,
    });
  }
}

/**
 * Scan source files for type safety escape hatches.
 * @param {string[]} files
 * @param {Reporter} reporter
 */
function scanFiles(files, reporter) {
  const patterns = [
    { regex: /\/\/\s*@ts-ignore/,       ruleId: 'TS-IGNORE',     severity: 'HIGH',   message: '@ts-ignore suppresses type errors without justification. Prefer @ts-expect-error or fix the type.' },
    { regex: /\/\/\s*@ts-nocheck/,       ruleId: 'TS-NOCHECK',    severity: 'CRITICAL', message: '@ts-nocheck disables type checking for the entire file.' },
    { regex: /\/\/\s*@ts-expect-error/,  ruleId: 'TS-EXPECT-ERR', severity: 'MEDIUM',  message: '@ts-expect-error found. Ensure it has a justification comment.' },
    { regex: /\bas\s+any\b/,             ruleId: 'AS-ANY',        severity: 'HIGH',   message: 'Unsafe `as any` assertion bypasses type checking.' },
    { regex: /:\s*any\b/,                ruleId: 'ANY-TYPE',      severity: 'HIGH',   message: 'Explicit `any` type annotation. Use `unknown` or a specific type.' },
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const { regex, ruleId, severity, message } of patterns) {
        if (regex.test(line)) {
          reporter.add({ ruleId, severity, file: filePath, line: i + 1, message });
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

// Check tsconfig only when target is a directory (project root)
if (fs.statSync(resolvedTarget).isDirectory()) {
  checkTsConfig(resolvedTarget, reporter);
}

// Scan source files (TS/TSX only for type safety checks)
const files = scanDirectory(resolvedTarget, { extensions: ['.ts', '.tsx'] });
scanFiles(files, reporter);

const exitCode = reporter.flush('Type Safety Checker');
process.exit(exitCode);
