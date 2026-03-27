# Async & Promise Rules

Detailed guidance for the 10 core rules in the Async Patterns skill.

---

## 1. critical-promise-not-awaited

**Why it matters:** Forgotten `await` causes promises to execute but results are lost, leading to race conditions.

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

**Impact:** CRITICAL - Prevents race conditions and data loss

---

## 2. critical-async-without-await

**Why it matters:** `async` keyword without `await` is misleading and adds unnecessary overhead.

**❌ Incorrect:**
```typescript
async function calculateTotal(items: Item[]): Promise<number> {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**✅ Correct:**
```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Impact:** HIGH - Removes misleading code and overhead

---

## 3. critical-promise-constructor-anti

**Why it matters:** `new Promise()` is rarely needed and often indicates promise anti-patterns.

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

**Impact:** HIGH - Simplifies code and avoids subtle bugs

---

## 4. high-parallel-sequential-confusion

**Why it matters:** Sequential execution when parallel is possible wastes time.

**❌ Incorrect:**
```typescript
async function loadUserData(userId: string) {
  const user = await db.users.find(userId);
  const posts = await db.posts.findByUser(userId);
  const comments = await db.comments.findByUser(userId);
  return { user, posts, comments };
}
```

**✅ Correct:**
```typescript
async function loadUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    db.users.find(userId),
    db.posts.findByUser(userId),
    db.comments.findByUser(userId)
  ]);
  return { user, posts, comments };
}
```

**Impact:** HIGH - Significant performance improvement

---

## 5. high-promise-race-timeout

**Why it matters:** Operations without timeouts can hang indefinitely.

**❌ Incorrect:**
```typescript
async function fetchData(url: string) {
  const response = await fetch(url);
  return response.json();
}
```

**✅ Correct:**
```typescript
async function fetchWithTimeout(url: string, timeoutMs: number = 5000) {
  const response = await Promise.race([
    fetch(url),
    timeout(timeoutMs)
  ]);
  return response.json();
}
```

**Impact:** HIGH - Prevents hanging operations

---

## 6. high-async-forEach

**Why it matters:** `forEach` doesn't wait for async callbacks, causing unexpected behavior.

**❌ Incorrect:**
```typescript
async function processUsers(users: User[]) {
  users.forEach(async user => {
    await updateUser(user); // Won't wait!
  });
  console.log('Done');
}
```

**✅ Correct:**
```typescript
async function processUsersParallel(users: User[]) {
  await Promise.all(users.map(user => updateUser(user)));
  console.log('Done');
}
```

**Impact:** HIGH - Fixes subtle async bugs

---

## 7. high-promise-chaining

**Why it matters:** Long `.then()` chains are harder to read than async/await.

**❌ Incorrect:**
```typescript
function loadAndProcess(userId: string) {
  return db.users.find(userId).then(user => db.posts.findByUser(user.id))...
}
```

**✅ Correct:**
```typescript
async function loadAndProcess(userId: string) {
  const user = await db.users.find(userId);
  const posts = await db.posts.findByUser(user.id);
  // ...
}
```

**Impact:** MEDIUM-HIGH - Improves readability

---

## 8. medium-concurrent-limit

**Why it matters:** Unbounded concurrency can overwhelm resources.

**❌ Incorrect:**
```typescript
async function processAllUsers(userIds: string[]) {
  const results = await Promise.all(userIds.map(id => expensiveOp(id)));
}
```

**✅ Correct:**
```typescript
async function processAllUsers(userIds: string[]) {
  const results = await processWithLimit(userIds, id => expensiveOp(id), 10);
}
```

**Impact:** MEDIUM - Prevents resource exhaustion

---

## 9. medium-promise-allsettled

**Why it matters:** `Promise.all()` fails fast. `allSettled` is fault-tolerant.

**❌ Incorrect:**
```typescript
await Promise.all(users.map(user => sendEmail(user.email)));
```

**✅ Correct:**
```typescript
const results = await Promise.allSettled(users.map(user => sendEmail(user.email)));
```

**Impact:** MEDIUM - Improves fault tolerance

---

## 10. medium-async-iife

**Why it matters:** Top-level await or IIFE needs proper error handling.

**❌ Incorrect:**
```typescript
(async () => {
  const config = await loadConfig();
})();
```

**✅ Correct:**
```typescript
(async () => {
  try {
    const config = await loadConfig();
  } catch (err) {
    process.exit(1);
  }
})();
```

**Impact:** LOW-MEDIUM - Prevents silent failures
