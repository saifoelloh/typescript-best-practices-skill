# GoF Patterns - TypeScript Mapping

This document provides a mapping between all 23 classic Gang of Four (GoF) patterns and modern TypeScript idioms.

## Creational Patterns (5)

| Pattern | Code Smell | TS Idiom | Source |
|---------|------------|----------|--------|
| **Factory Method** | Duplicate `new` keyword, `switch` in constructor | Factory functions, type maps | GoF p. 107 |
| **Abstract Factory** | Inconsistent families of objects | Interfaces + higher-order functions | GoF p. 87 |
| **Builder** | Telescoping constructor (many optional params) | Fluent interface, `Partial<T>` | GoF p. 97 |
| **Prototype** | Expensive object creation from scratch | `structuredClone()`, spread operator | GoF p. 117 |
| **Singleton** | Global state, hard to test | Module constants (ESM), DI container scope | GoF p. 127 |

> **Note on Singleton:** In TypeScript/ESM, module-level `const` is naturally a singleton. Avoid class-based Singleton unless you need lazy initialization or DI scope control. Singletons complicate testing — prefer dependency injection.

## Structural Patterns (7)

| Pattern | Code Smell | TS Idiom | Source |
|---------|------------|----------|--------|
| **Adapter** | API incompatibility between systems | Interface wrappers, mapping functions | GoF p. 139 |
| **Bridge** | Abstraction coupled to implementation | Separate interface hierarchies | GoF p. 151 |
| **Composite** | Manual tree traversal, recursive structures | Recursive interfaces, `children: T[]` | GoF p. 163 |
| **Decorator** | Class explosion, cross-cutting concerns | TS decorators (`@`), function composition, higher-order functions | GoF p. 175 |
| **Facade** | Complex subsystem with many entry points | Simplified wrapper module, barrel exports | GoF p. 185 |
| **Flyweight** | Memory bloat from many similar objects | Shared immutable data, object pools, `Map` caches | GoF p. 195 |
| **Proxy** | Expensive creation, access control, logging | Native ES6 `Proxy`, interceptor patterns | GoF p. 207 |

## Behavioral Patterns (11)

| Pattern | Code Smell | TS Idiom | Source |
|---------|------------|----------|--------|
| **Chain of Responsibility** | Hard-coded conditional dispatching | Middleware chains (Express), handler arrays | GoF p. 223 |
| **Command** | Fat UI/controller with business logic | Command classes, request objects, CQRS | GoF p. 233 |
| **Interpreter** | Repeated parsing of domain-specific expressions | Template literal types, tagged templates, parser combinators | GoF p. 243 |
| **Iterator** | Custom collection traversal logic | `Symbol.iterator`, generators (`function*`), `for...of` | GoF p. 257 |
| **Mediator** | Many-to-many object communication | Event bus, EventEmitter, RxJS Subject | GoF p. 273 |
| **Memento** | No undo/redo support, state rollback needed | Immutable snapshots, `structuredClone()` | GoF p. 283 |
| **Observer** | Tight coupling for updates/notifications | EventEmitter, RxJS, Promises/callbacks | GoF p. 293 |
| **State** | Complex conditional behavior based on object state | State interface + concrete state classes | GoF p. 305 |
| **Strategy** | Massive `switch` statements, `if/else` chains | Functional strategies, interface + record map | GoF p. 315 |
| **Template Method** | Duplicated algorithm structure across subclasses | Abstract class with `protected` hooks, or higher-order functions | GoF p. 325 |
| **Visitor** | Adding operations to a class hierarchy without modifying it | Double dispatch, discriminated unions + `switch` | GoF p. 331 |

---

## Best Practices

1. **Prefer Composition**: Attempt to solve a problem with composition (interfaces, mixins, higher-order functions) before reaching for class inheritance.
2. **Be Pragmatic**: Don't apply a pattern if a simple function will do. Over-engineering with patterns is worse than no patterns at all.
3. **Type Safety**: Leverage TS generics and discriminated unions to make patterns type-safe.
4. **Modern TS**: Many GoF patterns were designed for languages without first-class functions. In TypeScript, a Strategy is often just a function parameter, an Observer is an EventEmitter, and a Factory is a plain function.
