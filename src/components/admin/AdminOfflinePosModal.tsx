import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Store,
  Printer,
  Scale,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Receipt,
  User,
  Phone,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { OrderItem, PaymentMethod, ServiceType } from '../../types/laundry';
import { formatRupiah } from '../../utils/formatters';

interface AdminOfflinePosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (orderId: string) => void;
}

export const AdminOfflinePosModal: React.FC<AdminOfflinePosModalProps> = ({
  isOpen,
  onClose,
  onOpenReceipt,
}) => {
  const { services, perfumes, createOfflineWalkInOrder } = useLaundry();

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceType>('kiloan_reguler');
  const [weightKg, setWeightKg] = useState<number>(3.5);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPerfume, setSelectedPerfume] = useState<string>('Sakura Blossom (Floral Lembut)');
  const [isExpress, setIsExpress] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];
  const isKiloan = currentService.category === 'kiloan';

  const baseRate = currentService.basePrice;
  const itemsTotal = isKiloan ? Math.round(baseRate * weightKg) : baseRate * quantity;
  const expressFee = isExpress ? Math.round(itemsTotal * 0.4) : 0;
  const grandTotal = itemsTotal + expressFee;

  const handleCreateWalkInOrder = () => {
    if (!customerName) {
      alert('Mohon masukkan nama customer');
      return;
    }

    const itemEntry: OrderItem = {
      id: `item-pos-${Date.now()}`,
      name: currentService.name,
      category: currentService.category === 'kiloan' ? 'kiloan' : (currentService.id.includes('tas') ? 'tas' : currentService.id.includes('sepatu') ? 'sepatu' : 'pakaian'),
      quantity: isKiloan ? 1 : quantity,
      unitPrice: itemsTotal + expressFee,
      notes: isKiloan ? `Timbangan Toko: ${weightKg} kg` : `${quantity} item (${specialNotes || 'POS Outlet'})`,
    };

    const newOrder = createOfflineWalkInOrder({
      customerName,
      customerPhone: customerPhone || '0812-0000-0000',
      serviceType: currentService.id,
      serviceName: currentService.name,
      perfumeAroma: selectedPerfume,
      specialInstructions: specialNotes || undefined,
      isExpress,
      totalWeightKg: isKiloan ? weightKg : undefined,
      paymentMethod,
      items: [itemEntry],
    });

    setCreatedOrderId(newOrder.id);
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCreatedOrderId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl bg-white border border-[#E2DFD7] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#2B2B28]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E2DFD7] flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F7A6C]/15 text-[#134F45] flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#2B2B28]">POS Kasir Laundry Toko (Walk-In Offline)</h3>
                <p className="text-xs text-[#6E6B65]">Input pesanan customer yang datang langsung ke outlet</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-full bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
            {!createdOrderId ? (
              <>
                {/* Customer Information Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#2B2B28] block mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#1F7A6C]" />
                      <span>Nama Customer (Walk-in) *</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                      placeholder="Contoh: Pak Hendra / Ibu Maya"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#2B2B28] block mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1F7A6C]" />
                      <span>Nomor WhatsApp (Untuk Notifikasi Struk)</span>
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                      placeholder="Contoh: 0818-0909-8877"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="text-xs font-bold text-[#2B2B28] uppercase tracking-wider block mb-2">
                    Pilih Layanan Laundry
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {services.map(s => {
                      const isSel = selectedServiceId === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedServiceId(s.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSel
                              ? 'bg-[#1F7A6C] border-[#1F7A6C] text-white shadow-sm'
                              : 'bg-[#FAF9F6] border-[#E2DFD7] text-[#2B2B28] hover:border-[#1F7A6C]/60'
                          }`}
                        >
                          <div>
                            <div className={`font-bold text-xs ${isSel ? 'text-white' : 'text-[#2B2B28]'}`}>{s.name.split('(')[0]}</div>
                            <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSel ? 'text-white/80' : 'text-[#6E6B65]'}`}>{s.description}</div>
                          </div>
                          <div className={`mt-2 text-xs font-bold ${isSel ? 'text-[#F2B705]' : 'text-[#1F7A6C]'}`}>
                            {formatRupiah(s.basePrice)} / {s.unit.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scale Weight & Quantity */}
                <div className="bg-[#EFEDE7] p-4 rounded-xl border border-[#E2DFD7] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold text-[#2B2B28] block mb-1 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#1F7A6C]" />
                      <span>{isKiloan ? 'Timbangan Digital (Kg)' : 'Jumlah Satuan (Pcs/Pasang)'}</span>
                    </label>
                    <p className="text-[11px] text-[#6E6B65]">
                      {isKiloan ? 'Tarif dihitung otomatis sesuai timbangan' : 'Masukkan jumlah pakaian / tas'}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => (isKiloan ? setWeightKg(Math.max(1, Number((weightKg - 0.5).toFixed(1)))) : setQuantity(Math.max(1, quantity - 1)))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-[#E2DFD7] text-[#2B2B28] font-bold text-lg flex items-center justify-center border border-[#E2DFD7] shadow-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step={isKiloan ? '0.1' : '1'}
                      value={isKiloan ? weightKg : quantity}
                      onChange={e => (isKiloan ? setWeightKg(Number(e.target.value)) : setQuantity(Number(e.target.value)))}
                      className="w-20 bg-white border border-[#E2DFD7] text-center font-bold text-lg text-[#134F45] py-1.5 rounded-xl shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => (isKiloan ? setWeightKg(Number((weightKg + 0.5).toFixed(1))) : setQuantity(quantity + 1))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-[#E2DFD7] text-[#2B2B28] font-bold text-lg flex items-center justify-center border border-[#E2DFD7] shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Perfume Selection */}
                <div>
                  <label className="text-xs font-bold text-[#2B2B28] uppercase tracking-wider block mb-2">
                    Pilihan Parfum Gratis untuk Customer
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {perfumes.map(p => {
                      const isSel = selectedPerfume === p.name;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPerfume(p.name)}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                            isSel
                              ? 'bg-[#1F7A6C]/15 border-[#1F7A6C] text-[#134F45] font-bold'
                              : 'bg-[#FAF9F6] border-[#E2DFD7] text-[#2B2B28] hover:border-[#1F7A6C]/60'
                          }`}
                        >
                          🌸 {p.name.split('(')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Express & Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F2B705]/15 border border-[#F2B705]/40 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#8C6600]">⚡ Prioritas Express 24 Jam</div>
                      <div className="text-[10px] text-[#6E6B65]">Selesai kilat (+40%)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isExpress}
                      onChange={e => setIsExpress(e.target.checked)}
                      className="w-5 h-5 accent-[#1F7A6C] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B2B28] block mb-1">
                      Metode Pembayaran Kasir
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-[#FAF9F6] border border-[#E2DFD7] rounded-xl px-3 py-2.5 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                    >
                      <option value="cash">Tunai / Cash Kasir</option>
                      <option value="qris">QRIS Statis Outlet</option>
                      <option value="transfer_bank">Transfer EDC Bank</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#4C9A5B]/20 text-[#4C9A5B] border border-[#4C9A5B]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#2B2B28]">Nota Walk-in Toko Berhasil Dibuat!</h4>
                  <p className="text-xs text-[#6E6B65] mt-1">
                    Pakaian customer langsung masuk antrian cuci workshop dengan status: <span className="text-[#134F45] font-bold">Sedang Dicuci</span>
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onOpenReceipt(createdOrderId);
                      handleReset();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Struk Thermal Barcode</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-semibold text-xs border border-[#E2DFD7]"
                  >
                    Buat Transaksi Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!createdOrderId && (
            <div className="p-4 border-t border-[#E2DFD7] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6E6B65]">Total Tagihan Kasir:</span>
                <div className="text-lg font-extrabold text-[#134F45]">{formatRupiah(grandTotal)}</div>
              </div>
              <button
                onClick={handleCreateWalkInOrder}
                className="px-6 py-3 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Pesanan & Cetak Nota</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
