'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../applying-clean-architecture/scripts/layer_violation_check.js');

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

describe('Layer Violation Checker', () => {
  it('should find zero violations in clean architecture code', () => {
    const { exitCode, output } = run('pass/clean-architecture');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect domain layer importing from infrastructure', () => {
    const { exitCode, output } = run('fail/architecture-violation');
    assert.equal(exitCode, 1, `Expected exit code 1, got ${exitCode}\n${output}`);
    assert.match(output, /LAYER-VIOLATION/);
    assert.match(output, /infrastructure/);
  });
});
