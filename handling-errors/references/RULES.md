# Error Handling - Detailed Rule Catalog

This document provides in-depth guidance, examples, and detection criteria for the error handling rules defined in `SKILL.md`.

## 1. critical-error-swallowing

**Why it matters:** Silent failures hide bugs and make debugging impossible.

**Detection:**
- Look for empty `catch` blocks.
- Check for `catch(e) {}` without logging/rethrowing.
- Search for `.catch(() => {})` on promises.

**❌ Incorrect:**
```typescript
async function updateUser(id: string, data: UserData) {
  try {
    await db.users.update(id, data);
  } catch (error) {
    // Silent failure! Bug hidden from logs
  }
}
```

**✅ Correct:**
```typescript
async function updateUser(id: string, data: UserData) {
  try {
    await db.users.update(id, data);
  } catch (error) {
    logger.error('Failed to update user', { userId: id, error });
    throw error;
  }
}
```

---

## 2. critical-unhandled-rejection

**Why it matters:** Unhandled promise rejections can crash Node.js processes in production.

**Detection:**
- Look for promises without `.catch()`.
- Check for async functions called without `await` or `.catch()`.

**✅ Correct:**
```typescript
async function sendEmailInBackground(email: string) {
  sendEmail(email).catch(error => {
    logger.error('Background email failed', { email, error });
  });
}
```

---

## 3. critical-throw-non-error

**Why it matters:** Throwing non-Error objects loses stack traces and breaks error handling.

**❌ Incorrect:**
```typescript
throw 'Email is required'; // String! No stack trace
```

**✅ Correct:**
```typescript
throw new Error('Email is required');
```

---

## 4. high-error-context

**Why it matters:** Error messages without context make debugging production issues nearly impossible.

**✅ Correct:**
```typescript
throw new PaymentError('Payment processing failed', { userId, amount, cause: error });
```

---

## 5. high-custom-error-types

**Why it matters:** Typed errors enable proper error handling and recovery strategies.

**✅ Correct:**
```typescript
if (error instanceof ValidationError) { ... }
```

---

## 6. high-async-try-catch

**Why it matters:** Missing try-catch in async functions leads to unhandled rejections.

---

## 7. medium-error-boundaries

**Why it matters:** Centralized error handling improves code organization and consistency.
