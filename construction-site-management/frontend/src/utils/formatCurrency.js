/**
 * Currency Formatting Utility for Indian Rupees
 * Formats numbers to Indian currency format with proper localization
 */

export function formatCurrencyINR(amount) {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format currency for table display with rupee symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string with rupee symbol
 */
export function formatCurrencyDisplay(amount) {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.abs(amount));
  
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Format currency with custom decimals
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatCurrencyWithDecimals(amount, decimals = 2) {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(amount);
}
