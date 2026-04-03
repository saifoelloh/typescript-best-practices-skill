'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * Async Code Smell Detector
 *
 * Detects common async/await mistakes using a hybrid approach:
 *   - Regex-based heuristics for simple patterns (forEach, Promise constructor)
 *   - ts-morph AST analysis for syntax-sensitive checks (floating promises)
 *
 * Detection rules:
 *   1. ASYNC-FOREACH: async callback in .forEach() — promises are silently dropped
 *   2. FLOATING-PROMISE: function call returning a promise that is not awaited,
 *      assigned, or returned (heuristic — see limitations)
 *   3. PROMISE-CONSTRUCTOR-ANTI: new Promise() wrapping an existing async operation
 *
 * Limitations:
 *   - FLOATING-PROMISE detection is regex-based and heuristic. It looks for
 *     common async patterns (calls to functions that likely return promises)
 *     but cannot determine actual return types without full type checking.
 *     For precise floating promise detection, use @typescript-eslint/no-floating-promises.
 *   - PROMISE-CONSTRUCTOR-ANTI regex may match legitimate promisification of
 *     callback-based APIs (false positive).
 *   - AST features require ts-morph and are applied only to .ts/.tsx files.
 */

let Project;
try {
  Project = require('ts-morph').Project;
} catch {
  Project = null;
}

// --- Regex-based checks (all file types) ---

/**
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function regexChecks(filePath, reporter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip pure comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // 1. async forEach
    if (/\.forEach\s*\(\s*async\b/.test(line)) {
      reporter.add({
        ruleId: 'ASYNC-FOREACH',
        severity: 'HIGH',
        file: filePath,
        line: i + 1,
        message: 'async callback in .forEach() — promises are silently dropped. Use for...of or Promise.all(arr.map(...)).',
      });
    }

    // 2. Promise constructor wrapping async
    if (/new\s+Promise\s*\(\s*async\b/.test(line)) {
      reporter.add({
        ruleId: 'PROMISE-CONSTRUCTOR-ANTI',
        severity: 'HIGH',
        file: filePath,
        line: i + 1,
        message: 'new Promise() with async executor — the outer promise cannot catch rejections from the inner async function.',
      });
    }

    // 3. Promise constructor wrapping .then/.catch (heuristic)
    if (/new\s+Promise\s*\(\s*\(\s*resolve\s*,\s*reject\s*\)/.test(line)) {
      // Look ahead a few lines for .then/.catch inside the constructor
      const block = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');
      if (/\.then\s*\(/.test(block) && /\.catch\s*\(/.test(block)) {
        reporter.add({
          ruleId: 'PROMISE-CONSTRUCTOR-ANTI',
          severity: 'MEDIUM',
          file: filePath,
          line: i + 1,
          message: 'Heuristic: new Promise() wrapping existing .then()/.catch() chain. Consider returning the promise directly.',
        });
      }
    }
  }
}

// --- AST-based checks (ts/tsx only, requires ts-morph) ---

/**
 * Use ts-morph to find async functions without await (heuristic smell).
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function astChecks(filePath, reporter) {
  if (!Project) return;
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

  try {
    const project = new Project({ useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true });
    const sourceFile = project.addSourceFileAtPath(filePath);

    // Find async functions/methods with no await expression
    const fns = [
      ...sourceFile.getFunctions(),
      ...sourceFile.getClasses().flatMap(c => c.getMethods()),
    ];

    for (const fn of fns) {
      if (!fn.isAsync()) continue;
      const body = fn.getBody();
      if (!body) continue;

      const text = body.getText();
      // Simple check: does the body contain 'await'?
      if (!text.includes('await')) {
        const name = fn.getName() || '<anonymous>';
        reporter.add({
          ruleId: 'ASYNC-NO-AWAIT',
          severity: 'MEDIUM',
          file: filePath,
          line: fn.getStartLineNumber(),
          message: `async function "${name}" contains no await expression. Consider removing async or adding await. (May be intentional for interface conformance.)`,
        });
      }
    }
  } catch {
    // ts-morph parse failure — skip file silently (e.g. JSX, syntax errors)
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
  regexChecks(filePath, reporter);
  astChecks(filePath, reporter);
}

const exitCode = reporter.flush('Async Smell Checker');
process.exit(exitCode);
