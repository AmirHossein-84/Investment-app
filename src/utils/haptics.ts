/**
 * Tactile Haptic feedback for mobile touch interactions
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(8);
      else if (type === 'medium') navigator.vibrate(18);
      else if (type === 'heavy') navigator.vibrate(30);
      else if (type === 'success') navigator.vibrate([10, 40, 15]);
    } catch {
      // Ignore vibration errors if unsupported
    }
  }
};
