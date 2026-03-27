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

### Critical (3 rules)
1. **critical-promise-not-awaited** - Always await promises or handle with `.then()`
2. **critical-async-without-await** - `async` functions must use `await`
3. **critical-promise-constructor-anti** - Avoid `new Promise()` when unnecessary

### High Priority (4 rules)
4. **high-parallel-sequential-confusion** - Use `Promise.all()` for parallel operations
5. **high-promise-race-timeout** - Implement timeouts with `Promise.race()`
6. **high-async-forEach** - Don't use `forEach()` with async functions
7. **high-promise-chaining** - Prefer async/await over `.then()` chains

### Medium Priority (3 rules)
8. **medium-concurrent-limit** - Limit concurrent operations with pooling
9. **medium-promise-allsettled** - Use `Promise.allSettled()` for fault tolerance
10. **medium-async-iife** - Use top-level await or async IIFE correctly

---

## Summary

Async patterns ensure:
- ✅ All promises awaited or handled
- ✅ Parallel execution where possible
- ✅ Timeouts prevent hanging
- ✅ Proper forEach alternatives
- ✅ Fault-tolerant concurrent operations
- ✅ Readable async/await over chains

Refer to the [Detailed Rule Catalog](./references/RULES.md) for examples and detection criteria.
