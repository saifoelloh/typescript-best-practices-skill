---
name: typescript-best-practices
description: Core traceability matrix mapping rules to their automated detectors and tracking known limitations.
---

# Traceability Matrix

This matrix maps documented best practices to their automated detectors, highlighting which rules are strictly enforced and which rely on heuristics.

### Legend
*   **AST**: Uses `ts-morph` for precise syntactic analysis.
*   **Regex**: Uses regular expressions.
*   **Heuristic**: Rules that indicate *potential* issues (smells) rather than guaranteed errors.
*   **Manual**: Rules that require human review and are not currently automated.

## Clean Architecture

| Rule ID | Detector Script | Method | Enforcement Level | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| `LAYER-VIOLATION` | `layer_violation_check.js` | Regex | Strict | Cannot resolve path aliases (e.g., `@domain/`). Relies on directory name matching (`domain`, `application`, `infrastructure`). |
| `CROSS-DOMAIN-DEP` | N/A | N/A | Manual | Requires analyzing bounded context boundaries, which are often project-specific and hard to infer mechanically. |
| `USE-CASE-LEAKAGE` | N/A | N/A | Manual | Identifying complex business logic leaking into controllers requires semantic understanding. |
| `INFRA-BLEED` | N/A | N/A | Manual | Framework-specific types returning from interfaces are hard to spot without deep type tracking. |

## Design Patterns

| Rule ID | Detector Script | Method | Enforcement Level | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| `STRATEGY-SMELL` | `detect-strategy-smell.js` | Regex | Heuristic | Flags `switch` (>5) and long `if/else` (>3). Cannot differentiate business logic branching from simple data mapping/reducers. |
| `GOD-FILE` | `god_object_check.js` | Regex/AST | Heuristic | Flags files > 500 lines. |
| `GOD-CLASS` | `god_object_check.js` | AST | Heuristic | Flags classes > 15 methods. Includes getters/setters in the count. |
| `GOD-FUNCTION` | `god_object_check.js` | Regex/AST | Heuristic | Flags functions > 80 lines. Regex fallback for JS files may miscount lines inside template literals. |
| `FACTORY-METHOD` | N/A | N/A | Manual | Detecting inappropriate `new` usage requires context about instantiation frequency and coupling. |

## Type Safety

| Rule ID | Detector Script | Method | Enforcement Level | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| `STRICT-MODE` | `strict_mode_check.js` | Parsing | Strict | Expects `tsconfig.json` at the root. |
| `TS-IGNORE` | `strict_mode_check.js` | Regex | Strict | Flags all `@ts-ignore` instances without exceptions. |
| `TS-NOCHECK` | `strict_mode_check.js` | Regex | Strict | Flags all `@ts-nocheck` instances. |
| `TS-EXPECT-ERR` | `strict_mode_check.js` | Regex | Strict | Flags `@ts-expect-error`. Does not currently verify if a justification comment accompanies it. |
| `AS-ANY` | `strict_mode_check.js` | Regex | Strict | Flags `as any`. |
| `ANY-TYPE` | `strict_mode_check.js` | Regex | Strict | Flags `: any`. May miss complex generic usages (`Promise<any>`). |
| `IMPLICIT-ANY` | N/A | N/A | Manual | Best handled natively by `tsc --noImplicitAny`. |

## Handling Async

| Rule ID | Detector Script | Method | Enforcement Level | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| `ASYNC-FOREACH` | `async_smell_check.js` | Regex | Strict | Flags `.forEach(async ...)`. |
| `PROMISE-CONSTRUCTOR-ANTI` | `async_smell_check.js` | Regex | Heuristic | Flags `new Promise` containing `async` or `.then`. May flag legitimate promisification of legacy callback APIs. |
| `ASYNC-NO-AWAIT` | `async_smell_check.js` | AST | Heuristic | Flags `async` functions lacking `await`. Acceptable for interface conformance or wrapping thrown errors. |
| `FLOATING-PROMISE` | N/A | N/A | Manual | Better handled by `@typescript-eslint/no-floating-promises` which has access to the full type checker. |

## Handling Errors

| Rule ID | Detector Script | Method | Enforcement Level | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| `EMPTY-CATCH` | `error_smell_check.js` | Regex | Strict | Detects `catch(e) {}` on single and immediately adjacent lines. Will *not* flag if the block contains comments. |
| `THROW-NON-ERROR` | `error_smell_check.js` | Regex | Strict | Detects throwing strings, numbers, booleans, etc. |
| `SWALLOWED-PROMISE` | `error_smell_check.js` | Regex | Strict | Detects `.catch(() => {})`. |
| `CUSTOM-ERROR-CLASS` | N/A | N/A | Manual | Verifying that custom errors inherit properly and capture stack traces is complex to automate reliably across different build targets. |
