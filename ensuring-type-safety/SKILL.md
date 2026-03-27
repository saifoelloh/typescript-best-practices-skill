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

### Critical (3 rules)
1. **critical-any-escape-hatch** - Avoid `any`, use `unknown` or proper types
2. **critical-type-assertion-unsafe** - Prefer type guards over assertions (`as`)
3. **critical-null-undefined-confusion** - Distinguish `null` from `undefined` correctly

### High Priority (4 rules)
4. **high-strict-mode-disabled** - Always enable `strict: true` in tsconfig
5. **high-implicit-any** - All function parameters must have explicit types
6. **high-type-narrowing** - Use discriminated unions instead of type assertions
7. **high-optional-chaining-abuse** - Don't use `?.` to hide type issues

### Medium Priority (3 rules)
8. **medium-generic-constraints** - Constrain generic types properly
9. **medium-index-signatures** - Prefer mapped types over index signatures
10. **medium-type-vs-interface** - Use interfaces for object shapes, types for unions

---

## Summary

Type safety is the foundation of TypeScript's value. These 10 rules ensure:
- ✅ No `any` escape hatches
- ✅ Type guards instead of assertions
- ✅ Strict mode enabled
- ✅ Proper generic constraints
- ✅ Clear null/undefined semantics

Refer to the [Detailed Rule Catalog](./references/RULES.md) for examples and detection criteria.
me type errors and improves code maintainability.
