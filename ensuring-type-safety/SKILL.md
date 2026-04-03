---
name: ensuring-type-safety
description: Enforces TypeScript type system best practices. Use to detect unsafe type usage, verify strict mode, and prevent runtime type errors.
metadata:
  sources:
    - "Effective TypeScript (Dan Vanderkam)"
    - "TypeScript Handbook (Official)"
    - "Programming TypeScript (Boris Cherny)"
---

# Type Safety - TypeScript Best Practices

Ensure type-safe code by avoiding `any`, using proper type guards, and enabling strict mode.

## When to Use

- Writing new TypeScript code
- Reviewing code for type safety issues
- Migrating JavaScript to TypeScript
- Debugging type-related runtime errors

**Trigger Phrases:**
- "Check for type safety issues"
- "Review TypeScript types"
- "Find unsafe type usage"
- "Is this type-safe?"

## Rules Overview

Detailed guidance for these rules is available in [RULES.md](./references/RULES.md).

### Critical (2 rules)
1. **critical-any-escape-hatch** — Avoid `any`, use `unknown` or proper types
2. **critical-null-undefined-confusion** — Distinguish `null` from `undefined` correctly

### High Priority (5 rules)
3. **high-unsafe-type-assertion** — Avoid unsafe `as` assertions (especially `as any`, unvalidated API data). Safe uses exist (DOM APIs after null-check, `as const`). _(Heuristic: the problem is unvalidated assertions, not every `as`.)_
4. **high-strict-mode-disabled** — Always enable `strict: true` in tsconfig
5. **high-implicit-any** — All function parameters must have explicit types
6. **high-type-narrowing** — Use discriminated unions instead of type assertions for safe narrowing
7. **high-optional-chaining-abuse** — Don't use `?.` to hide type issues

### Medium Priority (3 rules)
8. **medium-generic-constraints** — Constrain generic types properly
9. **medium-index-signatures** — Prefer mapped types or `Record<>` over loose index signatures
10. **medium-type-vs-interface** — Use interfaces for object shapes, types for unions. _(Team heuristic: both work for object shapes. The distinction matters mainly for declaration merging and extends/implements.)_

---

## Summary

Type safety is the foundation of TypeScript's value. These 10 rules ensure:
- ✅ No `any` escape hatches
- ✅ Safe type assertions (not blanket prohibition of `as`)
- ✅ Strict mode enabled
- ✅ Proper generic constraints
- ✅ Clear null/undefined semantics

Refer to the [Detailed Rule Catalog](./references/RULES.md) for examples and detection criteria.
