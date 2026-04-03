// Clean error handling — should produce 0 findings
export async function updateUser(id: string, data: unknown): Promise<void> {
  try {
    await fetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  } catch (error) {
    console.error('Failed to update user', { userId: id, error });
    throw error;
  }
}

export function validate(input: string): void {
  if (!input) {
    throw new Error('Input is required');
  }
}

export async function sendEmailSafely(email: string): Promise<void> {
  try {
    await fetch('/api/send', { method: 'POST', body: JSON.stringify({ email }) });
  } catch (error) {
    console.error('Email send failed', error);
  }
}
