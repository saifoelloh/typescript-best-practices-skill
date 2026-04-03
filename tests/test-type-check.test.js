'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '../ensuring-type-safety/scripts/strict_mode_check.js');

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

describe('Type Safety Checker', () => {
  it('should find zero type safety issues in clean code', () => {
    const { exitCode, output } = run('pass/clean-types.ts');
    assert.equal(exitCode, 0, `Expected exit code 0, got ${exitCode}\n${output}`);
    assert.match(output, /Total findings: 0/);
  });

  it('should detect @ts-ignore', () => {
    const { exitCode, output } = run('fail/type-smells.ts');
    assert.equal(exitCode, 1);
    assert.match(output, /TS-IGNORE/);
  });

  it('should detect as any usage', () => {
    const { output } = run('fail/type-smells.ts');
    assert.match(output, /AS-ANY/);
  });

  it('should detect explicit any annotation', () => {
    const { output } = run('fail/type-smells.ts');
    assert.match(output, /ANY-TYPE/);
  });
});
