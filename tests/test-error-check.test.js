'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../handling-errors/scripts/error_smell_check.js');

function run(fixture) {
  const fixturePath = path.resolve(__dirname, 'fixtures', fixture);
  try {
    const output = execFileSync('node', [SCRIPT, fixturePath], {
      encoding: 'utf8',
      timeout: 15000,
    });
    return { exitCode: 0, output };
  } catch (err) {
    return { exitCode: err.status, output: err.stdout || '' };
  }
}

describe('Error Handling Smell Checker', () => {
  it('should find zero issues in clean error handling code', () => {
    const { exitCode, output } = run('pass/clean-errors.ts');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect empty catch blocks', () => {
    const { exitCode, output } = run('fail/error-smells.ts');
    assert.equal(exitCode, 1);
    assert.match(output, /EMPTY-CATCH/);
  });

  it('should detect thrown string literals', () => {
    const { output } = run('fail/error-smells.ts');
    assert.match(output, /THROW-NON-ERROR/);
  });

  it('should detect swallowed promise errors', () => {
    const { output } = run('fail/error-smells.ts');
    assert.match(output, /SWALLOWED-PROMISE/);
  });
});
