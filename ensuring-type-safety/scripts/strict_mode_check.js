/**
 * Strict Mode & Type Safety Checker
 * 
 * This script analyzes a TypeScript project for:
 * 1. Strict mode settings in tsconfig.json
 * 2. Usage of unsafe escape hatches (@ts-ignore, @ts-nocheck)
 * 3. Usage of 'as any' type assertions
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || '.';

function checkTsConfig() {
  const tsconfigPath = path.join(targetDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    console.log('⚠️ tsconfig.json not found in target directory.');
    return;
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const options = tsconfig.compilerOptions || {};
    
    console.log('--- tsconfig.json Analysis ---');
    const strictSettings = [
      'strict',
      'noImplicitAny',
      'strictNullChecks',
      'strictFunctionTypes',
      'strictBindCallApply',
      'strictPropertyInitialization',
      'noImplicitThis',
      'alwaysStrict'
    ];

    strictSettings.forEach(setting => {
      const value = options[setting];
      const status = value === true ? '✅' : '❌';
      console.log(`${status} ${setting}: ${value}`);
    });
  } catch (err) {
    console.log('❌ Error parsing tsconfig.json:', err.message);
  }
}

function scanFiles(dir) {
  const files = fs.readdirSync(dir);
  let issues = {
    tsIgnore: 0,
    tsNoCheck: 0,
    asAny: 0
  };

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        const subIssues = scanFiles(fullPath);
        issues.tsIgnore += subIssues.tsIgnore;
        issues.tsNoCheck += subIssues.tsNoCheck;
        issues.asAny += subIssues.asAny;
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const tsIgnoreMatches = content.match(/\/\/ @ts-ignore/g);
      if (tsIgnoreMatches) issues.tsIgnore += tsIgnoreMatches.length;

      const tsNoCheckMatches = content.match(/\/\/ @ts-nocheck/g);
      if (tsNoCheckMatches) issues.tsNoCheck += tsNoCheckMatches.length;

      const asAnyMatches = content.match(/as any/g);
      if (asAnyMatches) issues.asAny += asAnyMatches.length;
    }
  });

  return issues;
}

console.log(`Analyzing project at: ${path.resolve(targetDir)}`);
checkTsConfig();

console.log('\n--- Code Leak Analysis ---');
const codeIssues = scanFiles(targetDir);
console.log(`${codeIssues.tsIgnore > 0 ? '❌' : '✅'} @ts-ignore usage: ${codeIssues.tsIgnore}`);
console.log(`${codeIssues.tsNoCheck > 0 ? '❌' : '✅'} @ts-nocheck usage: ${codeIssues.tsNoCheck}`);
console.log(`${codeIssues.asAny > 0 ? '❌' : '✅'} 'as any' assertions: ${codeIssues.asAny}`);

if (codeIssues.tsIgnore > 0 || codeIssues.asAny > 0) {
  console.log('\n💡 Recommendation: Replace escape hatches with proper type narrowing or internal interfaces.');
}
