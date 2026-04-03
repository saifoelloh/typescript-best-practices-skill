# Async & Promise Rules

Detailed guidance for the 10 core rules in the Async Patterns skill.

---

## 1. critical-promise-not-awaited

**Why it matters:** Forgotten `await` causes promises to execute but results are lost, leading to race conditions and unhandled rejections.

**❌ Incorrect:**
```typescript
async function updateUser(id: string, data: UserData) {
  validateData(data); // Forgot await! Promise ignored
  const user = await db.users.find(id);
  user.update(data); // Forgot await! Update might not complete
  return user;
}
```

**✅ Correct:**
```typescript
async function updateUser(id: string, data: UserData) {
  await validateData(data); // Wait for validation
  const user = await db.users.find(id);
  await user.update(data); // Wait for update
  return user;
}
```

**Impact:** CRITICAL — Prevents race conditions and data loss

**ESLint equivalent:** `@typescript-eslint/no-floating-promises`

---

## 2. critical-promise-constructor-anti

**Why it matters:** `new Promise()` wrapping an existing promise is unnecessarily complex and hides errors.

**❌ Incorrect:**
```typescript
function getUser(id: string): Promise<User> {
  return new Promise((resolve, reject) => {
    db.users.find(id)
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}
```

**✅ Correct:**
```typescript
async function getUser(id: string): Promise<User> {
  return db.users.find(id);
}
```

**Legitimate use:** `new Promise()` is appropriate when promisifying callback-based APIs that don't already return promises (e.g., wrapping `fs.readFile` in older Node.js).

**Impact:** HIGH — Simplifies code and avoids subtle bugs

---

## 3. high-async-without-await

> **Classification: Heuristic smell, not a universal error.**

**Why it matters:** An `async` function without `await` adds unnecessary Promise wrapping overhead and can mislead readers into thinking the function performs asynchronous work.

**❌ Usually wrong:**
```typescript
async function calculateTotal(items: Item[]): Promise<number> {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**✅ Better (remove async):**
```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Legitimate exceptions where `async` without `await` is acceptable:**
1. **Interface conformance**: The function must match an `() => Promise<T>` signature
2. **Future-proofing**: The function will gain `await` calls soon and changing the return type is expensive
3. **Error wrapping**: `async` automatically wraps thrown errors in rejected promises, which may be desired

```typescript
// Acceptable: conforming to an async interface
interface DataLoader {
  load(id: string): Promise<Data>;
}

class CachedLoader implements DataLoader {
  async load(id: string): Promise<Data> {
    return this.cache.get(id); // Sync, but interface requires Promise
  }
}
```

**Impact:** HIGH — Removes misleading code, but evaluate in context

---

## 4. high-parallel-sequential-confusion

**Why it matters:** Sequential execution when parallel is possible wastes time.

**❌ Incorrect:**
```typescript
async function loadUserData(userId: string) {
  const user = await db.users.find(userId);     // 100ms
  const posts = await db.posts.findByUser(userId); // 100ms
  const comments = await db.comments.findByUser(userId); // 100ms
  return { user, posts, comments }; // Total: ~300ms
}
```

**✅ Correct:**
```typescript
async function loadUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    db.users.find(userId),
    db.posts.findByUser(userId),
    db.comments.findByUser(userId),
  ]); // Total: ~100ms
  return { user, posts, comments };
}
```

**Note:** Only parallelize when operations are truly **independent**. If `posts` depends on `user.id`, sequential is correct.

**Impact:** HIGH — Significant performance improvement

---

## 5. high-promise-timeout

**Why it matters:** Operations without timeouts can hang indefinitely, blocking resources and degrading user experience.

### Approach A: AbortController (preferred for fetch-like APIs)

Modern APIs support `AbortSignal` natively. This is the preferred approach for `fetch`, database clients, and any API that accepts a `signal` parameter.

