// Persian / English digits converter and formatters

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toPersianDigits = (n: number | string): string => {
  return String(n).replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
};

export const formatToman = (amount: number, usePersianDigits = true): string => {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-US').format(rounded);
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
};

export const formatTomanWithUnit = (amount: number): string => {
  return `${formatToman(amount)} تومان`;
};

export const formatPercent = (percent: number, decimals = 0): string => {
  const formatted = percent.toFixed(decimals);
  return `${toPersianDigits(formatted)}٪`;
};

export const formatWeight = (grams: number): string => {
  const formatted = grams >= 1 ? grams.toFixed(2) : grams.toFixed(3);
  return `${toPersianDigits(formatted)} گرم`;
};

export const parseNumberInput = (value: string): number => {
  // Remove commas, spaces and convert persian digits to standard
  let cleaned = value.replace(/[\s,،]/g, '');
  cleaned = cleaned.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const getPersianFormattedDate = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};
