import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Share2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { formatRupiah, formatShortDate, getStatusBadgeInfo } from '../../utils/formatters';

interface ReceiptModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ orderId, onClose }) => {
  const { orders } = useLaundry();
  const order = orders.find(o => o.id === orderId);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*KLINIK CUCI LAUNDRY RECEIPT*\nNo. Order: ${order.orderNumber}\nPelanggan: ${order.customerName}\nLayanan: ${order.serviceName}\nStatus: ${getStatusBadgeInfo(order.status).label}\nTotal: ${formatRupiah(order.totalPrice)}\n\nLacak status laundry real-time di app kami!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2B28]/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm bg-[#FAF9F6] border border-[#E2DFD7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Bar */}
          <div className="p-4 border-b border-[#E2DFD7] flex items-center justify-between bg-[#EFEDE7]">
            <span className="text-xs font-bold text-[#2B2B28]">Nota Digital Laundry</span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#FAF9F6] hover:bg-[#E2DFD7] text-[#6E6B65] flex items-center justify-center transition-colors border border-[#E2DFD7]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Thermal Receipt Paper Card */}
          <div className="p-5 overflow-y-auto space-y-4">
            <div className="bg-white text-[#2B2B28] p-5 rounded-2xl shadow-sm font-mono text-xs space-y-3 border border-[#E2DFD7]">
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-[#C8C5BC] pb-3">
                <div className="font-extrabold text-sm tracking-wider uppercase text-[#134F45]">KLINIK CUCI LAUNDRY</div>
                <div className="text-[10px] text-[#6E6B65]">Jl. Kemang Raya No. 18, Jakarta Selatan</div>
                <div className="text-[10px] text-[#6E6B65]">Telp / WA: 0812-9876-5432</div>
              </div>

              {/* Order Meta */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-[#C8C5BC] pb-2">
                <div className="flex justify-between">
                  <span className="text-[#6E6B65]">No. Nota:</span>
                  <span className="font-bold text-[#1F7A6C]">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6B65]">Waktu:</span>
                  <span>{formatShortDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6B65]">Pelanggan:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6B65]">Sumber:</span>
                  <span className="uppercase text-[10px] font-semibold">{order.source === 'offline_pos' ? 'Kasir Outlet (Walk-In)' : 'Customer App'}</span>
                </div>
              </div>

              {/* Itemized list */}
              <div className="space-y-1.5 border-b border-dashed border-[#C8C5BC] pb-3">
                <div className="font-bold text-[10px] text-[#6E6B65] uppercase">Item Transaksi:</div>
                {order.items.map(it => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <div>
                      <div className="font-medium text-[#2B2B28]">{it.name}</div>
                      <div className="text-[9px] text-[#6E6B65]">{it.notes || `${it.quantity} unit`}</div>
                    </div>
                    <span className="font-bold text-[#2B2B28]">{formatRupiah(it.unitPrice)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[11px] text-[#1F7A6C]">
                  <span>Parfum:</span>
                  <span>{order.perfumeAroma.split('(')[0]}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6E6B65]">Ongkir Kurir:</span>
                    <span className="font-medium">{formatRupiah(order.deliveryFee)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-[11px] text-[#4C9A5B]">
                    <span>Diskon Promo:</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className="space-y-1 border-b border-dashed border-[#C8C5BC] pb-2">
                <div className="flex justify-between font-bold text-sm text-[#134F45]">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#6E6B65]">
                  <span>Pembayaran:</span>
                  <span className="uppercase font-semibold">{order.paymentMethod} ({order.paymentStatus})</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="pt-2 text-center space-y-1">
                <div className="flex justify-center items-center h-10 gap-0.5 bg-[#2B2B28] p-1.5 rounded-lg">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full bg-white ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`}
                    />
                  ))}
                </div>
                <div className="text-[9px] text-[#6E6B65] tracking-widest">{order.orderNumber}</div>
                <div className="text-[9px] text-[#6E6B65] pt-1">
                  Terima kasih atas kepercayaan Anda. Pakaian rapi, wangi tahan lama!
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-[#E2DFD7] bg-[#EFEDE7] flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-[#4C9A5B] hover:bg-[#3d7d49] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
