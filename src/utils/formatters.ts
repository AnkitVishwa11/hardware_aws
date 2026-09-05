/**
 * Utility formatters for sensor values, dates, rates of change, and risk badges
 */

export function formatMetric(
  value: number | null | undefined,
  decimals: number = 1,
  unit: string = '',
  fallback: string = 'Not available'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  const formatted = value.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatRawGas(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Not available';
  }
  // Explicitly formatted as raw ADC count
  return `${Math.round(value)} (Raw ADC)`;
}

export function formatDelta(
  delta: number | null | undefined,
  decimals: number = 1,
  unit: string = 'cm'
): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (delta === null || delta === undefined || isNaN(delta)) {
    return { text: 'Not available', isPositive: false, isNeutral: true };
  }
  const sign = delta > 0 ? '+' : '';
  const isNeutral = Math.abs(delta) < 0.05;
  return {
    text: `${sign}${delta.toFixed(decimals)} ${unit}`,
    isPositive: delta > 0,
    isNeutral
  };
}

export function formatTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return 'Not available';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string | null | undefined): string {
  if (!isoString) return '--:--:--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--:--';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return '--:--:--';
  }
}

export function getRiskColorClass(level: string): {
  badge: string;
  border: string;
  bg: string;
  text: string;
  dot: string;
} {
  switch (level?.toUpperCase()) {
    case 'CRITICAL':
      return {
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        border: 'border-red-500',
        bg: 'bg-red-950/30',
        text: 'text-red-400',
        dot: 'bg-red-500'
      };
    case 'WARNING':
      return {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        border: 'border-amber-500',
        bg: 'bg-amber-950/30',
        text: 'text-amber-400',
        dot: 'bg-amber-500'
      };
    case 'NORMAL':
    default:
      return {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        border: 'border-emerald-500',
        bg: 'bg-emerald-950/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500'
      };
  }
}
