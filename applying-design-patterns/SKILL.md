---
name: applying-design-patterns
description: Guides the application of Gang of Four (GoF) design patterns in TypeScript. Focuses on identifying "code smells" and refactoring to patterns that improve extensibility and maintainability.
metadata:
  sources:
    - "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)"
    - "Effective TypeScript (Dan Vanderkam)"
    - "Refactoring: Improving the Design of Existing Code (Martin Fowler)"
---

# Design Patterns - TypeScript Best Practices

This skill provides rules for identifying when to apply specific design patterns to solve common structural and behavioral challenges in modern TypeScript applications.

## 1. high-strategy-pattern-refactor

**Why it matters:** Extensive `switch` or `if/else` chains for varying behavior make code fragile and violate the Open/Closed Principle. Adding a new behavior requires modifying the existing logic.

**Detection (Code Smell):**
- A method contains a `switch(type)` or `if(type === 'A') ... else if(type === 'B')` that implements different algorithms.

**❌ Incorrect (Switch Smell):**
```typescript
function calculateShipping(type: string, weight: number): number {
  switch (type) {
    case 'EXPRESS': return weight * 10;
    case 'STANDARD': return weight * 5;
    case 'FREE': return 0;
    default: throw new Error('Unknown type');
  }
}
```

**✅ Correct (Strategy Pattern):**
```typescript
interface ShippingStrategy {
  calculate(weight: number): number;
}

const strategies: Record<string, ShippingStrategy> = {
  EXPRESS: { calculate: (w) => w * 10 },
  STANDARD: { calculate: (w) => w * 5 },
  FREE: { calculate: () => 0 }
};

function calculateShipping(type: string, weight: number): number {
  const strategy = strategies[type];
  if (!strategy) throw new Error('Unknown type');
  return strategy.calculate(weight);
}
```

---

## 2. high-factory-method-instantiation

**Why it matters:** Direct instantiation (`new ConcreteClass()`) couples the client to the specific implementation, making testing and future changes difficult.

**✅ Correct:**
- Use a Factory function or class to centralize object creation, especially when the type of object is determined at runtime.

```typescript
type NotificationType = 'EMAIL' | 'SMS';

interface NotificationProvider {
  send(message: string): void;
}

export const NotificationFactory = {
  create(type: NotificationType): NotificationProvider {
    if (type === 'EMAIL') return new EmailProvider();
    return new SmsProvider();
  }
};
```

---

## 3. medium-observer-decoupling

**Why it matters:** Tight coupling between components where one must notify others of changes leads to "Shotgun Surgery" (one change requiring many small changes elsewhere).

**✅ Correct:**
- Use the Observer pattern (or EventEmitter in Node.js) to allow components to react to events without knowing about each other.

---

## 4. high-decorator-behavior-extension

**Why it matters:** Inheritance often leads to "Class Explosion" when trying to combine multiple independent behaviors.

**✅ Correct:**
- Use the Decorator pattern to wrap objects and add behavior dynamically. In TypeScript, leverage **Decorators** (standard or experimental) for elegant cross-cutting concerns (logging, validation).

---

## 5. medium-proxy-intercept

**Why it matters:** Adding cross-cutting concerns like logging, caching, or access control directly into business logic violates the Single Responsibility Principle.

**✅ Correct:**
- Use the Proxy pattern (or native ES6 `Proxy`) to intercept and augment behavior without modifying the original object.

---

## References & Tools

- [GoF Patterns Detailed Mapping](./references/GOF_PATTERNS.md)
- [General Refactoring Rules](./references/RULES.md)
- [Smell Detection Script](./scripts/detect-strategy-smell.js)
