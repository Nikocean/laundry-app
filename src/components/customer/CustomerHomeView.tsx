import React from 'react';
import {
  Sparkles,
  Shirt,
  Briefcase,
  Footprints,
  Layers,
  Flame,
  ArrowRight,
  Shield,
  Star,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { ServiceType } from '../../types/laundry';
import { formatRupiah, getStatusBadgeInfo } from '../../utils/formatters';

interface CustomerHomeViewProps {
  onOpenNewOrder: (serviceId?: ServiceType) => void;
  onNavigateToTracking: (orderId?: string) => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onOpenNewOrder,
  onNavigateToTracking,
}) => {
  const { services, orders } = useLaundry();

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const latestActiveOrder = activeOrders[0];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Footprints': return <Footprints className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Welcome & Location Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#1F7A6C] font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Lokasi Antar/Jemput Anda</span>
          </div>
          <h2 className="text-sm font-bold text-[#2B2B28] flex items-center gap-1">
            <span>Sudirman Park, Jakarta Pusat</span>
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-[#F2B705]/15 border border-[#F2B705]/30 px-2.5 py-1 rounded-full text-[#8C6600] text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-[#F2B705] text-[#F2B705]" />
          <span>4.9 / 5.0 (Klinik Cuci)</span>
        </div>
      </div>

      {/* Promotional Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1F7A6C] p-4 text-white shadow-md">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-[#F2B705]" />
            <span>GRATIS ANTAR JEMPUT & PARFUM SAKURA</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold leading-tight">
              Laundry Pakaian, Tas & Sepatu Mewah
            </h3>
            <p className="text-xs text-white/90 mt-1 leading-relaxed">
              Dicuci higienis anti-bakteri, disetrika uap, dan dilacak real-time via kurir ekspres.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => onOpenNewOrder('kiloan_reguler')}
              className="px-4 py-2 rounded-xl bg-[#F2B705] text-[#2B2B28] font-bold text-xs shadow hover:bg-[#e0a905] transition-colors flex items-center gap-1"
            >
              <span>Pesan Cuci Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewOrder('satuan_tas')}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/30 transition-colors"
            >
              Spa Tas & Sepatu
            </button>
          </div>
        </div>
      </div>

      {/* Active Order Live Tracker Snapshot Widget (If any order is running) */}
      {latestActiveOrder && (
        <div className="bg-white border border-[#E2DFD7] rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F7A6C] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1F7A6C]" />
              </span>
              <span className="text-xs font-bold text-[#2B2B28]">Pesanan Sedang Diproses</span>
            </div>
            <span className="text-[11px] font-mono text-[#1F7A6C] font-bold">
              {latestActiveOrder.orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs bg-[#EFEDE7] p-2.5 rounded-xl border border-[#E2DFD7]">
            <div>
              <div className="font-semibold text-[#2B2B28]">{latestActiveOrder.serviceName}</div>
              <div className="text-[11px] text-[#6E6B65] mt-0.5">
                Status:{' '}
                <span className="font-bold" style={{ color: getStatusBadgeInfo(latestActiveOrder.status).hex }}>
                  {getStatusBadgeInfo(latestActiveOrder.status).label}
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTracking(latestActiveOrder.id)}
              className="px-3 py-1.5 rounded-lg bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors"
            >
              <span>Lihat GPS Live</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Services Category Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider">
            Pilihan Layanan Laundry
          </h3>
          <span className="text-[11px] text-[#1F7A6C] font-semibold cursor-pointer hover:underline">
            Lihat Semua Tarif
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {services.map(srv => (
            <div
              key={srv.id}
              onClick={() => onOpenNewOrder(srv.id)}
              className="bg-white border border-[#E2DFD7] hover:border-[#1F7A6C] rounded-2xl p-3 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#1F7A6C]/10 text-[#1F7A6C] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getServiceIcon(srv.iconName)}
                  </div>
                  {srv.popular && (
                    <span className="bg-[#F2B705]/20 text-[#8C6600] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      TOP
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-[#2B2B28] line-clamp-1 group-hover:text-[#1F7A6C] transition-colors">
                  {srv.name.split('(')[0]}
                </h4>
                <p className="text-[11px] text-[#6E6B65] mt-1 line-clamp-2 leading-tight">
                  {srv.description}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-[#E2DFD7] flex items-center justify-between">
                <div className="text-[11px] font-bold text-[#1F7A6C]">
                  {formatRupiah(srv.basePrice)} <span className="text-[9px] text-[#6E6B65] font-normal">/{srv.unit.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-[#6E6B65] flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{srv.estimatedDurationHours}j</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Klinik Cuci Features */}
      <div className="bg-white border border-[#E2DFD7] rounded-2xl p-3.5 space-y-2 shadow-sm">
        <div className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider mb-1">
          Keunggulan Layanan Kami
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
            <Shield className="w-4 h-4 mx-auto text-[#4C9A5B] mb-1" />
            <div className="text-[11px] font-bold text-[#2B2B28]">1 Mesin 1 Nota</div>
            <div className="text-[9px] text-[#6E6B65]">Higienis tak tertukar</div>
          </div>
          <div className="p-2 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
            <Sparkles className="w-4 h-4 mx-auto text-[#F2B705] mb-1" />
            <div className="text-[11px] font-bold text-[#2B2B28]">5 Pilihan Aroma</div>
            <div className="text-[9px] text-[#6E6B65]">Tahan hingga 14 hari</div>
          </div>
          <div className="p-2 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
            <Clock className="w-4 h-4 mx-auto text-[#4A90A4] mb-1" />
            <div className="text-[11px] font-bold text-[#2B2B28]">Live GPS Kurir</div>
            <div className="text-[9px] text-[#6E6B65]">Pantau pergerakan</div>
          </div>
        </div>
      </div>
    </div>
  );
};
