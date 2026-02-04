import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
  return `${Math.floor(diffInSeconds / 2592000)}mo`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getDeviceInfo() {
  return {
    platform: navigator.platform,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
  };
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15;
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  const visible = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 4);
  return masked + visible;
}

export function getCountryFromPhone(phone: string): string | null {
  const prefixes: Record<string, string> = {
    '225': 'CI', // Côte d'Ivoire
    '221': 'SN', // Sénégal
    '223': 'ML', // Mali
    '226': 'BF', // Burkina Faso
    '228': 'TG', // Togo
    '229': 'BJ', // Bénin
    '234': 'NG', // Nigeria
    '233': 'GH', // Ghana
    '254': 'KE', // Kenya
    '255': 'TZ', // Tanzania
    '256': 'UG', // Uganda
    '27': 'ZA',  // South Africa
  };

  for (const [prefix, country] of Object.entries(prefixes)) {
    if (phone.startsWith(prefix) || phone.startsWith('+' + prefix)) {
      return country;
    }
  }
  return null;
}
