# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-beta] - 2026-04-03

### Added
- **package.json**: Project is now installable with `npm install` and runnable via npm scripts.
- **Shared utilities** (`lib/scanner.js`, `lib/reporter.js`): All detectors use consistent recursive traversal and output formatting.
- **ts-morph integration**: AST-based analysis for syntax-sensitive checks (async smells, error patterns).
- **Test suite**: Node.js built-in `node:test` with pass/fail fixtures for all detectors.
- **TRACEABILITY.md**: Complete rule-to-detector mapping with false positive/negative documentation.
- **LICENSE**: MIT license file (was claimed but missing).

### Changed
- **All detectors upgraded**: Every script now recursively scans directories, emits findings with file path and line number, uses consistent `[RULE_ID][SEVERITY]` output format, and returns non-zero exit code on violations.
- **README rewritten**: Honest beta status, accurate file tree, quickstart guide, contributing section.
- **CHANGELOG corrected**: Previous `[1.0.0]` entry updated to reflect actual content (prototype detectors, not automated verification).
- **Rule accuracy improved**:
  - `critical-async-without-await` downgraded to HIGH, reframed as heuristic with documented exceptions.
  - `critical-type-assertion-unsafe` reframed to focus on unsafe assertions, not all `as` usage.
  - `medium-type-vs-interface` labeled as team heuristic, not universal rule.
  - `high-promise-race-timeout` updated with `AbortController`/`AbortSignal.timeout()` guidance.
  - Decorator guidance distinguishes TC39 standard from legacy experimental decorators.
- **GoF patterns table**: Expanded from 11 to 23 patterns (was claiming "23 covered" with only 11 in the table).

### Fixed
- Scripts that defined analysis functions but never called them (async, error, strategy detectors).
- Truncated line in `ensuring-type-safety/SKILL.md`.
- Version mismatch between README (`v0.1.0`) and CHANGELOG (`1.0.0`).
- README file tree that was missing 3 of 5 skill directories.

### Removed
- Overclaims about "automated verification for all modules" (was prototype-level).

## [1.0.0] - 2026-03-27

### Added
- **Core Skill: Applying Clean Architecture**: Guide based on Robert C. Martin's textbook, with prototype layer violation detection script.
- **Core Skill: Applying Design Patterns (GoF)**: Mapping of GoF patterns to TypeScript idioms, with prototype strategy pattern smell detection.
- **Prototype detectors**: Initial JS scripts in `scripts/` directories — functional as single-file analyzers but lacking recursive traversal, consistent output, and exit codes.
- **Progressive Disclosure Documentation**: Standardized `SKILL.md` (lean) and `references/RULES.md` (detailed) for all modules.

### Changed
- **Repository Restructuring**: Organized into 5 modular skill domains.
- **Standardization**: Unified skill module structure and metadata.

### Fixed
- Bloated `handling-errors/SKILL.md` resolved by moving details to reference catalogs.
- Inconsistent metadata across skill instruction sets.
