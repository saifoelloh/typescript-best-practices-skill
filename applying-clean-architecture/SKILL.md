---
name: applying-clean-architecture
description: Enforces Clean Architecture principles in TypeScript. Use to ensure layer isolation, dependency inversion, and business logic purity in Node.js applications.
metadata:
  sources:
    - "Clean Architecture: A Craftsman's Guide to Software Structure and Design (Robert C. Martin)"
    - "Domain-Driven Design (Eric Evans)"
    - "Working Effectively with Legacy Code (Michael Feathers)"
---

# Clean Architecture - TypeScript Best Practices

This skill provides rules and guidance for maintaining a scalable, testable, and maintainable architecture based on the principles of Clean Architecture and Domain-Driven Design (DDD).

## Core Principles

1.  **Independence of Frameworks**: The architecture does not depend on the existence of some library of feature-laden software.
2.  **Testability**: The business rules can be tested without the UI, Database, Web Server, or any other external element.
3.  **Independence of UI**: The UI can change easily, without changing the rest of the system.
4.  **Independence of Database**: You can swap out SQL for NoSQL, or change your ORM without breaking business logic.
5.  **Independence of any external agency**: Business rules simply don’t know anything about the outside world.

---

## 1. critical-layer-isolation

**Why it matters:** Importing infrastructure (Express, Sequelize) into the domain layer makes it impossible to test business logic in isolation and creates "leaky abstractions."

**❌ Incorrect:**
```typescript
// src/domain/entities/User.ts
import { Request } from 'express'; // Infrastructure leak!
import { Model, DataTypes } from 'sequelize'; // Infrastructure leak!

export class User extends Model {
  // Domain logic is now tied to Sequelize
}
```

**✅ Correct:**
```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// Infrastructure implementation lives elsewhere
```

**Impact:** CRITICAL - Ensures the core can survive technology changes.

---

## 2. high-dependency-inversion

**Why it matters:** High-level policy (use cases) should not depend on low-level detail (DB implementations). They should depend on abstractions.

**❌ Incorrect:**
```typescript
// src/application/use-cases/RegisterUser.ts
import { UserRepository } from '../../infrastructure/UserRepository'; // Direct dependency on implementation

export class RegisterUser {
  private repo = new UserRepository(); // Hardcoded instantiation
}
```

**✅ Correct:**
```typescript
// src/domain/repositories/IUserRepository.ts
export interface IUserRepository {
  save(user: User): Promise<void>;
}

// src/application/use-cases/RegisterUser.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class RegisterUser {
  constructor(private userRepo: IUserRepository) {} // Injected abstraction
}
```

**Impact:** HIGH - Decouples business logic from storage details.

---

## 3. high-use-case-orchestration

**Why it matters:** Business logic should be centralized in Use Cases (Interactors) to ensure it is discoverable and reusable.

**Detection:**
- Look for business logic inside Express controllers.
- Check for direct database calls in the UI/API layer.

**✅ Correct Pattern:**
```typescript
// src/application/use-cases/ProcessPayment.ts
export class ProcessPayment {
  constructor(
    private paymentService: IPaymentService,
    private orderRepo: IOrderRepo
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepo.find(orderId);
    await this.paymentService.process(order);
    order.markAsPaid();
    await this.orderRepo.save(order);
  }
}
```

**Impact:** HIGH - Improves discoverability and reduces "Fat Controllers."

---

## 4. high-screaming-architecture

**Why it matters:** The directory structure should reflect the business domain (The "What"), not the tools or frameworks (The "How").

**❌ Incorrect:**
```bash
src/
  controllers/
  models/
  views/
  routes/
```

**✅ Correct:**
```bash
src/
  orders/          # Domain-centric
    entities/
    use-cases/
    gateways/
  billing/         # Domain-centric
    entities/
    use-cases/
```

**Impact:** HIGH - Makes the system intent obvious from the first glance.

---

## 5. high-humble-delivery-mechanism

**Why it matters:** The Web, UI, and Frameworks are implementation details. Use the **Humble Object** pattern to separate untestable framework code from testable business logic.

**Detection:**
- Look for business logic intertwined with `req`, `res`, `document`, or specific library components.

**✅ Correct:**
1.  **Use Case (Smart):** Contains all the logic.
2.  **Controller/Presenter (Humble):** Simply passes data from the framework to the use case and transforms the output.

**Impact:** HIGH - Ensures maximum testability of core logic.

---

## 6. high-stable-dependency-direction

**Why it matters:** Dependencies must always point **inwards** towards the stable core (Entities/Use Cases). Stable components should not depend on volatile ones.

**The Rule:**
- Entities ← Use Cases ← Adapters ← Frameworks

**Impact:** HIGH - Prevents "Detail" changes from breaking "Core" business rules.

---

## 7. medium-dto-isolation

**Why it matters:** Domain entities should not be exposed directly to the outside world (API) as they may contain sensitive data or business logic.

**❌ Incorrect:**
```typescript
// src/infrastructure/controllers/UserController.ts
async function getUser(req: Request, res: Response) {
  const user = await userRepo.findById(req.params.id);
  res.json(user); // Sending the internal Domain Entity directly
}
```

**✅ Correct:**
```typescript
// src/application/dtos/UserDto.ts
export interface UserPresenter {
  id: string;
  displayName: string; // Transformed from Domain
}

// Controller uses a Mapper or DTO
```

**Impact:** MEDIUM - Protects domain integrity and improves security.

---

## References

- [Clean Architecture (Martin Fowler's take)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Study Notes: Clean Architecture by Robert C. Martin](./study-notes.md)
