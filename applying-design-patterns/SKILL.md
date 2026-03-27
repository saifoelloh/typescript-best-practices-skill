---
name: applying-design-patterns
description: Analyzes TypeScript code for smells and suggests refactoring patterns. Use when refactoring complex code, reducing technical debt, or improving maintainability.
metadata:
  sources:
    - "Design Patterns: Elements of Reusable Object-Oriented Software (Gamma et al.)"
    - "Refactoring: Improving the Design of Existing Code (Martin Fowler)"
    - "Clean Code (Robert C. Martin)"
    - "Refactoring.Guru"
---

# Design Patterns & Refactoring - TypeScript Best Practices

Detect code smells and apply proven refactoring patterns to improve maintainability.

## When to Use

- Refactoring complex or legacy code
- Reducing technical debt
- Simplifying large functions
- Improving code readability
- Extracting reusable patterns

**Trigger Phrases:**
- "Refactor this code"
- "Find code smells"
- "Reduce complexity"
- "Improve maintainability"

## Rules Overview

### High Priority (2 rules)
Critical refactoring needs:

1. **high-god-object** - Extract logic from 300+ line functions
2. **high-extract-method** - Name complex code blocks with descriptive methods

### Medium Priority (11 rules)
Code quality improvements:

3. **medium-primitive-obsession** - Replace primitives with value objects
4. **medium-long-parameter-list** - Use parameter objects for >5 params
5. **medium-data-clumps** - Extract repeated parameter groups  
6. **medium-feature-envy** - Move logic closer to data
7. **medium-magic-constants** - Replace magic numbers with named constants
8. **medium-builder-pattern** - Fluent API for complex construction
9. **medium-factory-constructor** - Validated object creation
10. **medium-introduce-parameter-object** - Group related parameters
11. **medium-switch-to-strategy** - Replace type switches with polymorphism
12. **medium-callback-hell** - Replace nested callbacks with async/await
13. **medium-law-of-demeter** - Reduce coupling, avoid message chains
14. **high-gof-patterns** - Apply one of the 23 classic Gang of Four patterns

---

## Rule Details

Detailed guidance for each rule is available in the [Refactoring Rules guide](./references/rules.md):

1.  **high-god-object**: Extract logic from 300+ line functions.
2.  **high-extract-method**: Name complex code blocks.
3.  **medium-primitive-obsession**: Replace primitives with value objects.
4.  **medium-long-parameter-list**: Use parameter objects for >5 params.
5.  **medium-data-clumps**: Extract repeated parameter groups.
6.  **medium-feature-envy**: Move logic closer to data.
7.  **medium-magic-constants**: Replace magic numbers.
8.  **medium-builder-pattern**: Fluent API for complex construction.
9.  **medium-factory-constructor**: Validated object creation.
10. **medium-introduce-parameter-object**: Group related parameters.
11. **medium-switch-to-strategy**: Replace type switches with polymorphism.
12. **medium-callback-hell**: Replace nested callbacks.
13. **medium-law-of-demeter**: Reduce coupling.
14. **high-gof-patterns**: Apply one of the 23 classic [Gang of Four patterns](./references/GOF_PATTERNS.md).

> [!TIP]
> Use `scripts/god_object_check.js` to automatically detect high-line-count functions.

---

## Usage Examples

**Refactor complex function:**
```
Find code smells in this function and suggest refactoring
```

**Review for maintainability:**
```
Check this code for design pattern improvements
```

**Simplify legacy code:**
```
Reduce complexity in this module
```

## Summary

Design patterns and refactoring improve:
- ✅ Code readability (Extract Method, Named Concepts)
- ✅ Maintainability (Single Responsibility)
- ✅ Extensibility (Strategy Pattern, Builder)
- ✅ Testability (Smaller Functions, Clear Dependencies)

Apply patterns when they simplify code, not dogmatically.
