# Gang of Four (GoF) Design Patterns Catalog

This catalog contains the classic 23 design patterns from the book "Design Patterns: Elements of Reusable Object-Oriented Software" by Gamma, Helm, Johnson, and Vlissides. Each pattern includes its intent, detection rules for AI agents, and a TypeScript implementation example.

## I. Creational Patterns
These patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

### 1. Abstract Factory
**Intent**: Provide an interface for creating families of related or dependent objects without specifying their concrete classes.
**Detection**: Look for code that instantiates related sets of objects (e.g., standard vs. custom UI widgets) using literal `new` calls, making it hard to switch families.
**TypeScript Example**:
```typescript
interface Button { render(): void; }
interface Checkbox { toggle(): void; }

class WindowsButton implements Button { render() { console.log("Windows Button"); } }
class MacButton implements Button { render() { console.log("Mac Button"); } }

interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WindowsFactory implements GUIFactory {
  createButton() { return new WindowsButton(); }
  createCheckbox() { return { toggle: () => console.log("Win Checkbox") }; }
}
```

### 2. Builder
**Intent**: Separate the construction of a complex object from its representation so that the same construction process can create different representations.
**Detection**: Look for constructors with many parameters (telescoping constructor) or complex multi-step object initialization logic.
**TypeScript Example**:
```typescript
class Car {
  parts: string[] = [];
}

class CarBuilder {
  private car = new Car();
  reset() { this.car = new Car(); }
  setEngine(e: string) { this.car.parts.push(e); return this; }
  setSeats(n: number) { this.car.parts.push(`${n} seats`); return this; }
  build() { return this.car; }
}
```

### 3. Factory Method
**Intent**: Define an interface for creating an object, but let subclasses decide which class to instantiate.
**Detection**: Look for a base class that needs to instantiate a member but doesn't know which specific subclass to use until runtime.
**TypeScript Example**:
```typescript
abstract class Creator {
  abstract factoryMethod(): Product;
  someOperation() {
    const product = this.factoryMethod();
    return product.operation();
  }
}
```

### 4. Prototype
**Intent**: Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.
**Detection**: Look for complex object instantiation where many fields are identical to an existing "template" object.
**TypeScript Example**:
```typescript
interface Prototype { clone(): Prototype; }

class ConcretePrototype implements Prototype {
  constructor(public state: string) {}
  clone() { return new ConcretePrototype(this.state); }
}
```

### 5. Singleton
**Intent**: Ensure a class only has one instance and provide a global point of access to it.
**Detection**: Look for global variables or objects that should only ever exist once (e.g., Database Connection Pool).
**TypeScript Example**:
```typescript
class Database {
  private static instance: Database;
  private constructor() {}
  static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }
}
```

## II. Structural Patterns
These patterns deal with object composition and structure.

### 6. Adapter
**Intent**: Convert the interface of a class into another interface clients expect.
**Detection**: Look for incompatible interfaces where one service needs to call another, but the method signatures don't match.
**TypeScript Example**:
```typescript
class OldService { oldRequest() { return "old"; } }
interface Target { request(): string; }

class Adapter implements Target {
  constructor(private old: OldService) {}
  request() { return this.old.oldRequest(); }
}
```

### 7. Bridge
**Intent**: Decouple an abstraction from its implementation so that the two can vary independently.
**Detection**: Look for hierarchies where orthogonal concepts are coupled (e.g., Shape and Color), leading to a combinatorial explosion of classes.
**TypeScript Example**:
```typescript
interface Implementation { operation(): string; }
class Abstraction {
  constructor(protected imp: Implementation) {}
  feature() { return this.imp.operation(); }
}
```

### 8. Composite
**Intent**: Compose objects into tree structures to represent part-whole hierarchies.
**Detection**: Look for tree-like data structures where clients should treat individual objects and branches uniformly.
**TypeScript Example**:
```typescript
interface Component { execute(): void; }
class Leaf implements Component { execute() { /* ... */ } }
class Composite implements Component {
  private children: Component[] = [];
  execute() { this.children.forEach(c => c.execute()); }
}
```

### 9. Decorator
**Intent**: Attach additional responsibilities to an object dynamically.
**Detection**: Look for situations where you need to add features (e.g., logging, encryption) to an object without subclassing it or changing its core class.
**TypeScript Example**:
```typescript
interface DataSource { write(): void; }
class BaseSource implements DataSource { write() { /* ... */ } }
class EncryptionDecorator implements DataSource {
  constructor(private wrappee: DataSource) {}
  write() { /* encrypt */ this.wrappee.write(); }
}
```

