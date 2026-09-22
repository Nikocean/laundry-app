import React, { useState } from 'react';
import {
  Bike,
  Power,
  Navigation,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { Order } from '../../types/laundry';
import { formatRupiah, formatShortDate } from '../../utils/formatters';
import { CourierActiveRunModal } from './CourierActiveRunModal';

export const CourierFlutterApp: React.FC = () => {
  const { couriers, activeCourierId, setActiveCourierId, toggleCourierAvailability, orders } = useLaundry();

  const currentCourier = couriers.find(c => c.id === activeCourierId) || couriers[0];
  const [activeTaskTab, setActiveTaskTab] = useState<'delivery' | 'pickup' | 'completed'>('delivery');
  const [selectedTaskOrder, setSelectedTaskOrder] = useState<Order | null>(null);

  // Filter orders relevant to courier
  // Pickups are 'pending'
  const pickupTasks = orders.filter(o => o.status === 'pending');
  // Deliveries are assigned to this courier or 'done' / 'delivering'
  const deliveryTasks = orders.filter(
    o => (o.status === 'delivering' && o.courierId === currentCourier.id) || (o.status === 'done' && !o.courierId)
  );
  const completedTasks = orders.filter(o => o.status === 'delivered' && o.courierId === currentCourier.id);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#2B2B28] relative overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Flutter Mobile Top App Bar for Courier */}
      <div className="px-4 py-3 bg-white/90 border-b border-[#E2DFD7] flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1F7A6C] flex items-center justify-center text-white shadow-sm">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#2B2B28] flex items-center gap-1">
              <span>Kurir Delivery</span>
              <span className="text-[9px] bg-[#1F7A6C]/15 text-[#134F45] px-1.5 py-0.2 rounded font-mono font-bold">
                Flutter
              </span>
            </h1>
            <p className="text-[10px] text-[#6E6B65]">Operasional Driver</p>
          </div>
        </div>

        {/* Courier selector switcher */}
        <select
          value={currentCourier.id}
          onChange={e => setActiveCourierId(e.target.value)}
          className="bg-[#EFEDE7] border border-[#E2DFD7] text-[#2B2B28] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#1F7A6C]"
        >
          {couriers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.plateNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#E2DFD7]">
        {/* Courier Duty Profile Card */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentCourier.avatar}
                alt={currentCourier.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#1F7A6C]"
              />
              <div>
                <div className="font-bold text-sm text-[#2B2B28] flex items-center gap-1.5">
                  <span>{currentCourier.name}</span>
                  <span className="text-[10px] bg-[#F2B705]/25 text-[#8C6600] px-1.5 py-0.2 rounded flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-[#F2B705]" /> {currentCourier.rating}
                  </span>
                </div>
                <div className="text-xs text-[#6E6B65]">{currentCourier.vehicle}</div>
                <div className="text-[10px] text-[#1F7A6C] font-mono mt-0.5 font-bold">{currentCourier.plateNumber}</div>
              </div>
            </div>

            {/* Online / Offline Switch */}
            <button
              onClick={() => toggleCourierAvailability(currentCourier.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                currentCourier.isAvailable
                  ? 'bg-[#4C9A5B] hover:bg-[#3d7d49] text-white'
                  : 'bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] border border-[#E2DFD7]'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentCourier.isAvailable ? 'Online' : 'Offline'}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#E2DFD7] pt-3 text-center">
            <div className="bg-[#EFEDE7] p-2 rounded-xl border border-[#E2DFD7]">
              <div className="text-xs text-[#6E6B65]">Tugas Selesai</div>
              <div className="text-sm font-bold text-[#4C9A5B]">{currentCourier.completedToday} Order</div>
            </div>
            <div className="bg-[#EFEDE7] p-2 rounded-xl border border-[#E2DFD7]">
              <div className="text-xs text-[#6E6B65]">Bonus Hari Ini</div>
              <div className="text-sm font-bold text-[#134F45]">{formatRupiah(currentCourier.completedToday * 10000)}</div>
            </div>
            <div className="bg-[#EFEDE7] p-2 rounded-xl border border-[#E2DFD7]">
              <div className="text-xs text-[#6E6B65]">Rating Trip</div>
              <div className="text-sm font-bold text-[#8C6600]">4.9 / 5.0</div>
            </div>
          </div>
        </div>

        {/* Task Tabs Switcher */}
        <div className="grid grid-cols-3 bg-[#EFEDE7] border border-[#E2DFD7] rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTaskTab('delivery')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTaskTab === 'delivery'
                ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <span>Pengantaran</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">
              {deliveryTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTaskTab('pickup')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTaskTab === 'pickup'
                ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <span>Penjemputan</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">
              {pickupTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTaskTab('completed')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTaskTab === 'completed'
                ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <span>Selesai</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* Task List Content */}
        <div className="space-y-3 pb-16">
          {activeTaskTab === 'delivery' && (
            <>
              {deliveryTasks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2DFD7] space-y-2">
                  <Package className="w-10 h-10 mx-auto text-[#9C9890]" />
                  <p className="text-xs text-[#6E6B65]">Tidak ada tugas pengantaran aktif saat ini.</p>
                </div>
              ) : (
                deliveryTasks.map(ord => (
                  <div
                    key={ord.id}
                    className="bg-white border border-[#E2DFD7] hover:border-[#1F7A6C] rounded-2xl p-4 shadow-sm space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#1F7A6C]">{ord.orderNumber}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8873A]/15 text-[#E8873A] border border-[#E8873A]/30">
                        {ord.status === 'delivering' ? 'Sedang Diantar' : 'Siap Diantar'}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#2B2B28]">{ord.customerName}</div>
                      <div className="text-[11px] text-[#6E6B65] flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1F7A6C] shrink-0 mt-0.5" />
                        <span>{ord.customerAddress}</span>
                      </div>
                    </div>

                    <div className="bg-[#EFEDE7] p-2.5 rounded-xl border border-[#E2DFD7] text-xs flex justify-between">
                      <span className="text-[#6E6B65]">{ord.serviceName}</span>
                      <span className="font-bold text-[#134F45]">{formatRupiah(ord.totalPrice)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="px-3 py-2 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] text-xs font-semibold flex items-center gap-1.5 border border-[#E2DFD7]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1F7A6C]" />
                        <span>Hubungi</span>
                      </a>
                      <button
                        onClick={() => setSelectedTaskOrder(ord)}
                        className="flex-1 py-2 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Buka Navigasi & PoD</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTaskTab === 'pickup' && (
            <>
              {pickupTasks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2DFD7] space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-[#4C9A5B]/50" />
                  <p className="text-xs text-[#6E6B65]">Semua pesanan penjemputan telah diproses.</p>
                </div>
              ) : (
                pickupTasks.map(ord => (
                  <div
                    key={ord.id}
                    className="bg-white border border-[#E2DFD7] hover:border-[#1F7A6C] rounded-2xl p-4 shadow-sm space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#1F7A6C]">{ord.orderNumber}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B705]/20 text-[#8C6600] border border-[#F2B705]/40">
                        Menunggu Penjemputan
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#2B2B28]">{ord.customerName}</div>
                      <div className="text-[11px] text-[#6E6B65] flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1F7A6C] shrink-0 mt-0.5" />
                        <span>{ord.customerAddress}</span>
                      </div>
                    </div>

                    <div className="bg-[#EFEDE7] p-2.5 rounded-xl border border-[#E2DFD7] text-xs flex justify-between">
                      <span className="text-[#6E6B65]">{ord.serviceName}</span>
                      <span className="text-[#1F7A6C] font-semibold">{ord.perfumeAroma}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="px-3 py-2 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] text-xs font-semibold flex items-center gap-1.5 border border-[#E2DFD7]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1F7A6C]" />
                        <span>Hubungi</span>
                      </a>
                      <button
                        onClick={() => setSelectedTaskOrder(ord)}
                        className="flex-1 py-2 rounded-xl bg-[#4A90A4] hover:bg-[#3d7a8c] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Jemput Cucian Pelanggan</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTaskTab === 'completed' && (
            <>
              {completedTasks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2DFD7] space-y-2">
                  <Clock className="w-10 h-10 mx-auto text-[#9C9890]" />
                  <p className="text-xs text-[#6E6B65]">Belum ada riwayat pengantaran selesai hari ini.</p>
                </div>
              ) : (
                completedTasks.map(ord => (
                  <div
                    key={ord.id}
                    className="bg-white border border-[#E2DFD7] rounded-2xl p-3.5 space-y-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#2B2B28]">{ord.orderNumber}</span>
                      <span className="text-[#4C9A5B] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Selesai Diantar
                      </span>
                    </div>
                    <div className="text-[#2B2B28] font-semibold">{ord.customerName}</div>
                    <div className="text-[11px] text-[#6E6B65]">{ord.customerAddress}</div>
                    <div className="border-t border-[#E2DFD7] pt-1.5 flex justify-between text-[#6E6B65]">
                      <span>Komisi Pengantaran:</span>
                      <span className="text-[#4C9A5B] font-bold">+Rp 10.000</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Courier Task Detail / PoD Action Modal */}
      <CourierActiveRunModal
        order={selectedTaskOrder}
        isOpen={!!selectedTaskOrder}
        onClose={() => setSelectedTaskOrder(null)}
      />
    </div>
  );
};
