// Clean type safety — should produce 0 findings
export interface User {
  id: string;
  name: string;
  email: string;
}

export function greet(user: User): string {
  return `Hello, ${user.name}`;
}

export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}