### 10. Facade
**Intent**: Provide a unified interface to a set of interfaces in a subsystem.
**Detection**: Look for complex interactions across multiple classes that can be simplified into a single entry point for common tasks.
**TypeScript Example**:
```typescript
class ComplexSubsystem { start() {} stop() {} }
class Facade {
  private sub = new ComplexSubsystem();
  easyRun() { this.sub.start(); this.sub.stop(); }
}
```

### 11. Flyweight
**Intent**: Use sharing to support large numbers of fine-grained objects efficiently.
**Detection**: High memory usage due to thousands of similar objects where most state can be shared (intrinsic state).
**TypeScript Example**:
```typescript
class TreeType { constructor(private name: string, private color: string) {} }
class Tree { constructor(private x: number, private y: number, private type: TreeType) {} }
```

### 12. Proxy
**Intent**: Provide a surrogate or placeholder for another object to control access to it.
**Detection**: Situations where an object is expensive to load (Virtual Proxy), requires access control (Protection Proxy), or logging (Logging Proxy).
**TypeScript Example**:
```typescript
interface Service { request(): void; }
class RealService implements Service { request() {} }
class ProxyService implements Service {
  private real: RealService | null = null;
  request() { if (!this.real) this.real = new RealService(); this.real.request(); }
}
```

## III. Behavioral Patterns
These patterns deal with communication between objects.

### 13. Chain of Responsibility
**Intent**: Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request.
**Detection**: A series of `if-else` or `switch` statements that decide which "handler" should process a request based on various conditions.
**TypeScript Example**:
```typescript
abstract class Handler {
  next?: Handler;
  handle(req: any): void { this.next?.handle(req); }
}
```

### 14. Command
**Intent**: Encapsulate a request as an object, thereby letting you parameterize clients with different requests.
**Detection**: Operations that need to be queued, logged, or undone.
**TypeScript Example**:
```typescript
interface Command { execute(): void; }
class SaveCommand implements Command { execute() { /* save logic */ } }
```

### 15. Interpreter
**Intent**: Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.
**Detection**: Parsing simple domain-specific languages or mathematical expressions.
**TypeScript Example**:
```typescript
interface Expression { interpret(context: string): boolean; }
```

### 16. Iterator
**Intent**: Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.
**Detection**: Code that iterates over internal collections, exposing implementation details like array vs. linked list.
**TypeScript Example**:
```typescript
interface Iterator<T> { next(): T; hasNext(): boolean; }
```

### 17. Mediator
**Intent**: Define an object that encapsulates how a set of objects interact.
**Detection**: "Spaghetti" code where many objects refer to each other directly, making it hard to change any single object.
**TypeScript Example**:
```typescript
interface Mediator { notify(sender: object, event: string): void; }
```

### 18. Memento
**Intent**: Capture and externalize an object's internal state so that the object can be restored to this state later.
**Detection**: "Undo" functionality where public object state isn't enough to fully restore the previous state.
**TypeScript Example**:
```typescript
class Memento { constructor(private state: string) {} getState() { return this.state; } }
```

### 19. Observer
**Intent**: Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.
**Detection**: Situations where one object's state change must trigger actions in a dynamic list of other objects.
**TypeScript Example**:
```typescript
class Subject {
  private observers: Observer[] = [];
  notify() { this.observers.forEach(o => o.update()); }
}
```

### 20. State
**Intent**: Allow an object to alter its behavior when its internal state changes.
**Detection**: Large `switch` statements in a single class where the behavior of almost every method depends on a `status` field.
**TypeScript Example**:
```typescript
abstract class State { abstract handleWork(): void; }
class LockedState extends State { handleWork() { /* ... */ } }
```

### 21. Strategy
**Intent**: Define a family of algorithms, encapsulate each one, and make them interchangeable.
**Detection**: Switching between different ways of doing a single task (e.g., sorting, compression) at runtime.
**TypeScript Example**:
```typescript
interface Strategy { doAlgorithm(data: string[]): string[]; }
```

### 22. Template Method
**Intent**: Define the skeleton of an algorithm in an operation, deferring some steps to subclasses.
**Detection**: Multiple classes share much of the same logic but differ in a few specific steps.
**TypeScript Example**:
```typescript
abstract class AbstractClass {
  templateMethod() { this.step1(); this.step2(); }
  abstract step1(): void;
  protected step2() { /* default */ }
}
```

### 23. Visitor
**Intent**: Represent an operation to be performed on the elements of an object structure.
**Detection**: You need to add many unrelated operations to a complex object structure (e.g., an AST) without modifying the classes.
**TypeScript Example**:
```typescript
interface Visitor { visitLeaf(l: Leaf): void; visitComposite(c: Composite): void; }
```
