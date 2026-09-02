import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { Order } from '../../types/laundry';
import { LiveMapSimulator } from '../common/LiveMapSimulator';
import { formatRupiah } from '../../utils/formatters';

interface CourierActiveRunModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourierActiveRunModal: React.FC<CourierActiveRunModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { couriers, activeCourierId, confirmPickup, confirmDelivery, runDemoSimulation, isSimulating } = useLaundry();

  const currentCourier = couriers.find(c => c.id === activeCourierId) || couriers[0];
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&auto=format&fit=crop&q=80'
  );
  const [photoSelected, setPhotoSelected] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isPickupTask = order.status === 'pending';
  const isDeliveryTask = order.status === 'delivering' || order.status === 'done';

  const handleExecuteAction = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (isPickupTask) {
        confirmPickup(order.id, currentCourier.id);
      } else {
        confirmDelivery(order.id, currentCourier.id, proofPhotoUrl);
      }
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-lg bg-[#FAF9F6] border border-[#E2DFD7] rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden text-[#2B2B28]"
        >
          {/* Top Bar */}
          <div className="px-5 py-3.5 border-b border-[#E2DFD7] flex items-center justify-between bg-white/90 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1F7A6C]/15 text-[#134F45] flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2B2B28]">
                  {isPickupTask ? 'Tugas Penjemputan Cucian' : 'Tugas Pengantaran Laundry'}
                </h3>
                <span className="text-[10px] font-mono text-[#1F7A6C] font-bold">{order.orderNumber}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Live Navigation GPS Map */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2B2B28] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1F7A6C]" />
                  <span>Rute Navigasi Kurir</span>
                </span>
                <button
                  onClick={runDemoSimulation}
                  disabled={isSimulating}
                  className="text-[11px] font-bold text-[#134F45] hover:text-[#1F7A6C] bg-[#1F7A6C]/10 px-2 py-0.5 rounded border border-[#1F7A6C]/20 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#F2B705]" />
                  <span>{isSimulating ? 'Bergerak...' : 'Simulasi Gerak GPS'}</span>
                </button>
              </div>
              <LiveMapSimulator
                order={order}
                courier={currentCourier}
                className="w-full h-40"
              />
            </div>

            {/* Customer Contact Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] space-y-2 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2B2B28]">{order.customerName}</div>
                  <div className="text-[11px] text-[#6E6B65] mt-0.5">{order.customerPhone}</div>
                </div>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi Pelanggan</span>
                </a>
              </div>

              <div className="text-xs text-[#6E6B65] border-t border-[#E2DFD7] pt-2 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1F7A6C] shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>

            {/* Item Order Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] text-xs space-y-1.5 shadow-sm">
              <div className="font-bold text-[#6E6B65] uppercase tracking-wider text-[10px]">
                Detail Muatan Laundry
              </div>
              <div className="text-[#2B2B28] font-semibold">{order.serviceName}</div>
              <div className="text-[#6E6B65]">Aroma Parfum: <span className="text-[#1F7A6C] font-semibold">{order.perfumeAroma}</span></div>
              {order.specialInstructions && (
                <div className="text-[#8C6600] bg-[#F2B705]/15 p-2 rounded-lg border border-[#F2B705]/30 text-[11px]">
                  Catatan: {order.specialInstructions}
                </div>
              )}
              <div className="border-t border-[#E2DFD7] pt-1.5 flex justify-between font-bold">
                <span className="text-[#6E6B65]">Metode Bayar:</span>
                <span className="text-[#134F45] uppercase">{order.paymentMethod} ({formatRupiah(order.totalPrice)})</span>
              </div>
            </div>

            {/* Proof of Delivery Photo Upload (Mandatory for Delivering stage) */}
            {!isPickupTask && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B2B28] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#1F7A6C]" />
                    <span>Foto Bukti Serah Terima (PoD)</span>
                  </span>
                  <span className="text-[10px] text-[#8C6600] font-bold bg-[#F2B705]/20 px-2 py-0.5 rounded">
                    Wajib
                  </span>
                </div>

                {photoSelected && proofPhotoUrl ? (
                  <div className="relative group">
                    <img
                      src={proofPhotoUrl}
                      alt="Bukti Foto"
                      className="w-full h-36 object-cover rounded-xl border border-[#E2DFD7]"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 text-[#4C9A5B] text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-[#4C9A5B]/30 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> Foto Terlampir
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#E2DFD7] rounded-xl p-4 text-center space-y-1 cursor-pointer hover:border-[#1F7A6C]">
                    <Upload className="w-6 h-6 mx-auto text-[#9C9890]" />
                    <div className="text-xs font-semibold text-[#6E6B65]">Ambil Foto atau Upload File</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="p-4 border-t border-[#E2DFD7] bg-white">
            <button
              onClick={handleExecuteAction}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                isPickupTask
                  ? 'bg-[#4A90A4] hover:bg-[#3d7a8c] text-white'
                  : 'bg-[#4C9A5B] hover:bg-[#3d7d49] text-white'
              }`}
            >
              {isSubmitting ? (
                <span>Memproses Data ke Server...</span>
              ) : isPickupTask ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Penjemputan Pakaian (Bawa ke Toko)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Selesaikan & Konfirmasi Pengantaran (Delivered)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
