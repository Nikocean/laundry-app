import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Bike,
  Tag,
  Store,
  Bell,
  RefreshCw,
  Sparkles,
  Search,
  User,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminOrdersManagement } from './AdminOrdersManagement';
import { AdminCourierFleet } from './AdminCourierFleet';
import { AdminServicesPricing } from './AdminServicesPricing';
import { AdminOfflinePosModal } from './AdminOfflinePosModal';

interface AdminWebDashboardProps {
  onOpenReceipt: (orderId: string) => void;
}

export const AdminWebDashboard: React.FC<AdminWebDashboardProps> = ({ onOpenReceipt }) => {
  const { orders, notifications, markNotificationsAsRead, resetDemoData } = useLaundry();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'couriers' | 'pricing'>('overview');
  const [isPosModalOpen, setIsPosModalOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const unreadAdminNotifs = notifications.filter(
    n => !n.read && (n.targetRole === 'admin' || n.targetRole === 'all')
  );

  return (
    <div className="flex h-full bg-[#FAF9F6] text-[#2B2B28] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Web Admin Sidebar */}
      <div className="w-64 bg-white border-r border-[#E2DFD7] flex flex-col justify-between p-4 shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#1F7A6C] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-[#F2B705]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#2B2B28] tracking-tight">Klinik Cuci Admin</h2>
              <span className="text-[10px] bg-[#1F7A6C]/15 text-[#134F45] px-1.5 py-0.2 rounded font-mono font-bold">
                PORTAL ADMIN
              </span>
            </div>
          </div>

          {/* POS Quick Button */}
          <button
            onClick={() => setIsPosModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Store className="w-4 h-4" />
            <span>+ Kasir Walk-In POS</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                  : 'text-[#6E6B65] hover:text-[#2B2B28] hover:bg-[#EFEDE7]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                  : 'text-[#6E6B65] hover:text-[#2B2B28] hover:bg-[#EFEDE7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Manajemen Pesanan</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#EFEDE7] text-[#2B2B28]'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('couriers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'couriers'
                  ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                  : 'text-[#6E6B65] hover:text-[#2B2B28] hover:bg-[#EFEDE7]'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Armada & GPS Kurir</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pricing'
                  ? 'bg-[#1F7A6C] text-white font-bold shadow-sm'
                  : 'text-[#6E6B65] hover:text-[#2B2B28] hover:bg-[#EFEDE7]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Tarif & Parfum</span>
            </button>
          </nav>
        </div>

        {/* User Profile & Demo Reset at Bottom */}
        <div className="pt-4 border-t border-[#E2DFD7] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#EFEDE7] border border-[#E2DFD7] flex items-center justify-center font-bold text-xs text-[#134F45]">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-[#2B2B28]">Admin Laundry Hub</div>
              <div className="text-[10px] text-[#4C9A5B] font-mono">● Online • Store Manager</div>
            </div>
          </div>

          <button
            onClick={resetDemoData}
            className="w-full py-2 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] hover:text-[#2B2B28] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#E2DFD7]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Data Simulasi</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white border-b border-[#E2DFD7] flex items-center justify-between shrink-0 shadow-xs">
          {/* Mobile Tab Pills if screen is small */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'overview' ? 'bg-[#1F7A6C] text-white' : 'text-[#6E6B65]'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'orders' ? 'bg-[#1F7A6C] text-white' : 'text-[#6E6B65]'}`}
            >
              Pesanan
            </button>
            <button
              onClick={() => setActiveTab('couriers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'couriers' ? 'bg-[#1F7A6C] text-white' : 'text-[#6E6B65]'}`}
            >
              Kurir
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-base font-bold text-[#2B2B28]">
              {activeTab === 'overview' && 'Dashboard Operasional Laundry'}
              {activeTab === 'orders' && 'Manajemen & Monitoring Pesanan'}
              {activeTab === 'couriers' && 'Monitoring Armada Kurir Delivery GPS'}
              {activeTab === 'pricing' && 'Katalog Layanan & Pengaturan Tarif'}
            </h1>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPosModalOpen(true)}
              className="md:hidden px-3 py-1.5 rounded-lg bg-[#1F7A6C] text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> POS
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead('admin');
                }}
                className="w-9 h-9 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] flex items-center justify-center relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadAdminNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C1554A] text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadAdminNotifs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-[#E2DFD7] rounded-2xl shadow-xl p-4 z-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-2">
                    <span className="text-xs font-bold text-[#2B2B28]">Notifikasi Admin Real-time</span>
                    <span className="text-[10px] text-[#4C9A5B] font-mono font-bold">Event Stream</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.filter(n => n.targetRole === 'admin' || n.targetRole === 'all').length === 0 ? (
                      <div className="text-xs text-[#6E6B65] py-4 text-center">Tidak ada notifikasi</div>
                    ) : (
                      notifications
                        .filter(n => n.targetRole === 'admin' || n.targetRole === 'all')
                        .slice(0, 6)
                        .map(n => (
                          <div key={n.id} className="p-2.5 bg-[#EFEDE7] rounded-xl border border-[#E2DFD7] text-xs">
                            <div className="font-bold text-[#134F45] text-xs">{n.title}</div>
                            <div className="text-[11px] text-[#2B2B28] mt-0.5">{n.message}</div>
                            <div className="text-[9px] text-[#6E6B65] mt-1 font-mono">{n.timestamp}</div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#E2DFD7]">
          {activeTab === 'overview' && (
            <AdminDashboardOverview
              onNavigateToOrders={() => setActiveTab('orders')}
              onNavigateToFleet={() => setActiveTab('couriers')}
              onOpenPos={() => setIsPosModalOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersManagement
              onOpenReceipt={onOpenReceipt}
              onOpenPos={() => setIsPosModalOpen(true)}
            />
          )}

          {activeTab === 'couriers' && <AdminCourierFleet />}

          {activeTab === 'pricing' && <AdminServicesPricing />}
        </main>
      </div>

      {/* Offline Walk-in POS Modal */}
      <AdminOfflinePosModal
        isOpen={isPosModalOpen}
        onClose={() => setIsPosModalOpen(false)}
        onOpenReceipt={onOpenReceipt}
      />
    </div>
  );
};
