# GoF Patterns - TypeScript Mapping

This document provides a detailed mapping between classic Gang of Four (GoF) patterns and modern TypeScript idioms.

## Creational Patterns

| Pattern | Code Smell | TS Idiom | Source Mapping |
|---------|------------|----------|----------------|
| **Factory Method** | Duplicate `new` keyword, `switch` in constructor | Factory Functions, Type Maps | GoF p. 107, Effective TS Item 4.2 |
| **Abstract Factory** | Inconsistent families of objects | Interfaces + Higher-Order Functions | GoF p. 87 |
| **Builder** | Telescoping Constructor (many optional params) | Fluent Interface, Partial Objects | GoF p. 97 |
| **Singleton** | Global state, hard to test | Module Constants (ESM) | GoF p. 127 (Use with CAUTION in TS) |

## Structural Patterns

| Pattern | Code Smell | TS Idiom | Source Mapping |
|---------|------------|----------|----------------|
| **Adapter** | API Incompatibility | Interface Wrappers | GoF p. 139 |
| **Decorator** | Class Explosion, Cross-cutting concerns | TS Decorators (@), Function Composition | GoF p. 175 |
| **Proxy** | Expensive creation, Access control | Native `Proxy` object, Interceptors | GoF p. 207 |
| **Composite** | Manual tree traversal | Recursive Interfaces | GoF p. 163 |

## Behavioral Patterns

| Pattern | Code Smell | TS Idiom | Source Mapping |
|---------|------------|----------|----------------|
| **Strategy** | Massive `switch` statements, `if/else` chains | Functional Strategies, Interfaces | GoF p. 315, Refactoring (Fowler) |
| **Observer** | Tight coupling for updates | EventEmitter, RxJS, Promises/Callbacks | GoF p. 293 |
| **Command** | "Fat" UI components with business logic | Command Classes, Request Objects | GoF p. 233 |

---

## Best Practices
1. **Prefer Composition**: Always attempt to solve a problem with composition (interfaces/mixins) before reaching for class inheritance.
2. **Be Pragmatic**: Don't apply a pattern if a simple function will do.
3. **Type Safety**: Leverage TS generics and discriminated unions to make patterns type-safe.
