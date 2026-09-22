import React, { useState } from 'react';
import {
  Home,
  Navigation,
  Clock,
  User,
  Plus,
  Bell,
  Sparkles,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { CustomerHomeView } from './CustomerHomeView';
import { CustomerTrackingView } from './CustomerTrackingView';
import { CustomerHistoryView } from './CustomerHistoryView';
import { CustomerNewOrderModal } from './CustomerNewOrderModal';
import { useLaundry } from '../../context/LaundryContext';
import { ServiceType } from '../../types/laundry';

interface CustomerFlutterAppProps {
  onOpenReceiptModal: (orderId: string) => void;
}

export const CustomerFlutterApp: React.FC<CustomerFlutterAppProps> = ({ onOpenReceiptModal }) => {
  const { notifications, markNotificationsAsRead, setSelectedOrderId } = useLaundry();
  const [activeTab, setActiveTab] = useState<'home' | 'tracking' | 'history' | 'profile'>('home');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<ServiceType | undefined>(undefined);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);

  const unreadCustomerNotifs = notifications.filter(
    n => !n.read && (n.targetRole === 'customer' || n.targetRole === 'all')
  );

  const handleOpenNewOrder = (serviceId?: ServiceType) => {
    setSelectedServiceForOrder(serviceId);
    setIsNewOrderModalOpen(true);
  };

  const handleNavigateToTracking = (orderId?: string) => {
    if (orderId) setSelectedOrderId(orderId);
    setActiveTab('tracking');
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#2B2B28] relative overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Flutter Mobile Top App Bar */}
      <div className="px-4 py-3 bg-[#FAF9F6] border-b border-[#E2DFD7] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1F7A6C] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-[#F2B705]" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#134F45] flex items-center gap-1">
              <span>CleanWave Customer</span>
              <span className="text-[9px] bg-[#1F7A6C]/10 text-[#134F45] px-1.5 py-0.2 rounded font-mono font-semibold">
                Flutter
              </span>
            </h1>
            <p className="text-[10px] text-[#6E6B65]">Laundry Pickup & Delivery</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => {
              setShowNotificationPopup(!showNotificationPopup);
              if (!showNotificationPopup) markNotificationsAsRead('customer');
            }}
            className="w-8 h-8 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] flex items-center justify-center relative transition-colors border border-[#E2DFD7]"
          >
            <Bell className="w-4 h-4 text-[#6E6B65]" />
            {unreadCustomerNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C1554A] text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCustomerNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications dropdown popup */}
          {showNotificationPopup && (
            <div className="absolute right-0 top-10 w-72 bg-[#FAF9F6] border border-[#E2DFD7] rounded-2xl shadow-xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-2">
                <span className="text-xs font-bold text-[#2B2B28]">Notifikasi Real-time</span>
                <span className="text-[10px] text-[#1F7A6C] font-semibold">Auto-sync</span>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {notifications.filter(n => n.targetRole === 'customer' || n.targetRole === 'all').length === 0 ? (
                  <div className="text-[11px] text-[#6E6B65] py-3 text-center">Belum ada notifikasi baru</div>
                ) : (
                  notifications
                    .filter(n => n.targetRole === 'customer' || n.targetRole === 'all')
                    .slice(0, 5)
                    .map(n => (
                      <div key={n.id} className="p-2 bg-white rounded-xl border border-[#E2DFD7] text-xs shadow-sm">
                        <div className="font-bold text-[#1F7A6C] text-[11px]">{n.title}</div>
                        <div className="text-[10px] text-[#2B2B28] mt-0.5">{n.message}</div>
                        <div className="text-[9px] text-[#6E6B65] mt-1 font-mono">{n.timestamp}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content View Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && (
          <CustomerHomeView
            onOpenNewOrder={handleOpenNewOrder}
            onNavigateToTracking={handleNavigateToTracking}
          />
        )}

        {activeTab === 'tracking' && (
          <CustomerTrackingView onOpenReceiptModal={onOpenReceiptModal} />
        )}

        {activeTab === 'history' && (
          <CustomerHistoryView
            onSelectOrder={handleNavigateToTracking}
            onOpenReceipt={onOpenReceiptModal}
          />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 pb-20 text-xs">
            <div className="bg-white border border-[#E2DFD7] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1F7A6C] flex items-center justify-center text-white font-bold text-base shadow-sm">
                NM
              </div>
              <div>
                <div className="font-bold text-sm text-[#2B2B28]">Nikolas Marcellino</div>
                <div className="text-[11px] text-[#6E6B65]">0813-8899-0011</div>
                <div className="text-[10px] text-[#1F7A6C] font-mono font-bold mt-0.5">Member Gold • 120 Poin Laundry</div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DFD7] rounded-2xl p-3.5 space-y-2 shadow-sm">
              <div className="font-bold text-[#6E6B65] text-xs uppercase tracking-wider mb-2">
                Alamat Tersimpan
              </div>
              <div className="p-2.5 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
                <div className="font-bold text-[#2B2B28]">Apartemen Sudirman Park (Utama)</div>
                <div className="text-[#6E6B65] text-[11px] mt-0.5">Tower B No. 1402, Jl. KH Mas Mansyur, Jakarta Pusat</div>
              </div>
              <div className="p-2.5 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
                <div className="font-bold text-[#2B2B28]">Kantor Menara BCA</div>
                <div className="text-[#6E6B65] text-[11px] mt-0.5">Lantai 28, Jl. MH Thamrin No. 1, Jakarta Pusat</div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DFD7] rounded-2xl p-3.5 space-y-2 shadow-sm">
              <div className="font-bold text-[#6E6B65] text-xs uppercase tracking-wider mb-1">
                Bantuan & CS Laundry
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7]">
                <span className="text-[#2B2B28]">Hubungi Hotline Outlet</span>
                <a href="tel:081298765432" className="text-[#1F7A6C] font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> 0812-9876-5432
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flutter Floating Action Button (Quick Booking) */}
      <button
        onClick={() => handleOpenNewOrder()}
        className="absolute bottom-16 right-4 z-40 bg-[#1F7A6C] hover:bg-[#134F45] text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs font-bold pr-1">Pesan Cuci</span>
      </button>

      {/* Flutter Bottom Navigation Bar */}
      <div className="bg-[#FAF9F6] border-t border-[#E2DFD7] px-2 py-2 flex items-center justify-around sticky bottom-0 z-30">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65] hover:text-[#2B2B28]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'tracking' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65] hover:text-[#2B2B28]'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px]">Tracking GPS</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'history' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65] hover:text-[#2B2B28]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Riwayat</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65] hover:text-[#2B2B28]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Akun</span>
        </button>
      </div>

      {/* Booking Modal */}
      <CustomerNewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        preselectedServiceId={selectedServiceForOrder}
      />
    </div>
  );
};
