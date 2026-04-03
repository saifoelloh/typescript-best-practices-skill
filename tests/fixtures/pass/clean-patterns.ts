// Clean design patterns — small functions, no god objects
export class OrderProcessor {
  async process(orderId: string): Promise<void> {
    const order = await this.validate(orderId);
    await this.calculate(order);
    await this.confirm(order);
  }

  private async validate(id: string): Promise<{ id: string }> {
    return { id };
  }

  private async calculate(order: { id: string }): Promise<void> {
    console.log('calculating', order.id);
  }

  private async confirm(order: { id: string }): Promise<void> {
    console.log('confirming', order.id);
  }
}

export function getDiscount(type: string): number {
  switch (type) {
    case 'VIP': return 0.2;
    case 'MEMBER': return 0.1;
    default: return 0;
  }
}
