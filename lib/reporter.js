'use strict';

const path = require('path');

/**
 * Shared reporter for consistent CLI output across all detectors.
 *
 * Output format (default):
 *   [RULE_ID][SEVERITY] path/to/file.ts:42 — message
 *
 * JSON format (--json flag):
 *   { "ruleId": "...", "severity": "...", "file": "...", "line": 42, "message": "..." }
 */

/**
 * @typedef {Object} Finding
 * @property {string} ruleId - e.g. 'LAYER-VIOLATION'
 * @property {'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'} severity
 * @property {string} file - absolute file path
 * @property {number|null} line - 1-based line number, or null if not applicable
 * @property {string} message
 */

class Reporter {
  /**
   * @param {object} [options]
   * @param {boolean} [options.json] - Output JSON instead of plain text
   * @param {string} [options.cwd] - Base directory for relative paths in output
   */
  constructor(options = {}) {
    this.json = options.json || false;
    this.cwd = options.cwd || process.cwd();
    /** @type {Finding[]} */
    this.findings = [];
  }

  /**
   * Record a finding.
   * @param {Finding} finding
   */
  add(finding) {
    this.findings.push(finding);
  }

  /**
   * Format a single finding as a plain-text string.
   * @param {Finding} f
   * @returns {string}
   */
  formatLine(f) {
    const relPath = path.relative(this.cwd, f.file);
    const location = f.line ? `${relPath}:${f.line}` : relPath;
    return `[${f.ruleId}][${f.severity}] ${location} — ${f.message}`;
  }

  /**
   * Print all findings and a summary. Returns the exit code.
   * @param {string} detectorName - Name shown in the summary header
   * @returns {number} 0 if no findings, 1 if findings exist
   */
  flush(detectorName) {
    if (this.json) {
      const output = {
        detector: detectorName,
        totalFindings: this.findings.length,
        findings: this.findings.map(f => ({
          ruleId: f.ruleId,
          severity: f.severity,
          file: path.relative(this.cwd, f.file),
          line: f.line,
          message: f.message,
        })),
      };
      console.log(JSON.stringify(output, null, 2));
    } else {
      if (this.findings.length > 0) {
        for (const f of this.findings) {
          console.log(this.formatLine(f));
        }
      }

      console.log('');
      console.log(`--- ${detectorName} ---`);
      console.log(`Total findings: ${this.findings.length}`);

      if (this.findings.length > 0) {
        const bySeverity = {};
        for (const f of this.findings) {
          bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
        }
        for (const [sev, count] of Object.entries(bySeverity)) {
          console.log(`  ${sev}: ${count}`);
        }
      } else {
        console.log('  ✅ No issues found.');
      }
    }

    return this.findings.length > 0 ? 1 : 0;
  }
}

/**
 * Parse common CLI flags used by all detectors.
 * @param {string[]} argv - process.argv
 * @returns {{ target: string, json: boolean }}
 */
function parseArgs(argv) {
  const args = argv.slice(2);
  let target = '.';
  let json = false;

  for (const arg of args) {
    if (arg === '--json') {
      json = true;
    } else if (!arg.startsWith('-')) {
      target = arg;
    }
  }

  return { target, json };
}

module.exports = { Reporter, parseArgs };
