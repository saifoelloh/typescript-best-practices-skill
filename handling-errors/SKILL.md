---
name: handling-errors
description: Manages TypeScript/JavaScript error handling best practices. Use to ensure proper error propagation, typed errors, and async error handling.
metadata:
  sources:
    - "You Don't Know JS - Async & Performance (Kyle Simpson)"
    - "Node.js Best Practices (goldbergyoni)"
    - "Effective TypeScript (Dan Vanderkam)"
---

# Error Handling - TypeScript Best Practices

Proper error handling prevents silent failures, improves debugging, and ensures reliability.

## 1. Rules Overview

### Critical (3 rules)
1. **critical-error-swallowing** - Never catch and ignore errors
2. **critical-unhandled-rejection** - Handle all promise rejections
3. **critical-throw-non-error** - Only throw Error objects

### High Priority (3 rules)
4. **high-error-context** - Include context in error messages
5. **high-custom-error-types** - Use typed error classes
6. **high-async-try-catch** - Proper error handling in async/await

### Medium Priority (1 rule)
7. **medium-error-boundaries** - Implement error boundaries at module level

---

## 2. Advanced Guidance

Detailed guidance, examples, and detection criteria for these rules are available in the **[Detailed Rule Catalog](./references/RULES.md)**.

## 3. Summary

Proper error handling ensures:
- ✅ No silent failures (catch-and-ignore)
- ✅ All rejections handled
- ✅ Error objects with stack traces
- ✅ Rich context for debugging
- ✅ Typed errors for recovery
- ✅ Consistent error boundaries

Following these rules prevents production incidents and enables effective debugging.
