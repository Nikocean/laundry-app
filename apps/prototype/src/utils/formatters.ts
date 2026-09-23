import { OrderStatus } from '../types/laundry';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatShortDate = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
};

export const STATUS_COLORS: Record<OrderStatus, { hex: string; label: string; bgLight: string; border: string; textDark: string }> = {
  pending: {
    hex: '#9C9890',
    label: 'Menunggu Konfirmasi',
    bgLight: 'bg-[#9C9890]/15',
    border: 'border-[#9C9890]/40',
    textDark: 'text-[#615E58]',
  },
  picked_up: {
    hex: '#4A90A4',
    label: 'Dijemput / Di Workshop',
    bgLight: 'bg-[#4A90A4]/15',
    border: 'border-[#4A90A4]/40',
    textDark: 'text-[#2D6574]',
  },
  washing: {
    hex: '#1F7A6C',
    label: 'Sedang Dicuci / Setrika',
    bgLight: 'bg-[#1F7A6C]/15',
    border: 'border-[#1F7A6C]/40',
    textDark: 'text-[#134F45]',
  },
  done: {
    hex: '#F2B705',
    label: 'Selesai / Siap Antar',
    bgLight: 'bg-[#F2B705]/20',
    border: 'border-[#F2B705]/50',
    textDark: 'text-[#8A6700]',
  },
  delivering: {
    hex: '#E8873A',
    label: 'Sedang Diantar Kurir',
    bgLight: 'bg-[#E8873A]/15',
    border: 'border-[#E8873A]/40',
    textDark: 'text-[#A05315]',
  },
  delivered: {
    hex: '#4C9A5B',
    label: 'Telah Diterima (Selesai)',
    bgLight: 'bg-[#4C9A5B]/15',
    border: 'border-[#4C9A5B]/40',
    textDark: 'text-[#2E6B3B]',
  },
  cancelled: {
    hex: '#C1554A',
    label: 'Dibatalkan',
    bgLight: 'bg-[#C1554A]/15',
    border: 'border-[#C1554A]/40',
    textDark: 'text-[#8D3228]',
  },
};

export const getStatusBadgeInfo = (status: OrderStatus): { label: string; bg: string; text: string; border: string; hex: string } => {
  const item = STATUS_COLORS[status];
  if (item) {
    return {
      label: item.label,
      bg: item.bgLight,
      text: item.textDark,
      border: item.border,
      hex: item.hex,
    };
  }
  return {
    label: status,
    bg: 'bg-[#EFEDE7]',
    text: 'text-[#2B2B28]',
    border: 'border-[#E2DFD7]',
    hex: '#9C9890',
  };
};

export const generateOrderNumber = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const date = new Date();
  const year = date.getFullYear();
  return `LND-${year}-${randomNum}`;
};
