import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatRupiah(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return String(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatOrderDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd MMMM yyyy HH:mm", { locale: localeId });
}

export function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}
