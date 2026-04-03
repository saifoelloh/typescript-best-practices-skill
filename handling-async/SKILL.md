---
name: handling-async
description: Manages TypeScript async/await and Promise patterns. Use to prevent common async mistakes, optimize concurrency, and handle promise rejections correctly.
metadata:
  sources:
    - "You Don't Know JS: Async & Performance (Kyle Simpson)"
    - "Node.js Best Practices (goldbergyoni)"
    - "JavaScript: The Definitive Guide (David Flanagan)"
---

# Async Patterns - TypeScript Best Practices

Master async/await, promises, and concurrent operations to build reliable async code.

## When to Use

- Reviewing async/await code
- Optimizing API calls and I/O operations
- Debugging promise-related issues
- Implementing concurrent workflows
- Handling timeouts and cancellation

**Trigger Phrases:**
- "Review async code"
- "Optimize async operations"
- "Fix promise handling"
- "Check concurrent execution"

## Rules Overview

Detailed guidance for these rules is available in [RULES.md](./references/RULES.md).

### Critical (2 rules)
1. **critical-promise-not-awaited** — Always await promises or handle with `.then()`. Floating promises cause silent failures.
2. **critical-promise-constructor-anti** — Avoid `new Promise()` wrapping existing async operations.

### High Priority (5 rules)
3. **high-async-without-await** — An `async` function with no `await` is usually unnecessary overhead. _(Heuristic: interface conformance or returning a pre-existing promise may justify it.)_
4. **high-parallel-sequential-confusion** — Use `Promise.all()` for independent parallel operations.
5. **high-promise-timeout** — Implement timeouts to prevent hanging operations. Use `AbortController` / `AbortSignal.timeout()` for fetch-like APIs, or `Promise.race()` for generic orchestration.
6. **high-async-forEach** — Don't use `forEach()` with async callbacks — promises are silently dropped.
7. **high-promise-chaining** — Prefer async/await over long `.then()` chains for readability.

### Medium Priority (3 rules)
8. **medium-concurrent-limit** — Limit concurrent operations with pooling to prevent resource exhaustion.
9. **medium-promise-allsettled** — Use `Promise.allSettled()` when partial failures are acceptable.
10. **medium-async-iife** — Use top-level await (ES2022+) or async IIFE with proper error handling.

---

## Summary

Async patterns ensure:
- ✅ All promises awaited or explicitly handled
- ✅ Parallel execution where possible
- ✅ Timeouts via AbortController or Promise.race()
- ✅ Proper forEach alternatives
- ✅ Fault-tolerant concurrent operations
- ✅ Readable async/await over chains

Refer to the [Detailed Rule Catalog](./references/RULES.md) for examples and detection criteria.
