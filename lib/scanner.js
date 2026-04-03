'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Shared recursive directory scanner for all detectors.
 *
 * Recursively walks a directory tree, yielding file paths that match
 * the given extensions while skipping irrelevant directories.
 *
 * @param {string} dir - Root directory to scan
 * @param {object} [options]
 * @param {string[]} [options.extensions] - File extensions to include (default: .ts, .tsx, .js, .jsx)
 * @param {string[]} [options.ignoreDirs] - Directory names to skip
 * @returns {string[]} Array of absolute file paths
 */
function scanDirectory(dir, options = {}) {
  const {
    extensions = ['.ts', '.tsx', '.js', '.jsx'],
    ignoreDirs = [
      'node_modules', '.git', 'dist', 'build', 'coverage',
      '.nyc_output', '.next', '.nuxt', '.cache', '__pycache__',
    ],
  } = options;

  const resolved = path.resolve(dir);
  const results = [];

  // Handle single-file targets
  try {
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      const ext = path.extname(resolved);
      if (extensions.includes(ext)) {
        results.push(resolved);
      }
      return results;
    }
  } catch {
    return results;
  }

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      // Permission denied or broken symlink — skip silently
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) {
          walk(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          results.push(path.join(currentDir, entry.name));
        }
      }
    }
  }

  walk(resolved);
  return results;
}

module.exports = { scanDirectory };
