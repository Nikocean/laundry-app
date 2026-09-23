import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  ShieldCheck,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { LiveMapSimulator } from '../common/LiveMapSimulator';
import { formatRupiah, getStatusBadgeInfo } from '../../utils/formatters';
import { OrderStatus } from '../../types/laundry';

interface CustomerTrackingViewProps {
  onOpenReceiptModal: (orderId: string) => void;
}

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({ onOpenReceiptModal }) => {
  const { orders, couriers, selectedOrderId, setSelectedOrderId, runDemoSimulation, isSimulating } = useLaundry();

  // Active orders are non-cancelled / non-delivered, or recently delivered
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const currentOrder = orders.find(o => o.id === selectedOrderId) || activeOrders[0] || orders[0];
  const assignedCourier = couriers.find(c => c.id === currentOrder?.courierId);

  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);
  const [chatMessageSent, setChatMessageSent] = useState<string | null>(null);

  const statusBadge = currentOrder ? getStatusBadgeInfo(currentOrder.status) : { label: '-', bg: '', text: '', border: '' };

  // Status progression stages definition
  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Pesanan Diterima', desc: 'Menunggu konfirmasi laundry' },
    { key: 'picked_up', label: 'Dijemput Kurir', desc: 'Dalam perjalanan ke workshop' },
    { key: 'washing', label: 'Cuci & Setrika', desc: 'Sedang dicuci & dipacking rapi' },
    { key: 'done', label: 'Siap Dikirim', desc: 'Packing kedap udara selesai' },
    { key: 'delivering', label: 'Sedang Diantar', desc: 'Kurir menuju alamat tujuan' },
    { key: 'delivered', label: 'Selesai / Diterima', desc: 'Pakaian telah diserahterimakan' }
  ];

  const getStageIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'pending': return 0;
      case 'picked_up': return 1;
      case 'washing': return 2;
      case 'done': return 3;
      case 'delivering': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  };

  const currentStageIndex = currentOrder ? getStageIndex(currentOrder.status) : 0;

  const handleSimulateChat = () => {
    setChatMessageSent('Pesan terkirim ke kurir: "Halo Mas Kurir, mohon dititipkan ke sekuriti jika saya sedang keluar ya."');
    setTimeout(() => setChatMessageSent(null), 4000);
  };

  if (!currentOrder) {
    return (
      <div className="p-6 text-center text-[#6E6B65] space-y-2">
        <Package className="w-12 h-12 mx-auto text-[#9C9890] mb-2" />
        <p className="text-sm">Belum ada pesanan aktif saat ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Active Order Selector Pills if multiple */}
      {activeOrders.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
          {activeOrders.map(o => {
            const isSel = o.id === currentOrder.id;
            return (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-sm'
                    : 'bg-white text-[#6E6B65] border-[#E2DFD7] hover:text-[#2B2B28]'
                }`}
              >
                {o.orderNumber} ({o.serviceName.slice(0, 14)}...)
              </button>
            );
          })}
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-3">
        {/* Header bar */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#2B2B28]">{currentOrder.orderNumber}</span>
              {currentOrder.isExpress && (
                <span className="bg-[#F2B705]/20 text-[#8C6600] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F2B705]/40">
                  ⚡ Express 24 Jam
                </span>
              )}
            </div>
            <div className="text-xs text-[#6E6B65] mt-0.5">{currentOrder.serviceName}</div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
            {statusBadge.label}
          </div>
        </div>

        {/* Live GPS Map (Rendered when in active transit) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#2B2B28] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1F7A6C]" />
              <span>Live Delivery Map</span>
            </span>
            {currentOrder.status === 'delivering' && (
              <button
                onClick={runDemoSimulation}
                disabled={isSimulating}
                className="text-[11px] font-bold text-[#1F7A6C] hover:text-[#134F45] bg-[#1F7A6C]/10 hover:bg-[#1F7A6C]/20 px-2.5 py-0.5 rounded-lg border border-[#1F7A6C]/30 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#F2B705]" />
                <span>{isSimulating ? 'Simulasi Berjalan...' : 'Simulasi Kurir Bergerak'}</span>
              </button>
            )}
          </div>

          <LiveMapSimulator
            order={currentOrder}
            courier={assignedCourier}
            className="w-full h-44"
          />
        </div>

        {/* Courier Info Card (If courier is assigned) */}
        {assignedCourier && (
          <div className="bg-[#EFEDE7] border border-[#E2DFD7] rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={assignedCourier.avatar}
                alt={assignedCourier.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#1F7A6C] shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2B2B28]">{assignedCourier.name}</span>
                  <span className="text-[10px] bg-[#F2B705]/25 text-[#8C6600] px-1.5 py-0.2 rounded font-mono font-bold">
                    ★ {assignedCourier.rating}
                  </span>
                </div>
                <div className="text-[11px] text-[#6E6B65] flex items-center gap-1">
                  <Bike className="w-3 h-3 text-[#6E6B65]" />
                  <span>{assignedCourier.vehicle} ({assignedCourier.plateNumber})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSimulateChat}
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#E2DFD7] text-[#1F7A6C] border border-[#E2DFD7] flex items-center justify-center transition-colors shadow-sm"
                title="Kirim Pesan"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <a
                href={`tel:${assignedCourier.phone}`}
                className="w-8 h-8 rounded-lg bg-[#1F7A6C] hover:bg-[#134F45] text-white flex items-center justify-center transition-colors shadow-sm"
                title="Telepon Kurir"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {chatMessageSent && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-[#1F7A6C]/15 border border-[#1F7A6C]/30 rounded-lg text-[11px] text-[#134F45] font-medium"
          >
            {chatMessageSent}
          </motion.div>
        )}

        {/* Progression Horizontal Stepper */}
        <div className="pt-2 border-t border-[#E2DFD7]">
          <div className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Status Pengerjaan</span>
            <span className="text-[11px] text-[#1F7A6C] font-mono font-bold">Tahap {currentStageIndex + 1} dari 6</span>
          </div>

          <div className="relative flex justify-between items-center mb-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-1 bg-[#E2DFD7] z-0" />
            {/* Active Filled Line */}
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 h-1 bg-[#1F7A6C] z-0 transition-all duration-500"
              style={{ width: `${(currentStageIndex / (stages.length - 1)) * 94}%` }}
            />

            {stages.map((stg, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stg.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#1F7A6C] text-white border-2 border-[#134F45] shadow-md scale-110 ring-4 ring-[#1F7A6C]/20'
                        : isPassed
                        ? 'bg-[#4C9A5B] text-white border-2 border-[#3d7d49]'
                        : 'bg-[#EFEDE7] text-[#6E6B65] border-2 border-[#E2DFD7]'
                    }`}
                  >
                    {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Milestone Highlight Banner */}
          <div className="bg-[#1F7A6C]/10 border border-[#1F7A6C]/25 rounded-xl p-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1F7A6C]/20 text-[#1F7A6C] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#1F7A6C]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#134F45]">
                {stages[currentStageIndex]?.label}
              </div>
              <div className="text-[11px] text-[#6E6B65] mt-0.5">
                {stages[currentStageIndex]?.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Dropdown */}
        <div className="border-t border-[#E2DFD7] pt-2">
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className="w-full flex items-center justify-between text-xs text-[#6E6B65] hover:text-[#2B2B28] py-1 transition-colors"
          >
            <span className="font-semibold">Riwayat Lengkap Timeline ({currentOrder.timeline.length} Aktivitas)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isTimelineExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isTimelineExpanded && (
            <div className="space-y-3 pt-3 pl-2 border-l-2 border-[#E2DFD7] ml-2 mt-2">
              {currentOrder.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-4 space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#1F7A6C] border-2 border-white" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2B2B28]">{event.title}</span>
                    <span className="text-[10px] text-[#6E6B65] font-mono">{event.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#6E6B65] leading-relaxed">{event.description}</p>
                  {event.actorName && (
                    <span className="text-[10px] text-[#134F45] bg-[#1F7A6C]/10 px-1.5 py-0.2 rounded inline-block font-medium">
                      Oleh: {event.actorName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details & Summary */}
        <div className="bg-[#EFEDE7] p-3 rounded-xl border border-[#E2DFD7] text-xs space-y-2">
          <div className="flex justify-between text-[#6E6B65]">
            <span>Aroma Parfum:</span>
            <span className="text-[#1F7A6C] font-semibold">{currentOrder.perfumeAroma}</span>
          </div>
          <div className="flex justify-between text-[#6E6B65]">
            <span>Metode Bayar:</span>
            <span className="text-[#2B2B28] uppercase font-semibold">{currentOrder.paymentMethod} ({currentOrder.paymentStatus})</span>
          </div>
          <div className="flex justify-between text-[#6E6B65]">
            <span>Alamat Tujuan:</span>
            <span className="text-[#2B2B28] max-w-[220px] text-right truncate font-medium">{currentOrder.customerAddress}</span>
          </div>
          {currentOrder.specialInstructions && (
            <div className="flex justify-between text-[#6E6B65] border-t border-[#E2DFD7] pt-1.5">
              <span>Catatan Khusus:</span>
              <span className="text-[#8C6600] italic">{currentOrder.specialInstructions}</span>
            </div>
          )}
          <div className="border-t border-[#E2DFD7] pt-2 flex justify-between items-center">
            <span className="font-bold text-[#2B2B28]">Total Tagihan:</span>
            <span className="text-[#134F45] font-bold text-sm">{formatRupiah(currentOrder.totalPrice)}</span>
          </div>
        </div>

        {/* Proof Photo (If delivered) */}
        {currentOrder.proofPhotoUrl && (
          <div className="bg-[#EFEDE7] p-3 rounded-xl border border-[#4C9A5B]/40 space-y-2">
            <div className="text-xs font-bold text-[#4C9A5B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Bukti Foto Serah Terima Kurir</span>
            </div>
            <img
              src={currentOrder.proofPhotoUrl}
              alt="Bukti Serah Terima"
              className="w-full h-36 object-cover rounded-lg border border-[#E2DFD7]"
            />
          </div>
        )}

        {/* View Receipt Button */}
        <button
          onClick={() => onOpenReceiptModal(currentOrder.id)}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-[#EFEDE7] text-[#2B2B28] font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-[#E2DFD7] shadow-sm"
        >
          <FileText className="w-4 h-4 text-[#1F7A6C]" />
          <span>Lihat & Cetak Nota Digital</span>
        </button>
      </div>
    </div>
  );
};
