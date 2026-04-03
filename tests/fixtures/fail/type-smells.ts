// Type safety smells — should trigger findings

// @ts-ignore
const x = 1;

// AS-ANY
export function process(data: unknown): string {
  return (data as any).name;
}

// ANY-TYPE
export function handleEvent(event: any): void {
  console.log(event);
}

// @ts-nocheck would also trigger but we only use one per file for clarity
