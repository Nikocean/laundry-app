import React, { useState } from 'react';
import { Bike, Power, MapPin, Phone, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { LiveMapSimulator } from '../common/LiveMapSimulator';
import { formatRupiah } from '../../utils/formatters';

export const AdminCourierFleet: React.FC = () => {
  const { couriers, toggleCourierAvailability, orders } = useLaundry();
  const [selectedCourierId, setSelectedCourierId] = useState<string>(couriers[0]?.id || 'courier-01');

  const selectedCourier = couriers.find(c => c.id === selectedCourierId) || couriers[0];
  const courierActiveOrder = orders.find(o => o.courierId === selectedCourier.id && o.status === 'delivering');

  return (
    <div className="space-y-5">
      {/* Fleet Live Tracking Map */}
      <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#1F7A6C]" />
              <span>Monitoring Armada Kurir GPS Real-Time</span>
            </h3>
            <p className="text-xs text-[#6E6B65]">Pantau posisi kurir motor di seluruh area Jakarta Selatan</p>
          </div>
          <span className="text-[11px] font-mono text-[#4C9A5B] bg-[#4C9A5B]/15 px-2.5 py-1 rounded-full border border-[#4C9A5B]/30 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#4C9A5B] animate-ping" />
            <span>{couriers.filter(c => c.isAvailable).length} Kurir Online</span>
          </span>
        </div>

        <LiveMapSimulator
          showAllCouriers={true}
          allCouriers={couriers}
          courier={selectedCourier}
          order={courierActiveOrder}
          onSelectCourier={id => setSelectedCourierId(id)}
          className="w-full h-72"
        />
      </div>

      {/* Courier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {couriers.map(courier => {
          const isSelected = courier.id === selectedCourierId;
          const activeDelivery = orders.find(o => o.courierId === courier.id && o.status === 'delivering');

          return (
            <div
              key={courier.id}
              onClick={() => setSelectedCourierId(courier.id)}
              className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'border-[#1F7A6C] ring-2 ring-[#1F7A6C]/20 shadow-md'
                  : 'border-[#E2DFD7] hover:border-[#1F7A6C]/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={courier.avatar}
                    alt={courier.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1F7A6C]"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#2B2B28]">{courier.name}</div>
                    <div className="text-xs text-[#6E6B65]">{courier.vehicle}</div>
                    <div className="text-[10px] text-[#134F45] font-mono font-bold">{courier.plateNumber}</div>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleCourierAvailability(courier.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                    courier.isAvailable
                      ? 'bg-[#4C9A5B]/15 text-[#4C9A5B] border border-[#4C9A5B]/30'
                      : 'bg-[#EFEDE7] text-[#6E6B65] border border-[#E2DFD7]'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{courier.isAvailable ? 'Aktif' : 'Off'}</span>
                </button>
              </div>

              <div className="bg-[#EFEDE7] p-2.5 rounded-xl border border-[#E2DFD7] text-xs space-y-1">
                <div className="flex justify-between text-[#6E6B65]">
                  <span>Lokasi Terakhir:</span>
                  <span className="text-[#2B2B28] font-medium truncate max-w-[140px]">{courier.currentLocation.address}</span>
                </div>
                <div className="flex justify-between text-[#6E6B65]">
                  <span>Tugas Selesai Hari Ini:</span>
                  <span className="text-[#4C9A5B] font-bold">{courier.completedToday} Pengantaran</span>
                </div>
                <div className="flex justify-between text-[#6E6B65]">
                  <span>Status Muatan:</span>
                  <span className="font-bold text-[#134F45]">
                    {activeDelivery ? `Mengantar (${activeDelivery.orderNumber})` : 'Standby / Kosong'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2DFD7]">
                <span className="text-[#8C6600] font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#F2B705] text-[#F2B705]" /> {courier.rating}
                </span>
                <a
                  href={`tel:${courier.phone}`}
                  onClick={e => e.stopPropagation()}
                  className="text-[#1F7A6C] hover:text-[#134F45] font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{courier.phone}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
