// Clean async code — should produce 0 findings
export async function fetchUser(id: string): Promise<{ id: string; name: string }> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}

export async function processUsers(users: string[]): Promise<void> {
  await Promise.all(users.map(id => fetchUser(id)));
  console.log('Done');
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });
  return response;
}

export function calculateTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
