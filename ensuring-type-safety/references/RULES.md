# Type Safety Rules

Detailed guidance for the 10 core rules in the Type Safety skill.

---

## 1. critical-any-escape-hatch

**Why it matters:** `any` disables type checking, defeating TypeScript's purpose.

**❌ Incorrect:**
```typescript
function processData(data: any) {
  return data.value.toUpperCase(); // No type safety!
}
```

**✅ Correct:**
```typescript
interface DataWithValue {
  value: string;
}

function processData(data: DataWithValue) {
  return data.value.toUpperCase(); // Type-safe!
}
```

**When `unknown` is the right answer:**
```typescript
function parsePayload(raw: unknown): UserData {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Expected object');
  }
  // Validate and narrow from unknown
}
```

**Impact:** CRITICAL — Prevents entire classes of runtime errors

**ESLint equivalent:** `@typescript-eslint/no-explicit-any`

---

## 2. high-unsafe-type-assertion

> **Classification: Heuristic — the problem is unsafe assertions, not every `as` usage.**

**Why it matters:** Type assertions (`as Type`) bypass the type checker. When used on unvalidated data (e.g., API responses, `JSON.parse` results), they create a false sense of type safety.

**❌ Unsafe — asserting on unvalidated external data:**
```typescript
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data as User; // Unsafe! No runtime validation
}
```

**✅ Correct — validate then use:**
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && obj !== null && 'email' in obj
  );
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  if (!isUser(data)) {
    throw new Error('Invalid user data from API');
  }
  return data;
}
```

**Legitimate uses of type assertions:**
```typescript
// 1. DOM APIs after null check
const input = document.getElementById('email');
if (input) {
  const emailInput = input as HTMLInputElement; // Safe: we know it's an input
  emailInput.value = '';
}

// 2. Const assertions (not type assertions in the unsafe sense)
const COLORS = ['red', 'green', 'blue'] as const;

// 3. Narrowing supplement where the type system can't infer
interface ApiResponse<T> {
  data: T;
  error: null;
}
// After checking response.error === null, assertion on data may be reasonable
```

**Impact:** HIGH — Prevents runtime errors from API changes

---

## 3. critical-null-undefined-confusion

**Why it matters:** Mixing `null` and `undefined` leads to subtle bugs and unclear semantics.

**❌ Incorrect:**
```typescript
interface User {
  age: number | null | undefined; // Confusion!
}
```

**✅ Correct — agree on a convention:**
```typescript
// Convention A: use undefined for "not provided" (aligns with optional properties)
interface User {
  age?: number; // undefined = not provided
}

// Convention B: use null for "explicitly no value" in database-backed types
interface DbUser {
  deletedAt: Date | null; // null = not deleted, Date = deleted
}
```

**Impact:** MEDIUM-HIGH — Improves code clarity

---

## 4. high-strict-mode-disabled

**Why it matters:** Strict mode catches many common bugs at compile time.

**Detection:** Use `scripts/strict_mode_check.js` to automatically verify `tsconfig.json`.

**❌ Incorrect:**
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

**✅ Correct:**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Impact:** HIGH — Enables all type safety features

---

## 5. high-implicit-any

**Why it matters:** Implicit `any` silently disables type checking for parameters.

**❌ Incorrect:**
```typescript
function multiply(a, b) { // Implicit any
  return a * b;
}
```

**✅ Correct:**
```typescript
function multiply(a: number, b: number): number {
  return a * b;
}
```

**Impact:** HIGH — Catches type errors at function boundaries

---

## 6. high-type-narrowing

**Why it matters:** Discriminated unions are safer than type assertions for narrowing.

**❌ Incorrect:**
```typescript
function getArea(shape: Shape) {
  if ('radius' in shape) {
    return Math.PI * (shape as Circle).radius ** 2;
  }
}
```

**✅ Correct:**
```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // TS narrows automatically
    case 'square':
      return shape.side ** 2;
  }
}
```

**Impact:** MEDIUM-HIGH — Improves type safety

---

## 7. high-optional-chaining-abuse

**Why it matters:** Optional chaining (`?.`) can hide missing data issues rather than revealing them.

**❌ Incorrect:**
```typescript
const email = user.profile?.email;
if (email) { send(email); } // Silently fails if profile is missing
```

**✅ Correct:**
```typescript
if (user.profile?.email) {
  send(user.profile.email);
} else {
  throw new Error('Email required for notification');
}
```

**Note:** Optional chaining itself is not bad — it's a great tool for truly optional data. The smell is using it to avoid thinking about whether data should actually be required.

**Impact:** MEDIUM — Prevents silent failures

---

## 8. medium-generic-constraints

**Why it matters:** Unconstrained generics can accept any type, reducing type safety.

**❌ Incorrect:**
```typescript
function getProperty<T>(obj: T, key: string) { return obj[key]; }
```

**✅ Correct:**
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

**Impact:** MEDIUM — Improves generic function safety

---

## 9. medium-index-signatures

**Why it matters:** Index signatures allow any string key, losing type safety for known shapes.

**❌ Incorrect:**
```typescript
interface Config { [key: string]: string; }
```

**✅ Correct:**
```typescript
type ConfigKeys = 'apiUrl' | 'timeout' | 'retries';
type Config = Record<ConfigKeys, string>;
```

**Impact:** MEDIUM — Catches typos and wrong keys

---

## 10. medium-type-vs-interface

> **Classification: Team heuristic, not a hard correctness rule.**

**Why it matters:** Choosing the right construct improves code consistency and clarity within a team.

**Guideline:**
- Use **interface** for object shapes that may be extended or implemented
- Use **type** for unions, intersections, mapped types, and utility types

**Both work for simple object shapes:**
```typescript
// Both are valid — pick one and be consistent
interface UserProps { name: string; age: number; }
type UserProps = { name: string; age: number };
```

**Where the distinction matters:**
```typescript
// Interface: declaration merging (useful for module augmentation)
interface Window { myCustomProp: string; }

// Interface: class implements
interface Serializable { serialize(): string; }
class User implements Serializable { ... }

// Type: unions (interface cannot do this)
type Result = Success | Failure;

// Type: mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

**Impact:** LOW-MEDIUM — Improves code organization

**Reference:** [TypeScript Handbook — Differences Between Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
