'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../applying-design-patterns/scripts/god_object_check.js');

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

describe('God Object Detector', () => {
  it('should find zero issues in clean patterns code', () => {
    const { exitCode, output } = run('pass/clean-patterns.ts');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect god class with too many methods', () => {
    const { exitCode, output } = run('fail/god-object.ts');
    assert.equal(exitCode, 1, `Expected exit code 1, got ${exitCode}\n${output}`);
    assert.match(output, /GOD-CLASS/);
    assert.match(output, /16 methods/);
  });
});
