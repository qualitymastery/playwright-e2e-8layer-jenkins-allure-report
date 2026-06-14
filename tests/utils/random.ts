export function randomEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export function randomName(): string {
  const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank'];
  return names[Math.floor(Math.random() * names.length)];
}

export function randomPassword(): string {
  return `Pw${Date.now()}!`;
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}
