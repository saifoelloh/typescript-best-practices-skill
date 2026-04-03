'use strict';

const fs = require('fs');
const path = require('path');
const { scanDirectory } = require('../../lib/scanner');
const { Reporter, parseArgs } = require('../../lib/reporter');

/**
 * God Object / Complexity Detector
 *
 * Detects oversized classes, long functions, and files that likely
 * violate the Single Responsibility Principle.
 *
 * Detection rules:
 *   1. GOD-FILE: Files exceeding FILE_LINE_THRESHOLD lines (default: 500)
 *   2. GOD-FUNCTION: Functions/methods exceeding FUNC_LINE_THRESHOLD lines (default: 80)
 *   3. GOD-CLASS: Classes with more than METHOD_COUNT_THRESHOLD methods (default: 15)
 *
 * Detection method: Hybrid — ts-morph AST for .ts/.tsx, regex fallback for .js/.jsx.
 *
 * Limitations:
 *   - Regex fallback for JS files uses brace-counting, which can miscount in
 *     files with template literals, JSX, or multi-line strings.
 *   - AST analysis creates a ts-morph Project per file (no shared config).
 *     Performance may be slow on very large codebases.
 *   - Method count includes getters/setters as separate methods.
 *   - Thresholds are configurable via environment variables.
 */

let Project;
try {
  Project = require('ts-morph').Project;
} catch {
  Project = null;
}

const FILE_LINE_THRESHOLD = parseInt(process.env.GOD_FILE_LINES, 10) || 500;
const FUNC_LINE_THRESHOLD = parseInt(process.env.GOD_FUNC_LINES, 10) || 80;
const METHOD_COUNT_THRESHOLD = parseInt(process.env.GOD_METHOD_COUNT, 10) || 15;

/**
 * AST-based analysis for TypeScript files.
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function astAnalysis(filePath, reporter) {
  if (!Project) return regexAnalysis(filePath, reporter);

  try {
    const project = new Project({ useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true });
    const sourceFile = project.addSourceFileAtPath(filePath);

    // File length check
    const totalLines = sourceFile.getEndLineNumber();
    if (totalLines > FILE_LINE_THRESHOLD) {
      reporter.add({
        ruleId: 'GOD-FILE',
        severity: 'MEDIUM',
        file: filePath,
        line: 1,
        message: `File has ${totalLines} lines (threshold: ${FILE_LINE_THRESHOLD}). Consider splitting into focused modules.`,
      });
    }

    // Class analysis
    for (const cls of sourceFile.getClasses()) {
      const methods = cls.getMethods();
      if (methods.length > METHOD_COUNT_THRESHOLD) {
        reporter.add({
          ruleId: 'GOD-CLASS',
          severity: 'HIGH',
          file: filePath,
          line: cls.getStartLineNumber(),
          message: `Class "${cls.getName() || '<anonymous>'}" has ${methods.length} methods (threshold: ${METHOD_COUNT_THRESHOLD}). Consider extracting responsibilities.`,
        });
      }

      // Check method lengths
      for (const method of methods) {
        const startLine = method.getStartLineNumber();
        const endLine = method.getEndLineNumber();
        const methodLength = endLine - startLine + 1;
        if (methodLength > FUNC_LINE_THRESHOLD) {
          reporter.add({
            ruleId: 'GOD-FUNCTION',
            severity: 'HIGH',
            file: filePath,
            line: startLine,
            message: `Method "${method.getName()}" is ${methodLength} lines (threshold: ${FUNC_LINE_THRESHOLD}). Extract sub-methods.`,
          });
        }
      }
    }

    // Stand-alone function analysis
    for (const fn of sourceFile.getFunctions()) {
      const startLine = fn.getStartLineNumber();
      const endLine = fn.getEndLineNumber();
      const fnLength = endLine - startLine + 1;
      if (fnLength > FUNC_LINE_THRESHOLD) {
        reporter.add({
          ruleId: 'GOD-FUNCTION',
          severity: 'HIGH',
          file: filePath,
          line: startLine,
          message: `Function "${fn.getName() || '<anonymous>'}" is ${fnLength} lines (threshold: ${FUNC_LINE_THRESHOLD}). Consider breaking into smaller functions.`,
        });
      }
    }
  } catch {
    // Parse failure — fall back to regex
    regexAnalysis(filePath, reporter);
  }
}

/**
 * Regex-based fallback analysis for JS files or when ts-morph is unavailable.
 * @param {string} filePath
 * @param {Reporter} reporter
 */
function regexAnalysis(filePath, reporter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // File length
  if (lines.length > FILE_LINE_THRESHOLD) {
    reporter.add({
      ruleId: 'GOD-FILE',
      severity: 'MEDIUM',
      file: filePath,
      line: 1,
      message: `File has ${lines.length} lines (threshold: ${FILE_LINE_THRESHOLD}). Consider splitting into focused modules.`,
    });
  }

  // Simple function detection via regex
  const funcPattern = /(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/;
  const methodPattern = /(?:(?:public|private|protected|static|async)\s+)*([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/;

  let depth = 0;
  let funcStart = -1;
  let funcName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const funcMatch = line.match(funcPattern) || line.match(methodPattern);
    if (funcMatch && depth <= 1) {
      // Close previous function if any
      if (funcStart >= 0) {
        const length = i - funcStart;
        if (length > FUNC_LINE_THRESHOLD) {
          reporter.add({
            ruleId: 'GOD-FUNCTION',
            severity: 'HIGH',
            file: filePath,
            line: funcStart + 1,
            message: `Function "${funcName}" is ~${length} lines (threshold: ${FUNC_LINE_THRESHOLD}). (Regex estimate, may be imprecise.)`,
          });
        }
      }
      funcName = funcMatch[1] || '<anonymous>';
      funcStart = i;
    }

    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
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
  const ext = path.extname(filePath);
  if (ext === '.ts' || ext === '.tsx') {
    astAnalysis(filePath, reporter);
  } else {
    regexAnalysis(filePath, reporter);
  }
}

const exitCode = reporter.flush('God Object Detector');
process.exit(exitCode);
