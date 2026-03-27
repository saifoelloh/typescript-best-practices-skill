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

**Impact:** HIGH - Prevents entire classes of runtime errors

---

## 2. critical-type-assertion-unsafe

**Why it matters:** Type assertions (`as Type`) bypass type checking and can hide bugs.

**❌ Incorrect:**
```typescript
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data as User; // Unsafe! No runtime validation
}
```

**✅ Correct:**
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && obj !== null && 'email' in obj
  );
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (!isUser(data)) {
    throw new Error('Invalid user data from API');
  }
  return data;
}
```

**Impact:** HIGH - Prevents runtime errors from API changes

---

## 3. critical-null-undefined-confusion

**Why it matters:** Mixing `null` and `undefined` leads to subtle bugs and unclear semantics.

**❌ Incorrect:**
```typescript
interface User {
  age: number | null | undefined; // Confusion!
}
```

**✅ Correct:**
```typescript
interface User {
  age?: number; // undefined = not provided, null = explicitly no value
}
```

**Impact:** MEDIUM-HIGH - Improves code clarity

---

## 4. high-strict-mode-disabled

**Why it matters:** Strict mode catches many common bugs at compile time.

**Detection:**
- Use `scripts/strict_mode_check.js` to automatically verify `tsconfig.json`.

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

**Impact:** HIGH - Enables all type safety features

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

**Impact:** HIGH - Catches type errors at function boundaries

---

## 6. high-type-narrowing

**Why it matters:** Discriminated unions are safer than type assertions.

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
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
  }
}
```

**Impact:** MEDIUM-HIGH - Improves type safety

---

## 7. high-optional-chaining-abuse

**Why it matters:** Optional chaining (`?.`) can hide missing data issues.

**❌ Incorrect:**
```typescript
const email = user.profile?.email;
if (email) { send(email); } // Silently fails if missing
```

**✅ Correct:**
```typescript
if (user.profile?.email) {
  send(user.profile.email);
} else {
  throw new Error('Email required');
}
```

**Impact:** MEDIUM - Prevents silent failures

---

## 8. medium-generic-constraints

**Why it matters:** Unconstrained generics can accept any type.

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

**Impact:** MEDIUM - Improves generic function safety

---

## 9. medium-index-signatures

**Why it matters:** Index signatures allow any string key, losing type safety.

**❌ Incorrect:**
```typescript
interface Config { [key: string]: string; }
```

**✅ Correct:**
```typescript
type ConfigKeys = 'apiUrl' | 'timeout' | 'retries';
type Config = Record<ConfigKeys, string>;
```

**Impact:** MEDIUM - Catches typos and wrong keys

---

## 10. medium-type-vs-interface

**Why it matters:** Choosing the right construct improves code clarity.

**✅ Rules:**
- Use **interface** for object shapes (can be extended/merged).
- Use **type** for unions, intersections, and mapped types.

**Impact:** LOW-MEDIUM - Improves code organization
