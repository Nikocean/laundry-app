import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Store, Bike, Sparkles } from 'lucide-react';
import { Courier, Order } from '../../types/laundry';

interface LiveMapSimulatorProps {
  order?: Order;
  courier?: Courier;
  interactive?: boolean;
  className?: string;
  showAllCouriers?: boolean;
  allCouriers?: Courier[];
  onSelectCourier?: (courierId: string) => void;
}

export const LiveMapSimulator: React.FC<LiveMapSimulatorProps> = ({
  order,
  courier,
  interactive = false,
  className = '',
  showAllCouriers = false,
  allCouriers = [],
  onSelectCourier,
}) => {
  // Hub location is fixed at (50%, 50%)
  const hubLocation = { x: 50, y: 50, label: 'Laundry Central Hub & Store' };
  
  // Destination
  const destLocation = order?.customerCoordinates || { x: 72, y: 38, label: 'Alamat Pelanggan' };

  // Courier position
  const courierLocation = courier?.currentLocation || { x: 35, y: 42, address: 'Dalam Perjalanan' };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#EFEDE7] border border-[#E2DFD7] shadow-sm select-none ${className}`}>
      {/* City Grid Map Background Vector */}
      <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCD8CD" strokeWidth="1" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Main Avenues / Roads */}
        <path d="M 0 120 Q 200 110 400 150 T 800 130" stroke="#E2DFD7" strokeWidth="14" fill="none" />
        <path d="M 150 0 Q 180 200 130 400 T 200 800" stroke="#E2DFD7" strokeWidth="12" fill="none" />
        <path d="M 0 280 L 800 240" stroke="#DFDBD0" strokeWidth="10" fill="none" />
        <path d="M 320 0 L 360 800" stroke="#DFDBD0" strokeWidth="10" fill="none" />
        <path d="M 40 400 Q 300 300 700 350" stroke="#DFDBD0" strokeWidth="8" fill="none" />

        {/* Dynamic Navigation Polyline from Hub to Courier to Destination */}
        {order && order.status === 'delivering' && (
          <g>
            {/* Traveled / active segment */}
            <line
              x1={`${hubLocation.x}%`}
              y1={`${hubLocation.y}%`}
              x2={`${courierLocation.x}%`}
              y2={`${courierLocation.y}%`}
              stroke="#1F7A6C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
            <line
              x1={`${courierLocation.x}%`}
              y1={`${courierLocation.y}%`}
              x2={`${destLocation.x}%`}
              y2={`${destLocation.y}%`}
              stroke="#4C9A5B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 6"
            />
          </g>
        )}
      </svg>

      {/* City District Landmarks / Badges */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="text-[10px] font-mono tracking-wider uppercase text-[#6E6B65] bg-[#FAF9F6]/90 px-2 py-0.5 rounded-lg border border-[#E2DFD7] shadow-sm">
          📍 Jak-Sel Area
        </span>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] text-[#6E6B65] font-mono flex items-center gap-1.5 bg-[#FAF9F6]/90 px-2 py-0.5 rounded-lg border border-[#E2DFD7]">
        <span className="w-2 h-2 rounded-full bg-[#1F7A6C]" />
        <span>GPS Live 10Hz Feed</span>
      </div>

      {/* 1. CENTRAL LAUNDRY HUB (Workshop & Kasir) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
        style={{ left: `${hubLocation.x}%`, top: `${hubLocation.y}%` }}
      >
        <div className="relative group">
          <div className="w-9 h-9 rounded-xl bg-[#1F7A6C] border-2 border-white shadow-md flex items-center justify-center text-white">
            <Store className="w-4 h-4" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-[#FAF9F6] text-[#2B2B28] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E2DFD7] shadow-sm">
            Klinik Cuci Hub
          </div>
        </div>
      </div>

      {/* 2. CUSTOMER DESTINATION PIN */}
      {order && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          style={{ left: `${destLocation.x}%`, top: `${destLocation.y}%` }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#E8873A] border-2 border-white shadow-md flex items-center justify-center text-white z-10 relative">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-[#FAF9F6] text-[#2B2B28] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E2DFD7] shadow-sm">
              🏠 {order.customerName.split(' ')[0]} ({order.orderNumber})
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE ASSIGNED COURIER (Animated marker) */}
      {courier && (
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer"
          style={{ left: `${courierLocation.x}%`, top: `${courierLocation.y}%` }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#134F45] border-2 border-white shadow-lg flex items-center justify-center text-white">
              <Bike className="w-5 h-5" />
            </div>
            {/* Speed badge */}
            <div className="absolute -top-2 -right-2 bg-[#F2B705] text-[#2B2B28] font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-white">
              34 km/h
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-[#FAF9F6] text-[#134F45] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E2DFD7] shadow-sm flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#1F7A6C] rotate-45" />
              <span>{courier.name} ({courier.plateNumber})</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. SHOW ALL COURIERS IN FLEET (For Admin Map View) */}
      {showAllCouriers &&
        allCouriers.map(c => {
          if (c.id === courier?.id) return null; // already rendered
          return (
            <div
              key={c.id}
              onClick={() => onSelectCourier && onSelectCourier(c.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              style={{ left: `${c.currentLocation.x}%`, top: `${c.currentLocation.y}%` }}
            >
              <div className={`w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center text-white shadow-sm ${
                c.isAvailable ? 'bg-[#1F7A6C]' : 'bg-[#9C9890] opacity-70'
              }`}>
                <Bike className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1 whitespace-nowrap text-[9px] bg-[#FAF9F6] text-[#2B2B28] font-medium px-1.5 py-0.5 rounded border border-[#E2DFD7] shadow-sm">
                {c.name}
              </div>
            </div>
          );
        })}

      {/* ETA & Status Overlay Floating Card */}
      {order && order.status === 'delivering' && courier && (
        <div className="absolute top-3 right-3 z-30 bg-[#FAF9F6]/95 border border-[#E2DFD7] p-2.5 rounded-xl shadow-md flex items-center gap-2.5 max-w-[210px]">
          <div className="w-8 h-8 rounded-lg bg-[#1F7A6C]/10 text-[#1F7A6C] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#1F7A6C]" />
          </div>
          <div>
            <div className="text-[10px] text-[#6E6B65] uppercase font-mono">Estimasi Tiba</div>
            <div className="text-xs font-bold text-[#134F45]">12 - 18 Menit</div>
            <div className="text-[10px] text-[#6E6B65] truncate">{courier.currentLocation.address}</div>
          </div>
        </div>
      )}
    </div>
  );
};
