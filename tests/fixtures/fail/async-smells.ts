// Async smells — should trigger findings

// ASYNC-FOREACH: async callback in forEach
export async function processUsers(users: string[]): Promise<void> {
  users.forEach(async (user) => {
    await fetch(`/api/users/${user}`);
  });
}

// PROMISE-CONSTRUCTOR-ANTI: async executor
export function getUser(id: string): Promise<unknown> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      resolve(res.json());
    } catch (e) {
      reject(e);
    }
  });
}

// ASYNC-NO-AWAIT: async function with no await
export async function add(a: number, b: number): Promise<number> {
  return a + b;
}
