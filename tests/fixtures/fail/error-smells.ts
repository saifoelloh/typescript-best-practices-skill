// Error handling smells — should trigger findings

// EMPTY-CATCH: empty catch block
export async function updateUser(id: string): Promise<void> {
  try {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
  } catch (error) {}
}

// THROW-NON-ERROR: throwing string literal
export function validate(input: string): void {
  if (!input) {
    throw 'Input is required';
  }
}

// THROW-NON-ERROR: throwing number
export function checkAge(age: number): void {
  if (age < 0) {
    throw 400;
  }
}

// SWALLOWED-PROMISE: .catch(() => {})
export function sendEmail(email: string): void {
  fetch('/api/send', { method: 'POST', body: email }).catch(() => {});
}

// EMPTY-CATCH: multi-line empty catch
export async function riskyOperation(): Promise<void> {
  try {
    await fetch('/api/risky');
  } catch (e) {
  }
}
