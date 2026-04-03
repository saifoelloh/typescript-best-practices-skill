// Strategy pattern smell — large switch and long if/else chain

// STRATEGY-SMELL: switch with 6 cases
export function getPrice(category: string, base: number): number {
  switch (category) {
    case 'ELECTRONICS': return base * 1.2;
    case 'CLOTHING': return base * 1.1;
    case 'FOOD': return base * 1.0;
    case 'BOOKS': return base * 0.9;
    case 'TOYS': return base * 1.15;
    case 'SPORTS': return base * 1.25;
    default: return base;
  }
}

// STRATEGY-SMELL: long if/else chain (4+ branches)
export function getLabel(status: string): string {
  if (status === 'PENDING') {
    return 'Pending Review';
  } else if (status === 'APPROVED') {
    return 'Approved';
  } else if (status === 'REJECTED') {
    return 'Rejected';
  } else if (status === 'CANCELLED') {
    return 'Cancelled';
  } else if (status === 'EXPIRED') {
    return 'Expired';
  }
  return 'Unknown';
}
