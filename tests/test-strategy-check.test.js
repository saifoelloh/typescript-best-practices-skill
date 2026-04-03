'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../applying-design-patterns/scripts/detect-strategy-smell.js');

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

describe('Strategy Smell Detector', () => {
  it('should find zero smells in clean patterns code', () => {
    const { exitCode, output } = run('pass/clean-patterns.ts');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect large switch statements', () => {
    const { exitCode, output } = run('fail/strategy-smell.ts');
    assert.equal(exitCode, 1, `Expected exit code 1, got ${exitCode}\n${output}`);
    assert.match(output, /STRATEGY-SMELL/);
    assert.match(output, /switch/i);
  });

  it('should detect long if/else-if chains', () => {
    const { output } = run('fail/strategy-smell.ts');
    assert.match(output, /if\/else/i);
  });
});
