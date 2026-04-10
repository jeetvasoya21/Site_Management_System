export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
