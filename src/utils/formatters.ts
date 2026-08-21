// Standard English digits converter and formatters

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toEnglishDigits = (n: number | string): string => {
  return String(n).replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
};

// Returns English digits across the entire application
export const toPersianDigits = (n: number | string): string => {
  return toEnglishDigits(n);
};

export const formatToman = (amount: number, _usePersianDigits = false): string => {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-US').format(rounded);
};

export const formatTomanWithUnit = (amount: number): string => {
  return `${formatToman(amount)} تومان`;
};

export const formatPercent = (percent: number, decimals = 0): string => {
  const formatted = percent.toFixed(decimals);
  return `${formatted}%`;
};

export const formatWeight = (grams: number): string => {
  const formatted = grams >= 1 ? grams.toFixed(2) : grams.toFixed(3);
  return `${formatted} گرم`;
};

export const parseNumberInput = (value: string): number => {
  // Remove commas, spaces and convert persian digits to standard english
  let cleaned = value.replace(/[\s,،]/g, '');
  cleaned = cleaned.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const getPersianFormattedDate = (date: Date = new Date()): string => {
  try {
    const formatted = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
    return toEnglishDigits(formatted);
  } catch {
    return date.toLocaleDateString();
  }
};
