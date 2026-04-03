'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../handling-async/scripts/async_smell_check.js');

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

describe('Async Smell Checker', () => {
  it('should find zero issues in clean async code', () => {
    const { exitCode, output } = run('pass/clean-async.ts');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect async forEach smell', () => {
    const { exitCode, output } = run('fail/async-smells.ts');
    assert.equal(exitCode, 1, `Expected exit code 1, got ${exitCode}\n${output}`);
    assert.match(output, /ASYNC-FOREACH/);
  });

  it('should detect Promise constructor anti-pattern', () => {
    const { output } = run('fail/async-smells.ts');
    assert.match(output, /PROMISE-CONSTRUCTOR-ANTI/);
  });

  it('should detect async function without await', () => {
    const { output } = run('fail/async-smells.ts');
    assert.match(output, /ASYNC-NO-AWAIT/);
  });
});
