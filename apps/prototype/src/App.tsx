/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Bike,
  LayoutDashboard,
  Columns2,
  FileCode2,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { LaundryProvider, useLaundry, AppViewMode } from './context/LaundryContext';
import { CustomerFlutterApp } from './components/customer/CustomerFlutterApp';
import { CourierFlutterApp } from './components/courier/CourierFlutterApp';
import { AdminWebDashboard } from './components/admin/AdminWebDashboard';
import { EarsSpecViewer } from './components/docs/EarsSpecViewer';
import { PhoneFrame } from './components/common/PhoneFrame';
import { ReceiptModal } from './components/common/ReceiptModal';

function MainLaundryApp() {
  const {
    activeViewMode,
    setActiveViewMode,
    runDemoSimulation,
    isSimulating,
    resetDemoData,
  } = useLaundry();

  const [activeReceiptOrderId, setActiveReceiptOrderId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B2B28] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Universal Applet Header & Multi-Device Workspace Switcher */}
      <header className="bg-[#FAF9F6] border-b border-[#E2DFD7] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-sm backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1F7A6C] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-[#F2B705]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#134F45] tracking-tight">
                CleanWave Laundry Ecosystem
              </span>
              <span className="text-[10px] bg-[#1F7A6C]/10 text-[#134F45] px-2 py-0.2 rounded-full font-mono font-bold border border-[#1F7A6C]/25">
                LIVE REALTIME
              </span>
            </div>
            <p className="text-[10px] text-[#6E6B65]">
              Flutter Customer • Flutter Courier • Web Admin Dashboard • POS Kasir Walk-in
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center bg-[#EFEDE7] p-1 rounded-2xl border border-[#E2DFD7] shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveViewMode('dual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'dual'
                ? 'bg-[#1F7A6C] text-white shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Simulasi Multi-Device</span>
          </button>

          <button
            onClick={() => setActiveViewMode('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'customer'
                ? 'bg-[#1F7A6C] text-white shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer App</span>
          </button>

          <button
            onClick={() => setActiveViewMode('courier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'courier'
                ? 'bg-[#1F7A6C] text-white shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Courier App</span>
          </button>

          <button
            onClick={() => setActiveViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'admin'
                ? 'bg-[#1F7A6C] text-white shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Web Admin</span>
          </button>

          <button
            onClick={() => setActiveViewMode('spec')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'spec'
                ? 'bg-[#1F7A6C] text-white shadow-sm'
                : 'text-[#6E6B65] hover:text-[#2B2B28]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>EARS Specs</span>
          </button>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={runDemoSimulation}
            disabled={isSimulating}
            className="px-3.5 py-1.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Simulasi otomatis pergerakan kurir di map & konfirmasi serah terima"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Kurir Berjalan...' : 'Simulasi GPS'}</span>
          </button>

          <button
            onClick={resetDemoData}
            className="p-1.5 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] hover:text-[#2B2B28] transition-colors border border-[#E2DFD7]"
            title="Reset Data Simulasi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {/* VIEW 1: DUAL / MULTI-DEVICE SIDE-BY-SIDE SIMULATION */}
        {activeViewMode === 'dual' && (
          <div className="max-w-[1500px] mx-auto space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-base font-bold text-[#134F45] flex items-center justify-center gap-2">
                <span>Ekosistem Laundry Terintegrasi Real-Time</span>
              </h2>
              <p className="text-xs text-[#6E6B65]">
                Pesan via Flutter Customer App, pantau & update wash status di Web Admin, atau jalankan delivery via Flutter Courier App. Setiap aksi tersinkronisasi instan!
              </p>
            </div>

            {/* 3 Column Desktop Layout: Customer Phone | Courier Phone | Web Admin */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Column 1: Customer Phone */}
              <div className="xl:col-span-3 flex justify-center">
                <PhoneFrame
                  title="Aplikasi Pelanggan (Customer)"
                  badge="Flutter Android/iOS"
                  deviceColor="indigo"
                >
                  <CustomerFlutterApp
                    onOpenReceiptModal={id => setActiveReceiptOrderId(id)}
                  />
                </PhoneFrame>
              </div>

              {/* Column 2: Courier Phone */}
              <div className="xl:col-span-3 flex justify-center">
                <PhoneFrame
                  title="Aplikasi Kurir (Courier)"
                  badge="Flutter Driver App"
                  deviceColor="cyan"
                >
                  <CourierFlutterApp />
                </PhoneFrame>
              </div>

              {/* Column 3: Web Admin Management Portal */}
              <div className="xl:col-span-6 h-[740px] bg-[#FAF9F6] border border-[#E2DFD7] rounded-3xl overflow-hidden shadow-xl flex flex-col">
                <div className="bg-[#EFEDE7] px-4 py-2 border-b border-[#E2DFD7] flex items-center justify-between text-xs text-[#6E6B65] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C1554A]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F2B705]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4C9A5B]" />
                    <span className="pl-2 font-bold text-[#2B2B28]">Dashboard Web Admin Laundry</span>
                  </div>
                  <span className="text-[10px] text-[#1F7A6C] font-semibold">localhost:3000 / admin</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AdminWebDashboard
                    onOpenReceipt={id => setActiveReceiptOrderId(id)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: FULL CUSTOMER PHONE */}
        {activeViewMode === 'customer' && (
          <div className="flex justify-center py-4">
            <PhoneFrame
              title="Aplikasi Pelanggan (Customer App)"
              badge="Flutter Android/iOS"
              deviceColor="indigo"
            >
              <CustomerFlutterApp
                onOpenReceiptModal={id => setActiveReceiptOrderId(id)}
              />
            </PhoneFrame>
          </div>
        )}

        {/* VIEW 3: FULL COURIER PHONE */}
        {activeViewMode === 'courier' && (
          <div className="flex justify-center py-4">
            <PhoneFrame
              title="Aplikasi Kurir (Courier App)"
              badge="Flutter Driver"
              deviceColor="cyan"
            >
              <CourierFlutterApp />
            </PhoneFrame>
          </div>
        )}

        {/* VIEW 4: FULL WEB ADMIN PORTAL */}
        {activeViewMode === 'admin' && (
          <div className="h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-[#E2DFD7] shadow-xl bg-[#FAF9F6]">
            <AdminWebDashboard
              onOpenReceipt={id => setActiveReceiptOrderId(id)}
            />
          </div>
        )}

        {/* VIEW 5: EARS REQUIREMENTS & SYSTEM SPECIFICATION */}
        {activeViewMode === 'spec' && <EarsSpecViewer />}
      </main>

      {/* Global Receipt Modal */}
      <ReceiptModal
        orderId={activeReceiptOrderId}
        onClose={() => setActiveReceiptOrderId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LaundryProvider>
      <MainLaundryApp />
    </LaundryProvider>
  );
}