**✅ Correct (modern):**
```typescript
async function fetchData(url: string, timeoutMs = 5000): Promise<Response> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs), // Node 18+, all modern browsers
  });
  return response;
}
```

**Advantages:** Actual cancellation — the underlying request is aborted, freeing resources.

### Approach B: Promise.race() (generic orchestration)

For APIs that do not support `AbortSignal`, use `Promise.race()` with a timeout promise.

**✅ Correct (generic):**
```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
```

**Limitation:** `Promise.race()` does NOT cancel the losing promise. The underlying operation continues running; only the caller moves on.

**Impact:** HIGH — Prevents hanging operations

---

## 6. high-async-forEach

**Why it matters:** `Array.prototype.forEach` does not await the return value of its callback. Async callbacks execute concurrently with no error handling.

**❌ Incorrect:**
```typescript
async function processUsers(users: User[]) {
  users.forEach(async user => {
    await updateUser(user); // Won't wait!
  });
  console.log('Done'); // Runs immediately, before any update completes
}
```

**✅ Correct (parallel):**
```typescript
async function processUsersParallel(users: User[]) {
  await Promise.all(users.map(user => updateUser(user)));
  console.log('Done');
}
```

**✅ Correct (sequential):**
```typescript
async function processUsersSequential(users: User[]) {
  for (const user of users) {
    await updateUser(user);
  }
  console.log('Done');
}
```

**Impact:** HIGH — Fixes subtle async bugs

---

## 7. high-promise-chaining

**Why it matters:** Long `.then()` chains are harder to read and debug than async/await.

**❌ Incorrect:**
```typescript
function loadAndProcess(userId: string) {
  return db.users.find(userId)
    .then(user => db.posts.findByUser(user.id))
    .then(posts => transform(posts))
    .catch(err => handleError(err));
}
```

**✅ Correct:**
```typescript
async function loadAndProcess(userId: string) {
  try {
    const user = await db.users.find(userId);
    const posts = await db.posts.findByUser(user.id);
    return transform(posts);
  } catch (err) {
    handleError(err);
  }
}
```

**Impact:** MEDIUM-HIGH — Improves readability

---

## 8. medium-concurrent-limit

**Why it matters:** Unbounded concurrency can overwhelm databases, APIs, or file systems.

**❌ Incorrect:**
```typescript
async function processAllUsers(userIds: string[]) {
  const results = await Promise.all(userIds.map(id => expensiveOp(id)));
}
```

**✅ Correct (chunked processing):**
```typescript
async function processInChunks<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 10
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    results.push(...await Promise.all(chunk.map(fn)));
  }
  return results;
}
```

**Impact:** MEDIUM — Prevents resource exhaustion

---

## 9. medium-promise-allsettled

**Why it matters:** `Promise.all()` fails fast on the first rejection. `Promise.allSettled()` waits for all promises and reports each result individually.

**❌ Risky (one failure cancels all):**
```typescript
await Promise.all(users.map(user => sendEmail(user.email)));
```

**✅ Correct (fault-tolerant):**
```typescript
const results = await Promise.allSettled(users.map(user => sendEmail(user.email)));
const failures = results.filter(r => r.status === 'rejected');
if (failures.length) {
  logger.warn(`${failures.length} emails failed`);
}
```

**Impact:** MEDIUM — Improves fault tolerance

---

## 10. medium-async-iife

**Why it matters:** Top-level await (ES2022+, `"module": "es2022"` or later in tsconfig) is now preferred over async IIFE. If using IIFE, unhandled errors crash the process.

**❌ Incorrect (no error handling):**
```typescript
(async () => {
  const config = await loadConfig();
})();
```

**✅ Correct (top-level await, ES2022+):**
```typescript
const config = await loadConfig();
```

**✅ Correct (IIFE with error handling):**
```typescript
(async () => {
  try {
    const config = await loadConfig();
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
})();
```

**Impact:** LOW-MEDIUM — Prevents silent failures
