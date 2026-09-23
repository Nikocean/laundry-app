import React from 'react';
import {
  DollarSign,
  Package,
  Layers,
  Bike,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { formatRupiah, formatShortDate, getStatusBadgeInfo } from '../../utils/formatters';

interface AdminDashboardOverviewProps {
  onNavigateToOrders: () => void;
  onNavigateToFleet: () => void;
  onOpenPos: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateToOrders,
  onNavigateToFleet,
  onOpenPos,
}) => {
  const { orders, couriers } = useLaundry();

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalPrice : 0), 0);
  const activeWashingCount = orders.filter(o => o.status === 'washing' || o.status === 'picked_up').length;
  const inDeliveryCount = orders.filter(o => o.status === 'delivering').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;
  const onlineCouriersCount = couriers.filter(c => c.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Omset Pendapatan */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider">Total Omset Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-[#4C9A5B]/15 text-[#4C9A5B] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#2B2B28]">{formatRupiah(totalRevenue)}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#4C9A5B] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% dari minggu lalu</span>
          </div>
        </div>

        {/* Metric 2: Dalam Proses Cuci */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider">Dalam Proses Cuci & QC</span>
            <div className="w-8 h-8 rounded-xl bg-[#1F7A6C]/15 text-[#134F45] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#134F45]">{activeWashingCount} Order Aktif</div>
          <div className="text-[11px] text-[#6E6B65]">Termasuk kiloan express & dry clean</div>
        </div>

        {/* Metric 3: Pengantaran Kurir */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider">Sedang Diantar Kurir</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8873A]/15 text-[#E8873A] flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#E8873A]">{inDeliveryCount} Pengiriman</div>
          <div className="text-[11px] text-[#6E6B65]">Live GPS tracking aktif</div>
        </div>

        {/* Metric 4: Armada Kurir Standby */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider">Kurir On-Duty</span>
            <div className="w-8 h-8 rounded-xl bg-[#F2B705]/20 text-[#8C6600] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#2B2B28]">{onlineCouriersCount} / {couriers.length} Driver</div>
          <div className="text-[11px] text-[#4C9A5B] font-semibold">Siap menerima order penjemputan</div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-[#EFEDE7] border border-[#E2DFD7] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2 justify-center sm:justify-start">
            <Store className="w-4 h-4 text-[#1F7A6C]" />
            <span>Layanan Kasir Walk-In Laundry Siap Digunakan</span>
          </h4>
          <p className="text-xs text-[#6E6B65] max-w-xl">
            Customer yang datang langsung ke toko dapat diinput melalui modul POS Kasir, ditimbang otomatis, dan dicetak struk ber-barcode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPos}
            className="px-5 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>+ Buka Kasir Walk-In POS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders Stream & Live Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders List (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E2DFD7] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1F7A6C]" />
              <span>Aktivitas Pesanan Laundry Terbaru</span>
            </h4>
            <button
              onClick={onNavigateToOrders}
              className="text-xs text-[#1F7A6C] hover:text-[#134F45] font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 5).map(ord => {
              const statusInfo = getStatusBadgeInfo(ord.status);
              return (
                <div
                  key={ord.id}
                  className="bg-[#EFEDE7] border border-[#E2DFD7] rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E2DFD7] flex items-center justify-center font-mono font-bold text-[#134F45] text-[11px]">
                      {ord.orderNumber.split('-')[2]}
                    </div>
                    <div>
                      <div className="font-bold text-[#2B2B28]">{ord.customerName}</div>
                      <div className="text-[11px] text-[#6E6B65]">{ord.serviceName} • 🌸 {ord.perfumeAroma}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-[#2B2B28]">{formatRupiah(ord.totalPrice)}</div>
                      <div className="text-[10px] text-[#6E6B65]">{formatShortDate(ord.createdAt)}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Status & Fleet Summary */}
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#1F7A6C]" />
              <span>Status Kurir Live</span>
            </h4>
            <button
              onClick={onNavigateToFleet}
              className="text-xs text-[#1F7A6C] hover:text-[#134F45] font-semibold"
            >
              GPS Map
            </button>
          </div>

          <div className="space-y-3">
            {couriers.map(c => (
              <div
                key={c.id}
                className="bg-[#EFEDE7] p-3 rounded-xl border border-[#E2DFD7] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-[#E2DFD7]" />
                  <div>
                    <div className="font-bold text-xs text-[#2B2B28]">{c.name}</div>
                    <div className="text-[10px] text-[#6E6B65]">{c.plateNumber}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.isAvailable ? 'bg-[#4C9A5B]/20 text-[#4C9A5B]' : 'bg-[#E2DFD7] text-[#6E6B65]'}`}>
                    {c.isAvailable ? 'Aktif' : 'Offline'}
                  </span>
                  <div className="text-[10px] text-[#6E6B65] mt-0.5">{c.completedToday} kirim</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E2DFD7] pt-3 text-[11px] text-[#6E6B65] flex items-center justify-between">
            <span>Selesai Hari Ini:</span>
            <span className="font-bold text-[#4C9A5B]">{completedCount} Pesanan Tuntas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
