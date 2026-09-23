import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  MapPin,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  Home,
  Check,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { OrderItem, PaymentMethod, ServiceType } from '../../types/laundry';
import { formatRupiah } from '../../utils/formatters';

interface CustomerNewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: ServiceType;
  onOrderCompleted?: (orderId: string) => void;
}

export const CustomerNewOrderModal: React.FC<CustomerNewOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId = 'kiloan_reguler',
  onOrderCompleted,
}) => {
  const { services, perfumes, createCustomerOrder } = useLaundry();

  const [step, setStep] = useState<'service' | 'schedule' | 'payment' | 'success'>('service');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kiloan' | 'satuan' | 'sepatu_tas'>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceType>(preselectedServiceId);
  const [weightKg, setWeightKg] = useState<number>(4);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPerfume, setSelectedPerfume] = useState<string>('Sakura Blossom (Floral Lembut)');
  const [isExpress, setIsExpress] = useState<boolean>(false);

  // Address & Timing state
  const [selectedSavedAddressIndex, setSelectedSavedAddressIndex] = useState<number>(0);
  const savedAddresses = [
    {
      id: 'addr-1',
      label: 'Apartemen',
      title: 'Apartemen Sudirman Park',
      detail: 'Tower B No. 1402, Jl. KH Mas Mansyur, Jakarta Pusat',
      icon: Building2,
    },
    {
      id: 'addr-2',
      label: 'Rumah',
      title: 'Rumah Menteng',
      detail: 'Jl. Teuku Cik Ditiro No. 18, Menteng, Jakarta Pusat',
      icon: Home,
    },
  ];

  const [customerName, setCustomerName] = useState<string>('Nikolas Marcellino');
  const [customerPhone, setCustomerPhone] = useState<string>('0813-8899-0011');
  const [customerAddress, setCustomerAddress] = useState<string>(savedAddresses[0].detail);
  const [pickupSlot, setPickupSlot] = useState<string>('Sekarang (30 Menit)');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];
  const isKiloan = currentService.category === 'kiloan';

  // Filter services by active tab
  const filteredServices = services.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'kiloan') return s.category === 'kiloan';
    if (selectedCategory === 'satuan') return s.category === 'satuan' && !s.id.includes('tas') && !s.id.includes('sepatu');
    if (selectedCategory === 'sepatu_tas') return s.id.includes('tas') || s.id.includes('sepatu');
    return true;
  });

  // Calculate pricing
  const baseRate = currentService.basePrice;
  const itemsTotal = isKiloan ? baseRate * weightKg : baseRate * quantity;
  const expressFee = isExpress ? Math.round(itemsTotal * 0.4) : 0;
  const deliveryFee = 10000;
  const discount = isExpress ? 0 : 5000;
  const grandTotal = Math.max(0, itemsTotal + expressFee + deliveryFee - discount);

  const handleSelectSavedAddress = (index: number) => {
    setSelectedSavedAddressIndex(index);
    if (savedAddresses[index]) {
      setCustomerAddress(savedAddresses[index].detail);
    }
  };

  const handleSubmitBooking = () => {
    const itemEntry: OrderItem = {
      id: `item-${Date.now()}`,
      name: currentService.name,
      category: currentService.category === 'kiloan' ? 'kiloan' : (currentService.id.includes('tas') ? 'tas' : currentService.id.includes('sepatu') ? 'sepatu' : 'pakaian'),
      quantity: isKiloan ? 1 : quantity,
      unitPrice: itemsTotal + expressFee,
      notes: isKiloan ? `Estimasi ${weightKg} kg (${pickupSlot})` : `${quantity} item (${pickupSlot})`,
    };

    const newOrder = createCustomerOrder({
      customerName,
      customerPhone,
      customerAddress,
      serviceType: currentService.id,
      serviceName: currentService.name,
      perfumeAroma: selectedPerfume,
      specialInstructions: specialInstructions ? `${specialInstructions} [Jadwal Jemput: ${pickupSlot}]` : `[Jadwal Jemput: ${pickupSlot}]`,
      isExpress,
      totalWeightKg: isKiloan ? weightKg : undefined,
      paymentMethod,
      items: [itemEntry],
    });

    setCreatedOrderId(newOrder.id);
    setCreatedOrderNumber(newOrder.orderNumber);
    setStep('success');
  };

  const handleResetAndClose = () => {
    setStep('service');
    onClose();
  };

  const handleViewLiveTracking = () => {
    if (onOrderCompleted && createdOrderId) {
      onOrderCompleted(createdOrderId);
    }
    handleResetAndClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md bg-[#FAF9F6] border border-[#E2DFD7] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#2B2B28]"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#E2DFD7] flex items-center justify-between bg-white/80 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1F7A6C]/10 text-[#1F7A6C] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F2B705]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2B2B28] text-sm">Pesan Laundry</h3>
                <p className="text-[10px] text-[#6E6B65]">Antar jemput langsung ke alamat Anda</p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-7 h-7 rounded-full bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#6E6B65] hover:text-[#2B2B28] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {step !== 'success' && (
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#E2DFD7] bg-[#EFEDE7]/70 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  step === 'service' ? 'bg-[#1F7A6C] text-white' : 'bg-[#4C9A5B]/20 text-[#4C9A5B]'
                }`}>
                  {step === 'service' ? '1' : <Check className="w-3 h-3" />}
                </span>
                <span className={step === 'service' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65]'}>Layanan</span>
              </div>

              <div className="h-0.5 w-6 bg-[#E2DFD7]" />

              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  step === 'schedule' ? 'bg-[#1F7A6C] text-white' : step === 'payment' ? 'bg-[#4C9A5B]/20 text-[#4C9A5B]' : 'bg-[#E2DFD7] text-[#6E6B65]'
                }`}>
                  {step === 'payment' ? <Check className="w-3 h-3" /> : '2'}
                </span>
                <span className={step === 'schedule' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65]'}>Alamat & Jam</span>
              </div>

              <div className="h-0.5 w-6 bg-[#E2DFD7]" />

              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  step === 'payment' ? 'bg-[#1F7A6C] text-white' : 'bg-[#E2DFD7] text-[#6E6B65]'
                }`}>
                  3
                </span>
                <span className={step === 'payment' ? 'text-[#1F7A6C] font-bold' : 'text-[#6E6B65]'}>Bayar</span>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-[#E2DFD7]">
            {/* STEP 1: SERVICE & PERFUME */}
            {step === 'service' && (
              <div className="space-y-3.5">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'kiloan', label: 'Cucian Kiloan' },
                    { id: 'satuan', label: 'Pakaian Satuan' },
                    { id: 'sepatu_tas', label: 'Sepatu & Tas' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#1F7A6C] text-white shadow-sm'
                          : 'bg-white text-[#6E6B65] border border-[#E2DFD7] hover:text-[#2B2B28]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Service Cards */}
                <div className="space-y-2">
                  {filteredServices.map(srv => {
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#1F7A6C]/10 border-[#1F7A6C] shadow-sm ring-1 ring-[#1F7A6C]/30'
                            : 'bg-white border-[#E2DFD7] hover:border-[#9C9890]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#2B2B28]">{srv.name}</span>
                            {srv.popular && (
                              <span className="bg-[#F2B705]/25 text-[#8C6600] text-[9px] font-bold px-1.5 py-0.2 rounded">
                                FAVORIT
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6E6B65] mt-0.5 line-clamp-1">{srv.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                            <span className="text-[#134F45] font-bold">{formatRupiah(srv.basePrice)} / {srv.unit.split(' ')[0]}</span>
                            <span className="text-[#6E6B65] flex items-center gap-1 text-[10px]">
                              <Clock className="w-2.5 h-2.5 text-[#1F7A6C]" /> {srv.estimatedDurationHours} Jam Selesai
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#1F7A6C] bg-[#1F7A6C] text-white' : 'border-[#E2DFD7] bg-[#EFEDE7]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Amount / Weight Stepper with Presets */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2B2B28] block">
                        {isKiloan ? 'Perkiraan Berat Cucian' : 'Jumlah Pakaian / Item'}
                      </span>
                      <span className="text-[10px] text-[#6E6B65]">
                        {isKiloan ? 'Ditimbang presisi kembali di workshop' : 'Dihitung per satuan saat kurir ambil'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => (isKiloan ? setWeightKg(Math.max(1, weightKg - 1)) : setQuantity(Math.max(1, quantity - 1)))}
                        className="w-8 h-8 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-bold text-base flex items-center justify-center active:scale-95 transition-transform"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-[#2B2B28] w-12 text-center">
                        {isKiloan ? `${weightKg} Kg` : `${quantity} Pcs`}
                      </span>
                      <button
                        type="button"
                        onClick={() => (isKiloan ? setWeightKg(weightKg + 1) : setQuantity(quantity + 1))}
                        className="w-8 h-8 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-bold text-base flex items-center justify-center active:scale-95 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {isKiloan ? (
                      [3, 5, 7, 10].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setWeightKg(val)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                            weightKg === val ? 'bg-[#1F7A6C]/20 text-[#134F45] border border-[#1F7A6C]/40 font-bold' : 'bg-[#EFEDE7] text-[#6E6B65] hover:bg-[#E2DFD7]'
                          }`}
                        >
                          {val} Kg
                        </button>
                      ))
                    ) : (
                      [1, 2, 3, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setQuantity(val)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                            quantity === val ? 'bg-[#1F7A6C]/20 text-[#134F45] border border-[#1F7A6C]/40 font-bold' : 'bg-[#EFEDE7] text-[#6E6B65] hover:bg-[#E2DFD7]'
                          }`}
                        >
                          {val} Pcs
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Perfume Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2B2B28] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F2B705]" />
                      <span>Pilihan Aroma Parfum (Gratis)</span>
                    </span>
                    <span className="text-[10px] text-[#1F7A6C] font-medium">Tahan 14 Hari</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {perfumes.map(p => {
                      const isChosen = selectedPerfume === p.name;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPerfume(p.name)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChosen
                              ? 'bg-[#1F7A6C]/15 border-[#1F7A6C] text-[#2B2B28] shadow-sm'
                              : 'bg-white border-[#E2DFD7] text-[#6E6B65] hover:border-[#9C9890]'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-[#134F45] flex items-center justify-between">
                            <span>{p.name.split('(')[0]}</span>
                            {isChosen && <Check className="w-3 h-3 text-[#1F7A6C]" />}
                          </div>
                          <div className="text-[9px] text-[#6E6B65] mt-0.5 truncate">{p.notes}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Express 24-Hour Upgrade Switch */}
                <div
                  onClick={() => setIsExpress(!isExpress)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    isExpress
                      ? 'bg-[#F2B705]/20 border-[#F2B705] shadow-sm'
                      : 'bg-white border-[#E2DFD7] hover:border-[#9C9890]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F2B705]/30 text-[#8C6600] flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2B2B28]">Layanan Kilat Express (24 Jam Selesai)</div>
                      <div className="text-[10px] text-[#6E6B65]">Prioritas antrian mesin cuci pertama</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isExpress ? 'border-[#F2B705] bg-[#F2B705] text-[#2B2B28]' : 'border-[#E2DFD7]'
                  }`}>
                    {isExpress && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADDRESS & TIME SLOT */}
            {step === 'schedule' && (
              <div className="space-y-3.5">
                {/* Quick Saved Address Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2B2B28] block">
                    Pilih Alamat Penjemputan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {savedAddresses.map((addr, idx) => {
                      const isSel = selectedSavedAddressIndex === idx;
                      const Icon = addr.icon;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(idx)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSel
                              ? 'bg-[#1F7A6C]/15 border-[#1F7A6C] text-[#2B2B28]'
                              : 'bg-white border-[#E2DFD7] text-[#6E6B65] hover:border-[#9C9890]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2B28]">
                            <Icon className="w-3.5 h-3.5 text-[#1F7A6C]" />
                            <span>{addr.label}</span>
                          </div>
                          <div className="text-[10px] text-[#6E6B65] mt-1 line-clamp-1">{addr.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Full Address Details Textarea */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#2B2B28]">Detail Alamat Lengkap</span>
                    <span className="text-[#1F7A6C] flex items-center gap-1 font-mono text-[10px]">
                      <MapPin className="w-3 h-3" /> GPS Akurat
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-[#E2DFD7] rounded-xl px-3 py-2 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                    placeholder="Alamat lengkap, lantai/unit apartemen, patokan..."
                  />
                </div>

                {/* Recipient Phone & Name */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#2B2B28] block mb-1">
                      Nama Pemesan
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-[#E2DFD7] rounded-xl px-3 py-2 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#2B2B28] block mb-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-[#E2DFD7] rounded-xl px-3 py-2 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                    />
                  </div>
                </div>

                {/* Pickup Time Slot Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2B2B28] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1F7A6C]" />
                    <span>Jadwal Penjemputan Kurir</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Sekarang (30 Menit)', label: '⚡ Sekarang (30 Menit)', sub: 'Kurir langsung menuju lokasi' },
                      { id: 'Siang (13:00 - 15:00)', label: '☀️ Siang Ini', sub: '13:00 - 15:00 WIB' },
                      { id: 'Sore (17:00 - 19:00)', label: '🌙 Sore Ini', sub: '17:00 - 19:00 WIB' },
                      { id: 'Besok Pagi (09:00 - 11:00)', label: '📅 Besok Pagi', sub: '09:00 - 11:00 WIB' },
                    ].map(slot => {
                      const isPicked = pickupSlot === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setPickupSlot(slot.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isPicked
                              ? 'bg-[#1F7A6C]/15 border-[#1F7A6C] text-[#2B2B28] shadow-sm'
                              : 'bg-white border-[#E2DFD7] text-[#6E6B65] hover:border-[#9C9890]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#2B2B28]">{slot.label}</div>
                          <div className="text-[10px] text-[#6E6B65] mt-0.5">{slot.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-[11px] font-medium text-[#2B2B28] block mb-1">
                    Catatan untuk Tim Cuci / Kurir (Opsional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="w-full bg-white border border-[#E2DFD7] rounded-xl px-3 py-2 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
                    placeholder="Contoh: Pisahkan kemeja putih, jangan diperas kencang..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: ORDER SUMMARY & PAYMENT */}
            {step === 'payment' && (
              <div className="space-y-3.5">
                {/* Breakdown Receipt Box */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2B2B28] pb-1.5 border-b border-[#E2DFD7]">
                    <span>Ringkasan Pesanan</span>
                    <span className="text-[10px] text-[#1F7A6C] font-mono">{pickupSlot}</span>
                  </div>

                  <div className="flex justify-between text-xs text-[#6E6B65]">
                    <span>{currentService.name} ({isKiloan ? `${weightKg} Kg` : `${quantity} Item`})</span>
                    <span className="font-semibold text-[#2B2B28]">{formatRupiah(itemsTotal)}</span>
                  </div>

                  {isExpress && (
                    <div className="flex justify-between text-xs text-[#8C6600]">
                      <span>⚡ Upgrade Kilat 24 Jam</span>
                      <span className="font-semibold">+{formatRupiah(expressFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-[#6E6B65]">
                    <span>Ongkir Jemput & Antar</span>
                    <span className="font-semibold text-[#2B2B28]">{formatRupiah(deliveryFee)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-[#4C9A5B]">
                      <span>Diskon Kupon Pelanggan Baru</span>
                      <span className="font-semibold">-{formatRupiah(discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-[#E2DFD7] pt-2 flex justify-between items-center text-sm font-bold text-[#2B2B28]">
                    <span>Total Tagihan</span>
                    <span className="text-[#134F45] text-base">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Methods Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2B2B28] block">
                    Metode Pembayaran
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'qris', name: 'QRIS Instant (GoPay, OVO, Dana, BCA, Mandiri)', desc: 'Scan instan, tanpa biaya admin' },
                      { id: 'cash', name: 'Tunai / COD Saat Pengantaran', desc: 'Bayar langsung ke kurir saat cucian selesai' },
                      { id: 'transfer_bank', name: 'Virtual Account Bank (BCA / Mandiri / BRI)', desc: 'Verifikasi instan otomatis' },
                      { id: 'ewallet', name: 'ShopeePay / DANA Direct', desc: 'Langsung buka aplikasi dompet digital' },
                    ].map(pm => {
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#1F7A6C]/15 border-[#1F7A6C] text-[#2B2B28] shadow-sm'
                              : 'bg-white border-[#E2DFD7] text-[#6E6B65] hover:border-[#9C9890]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className={`w-4 h-4 ${isSelected ? 'text-[#1F7A6C]' : 'text-[#6E6B65]'}`} />
                            <div>
                              <div className="text-xs font-bold text-[#2B2B28]">{pm.name}</div>
                              <div className="text-[10px] text-[#6E6B65]">{pm.desc}</div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1F7A6C] bg-[#1F7A6C] text-white' : 'border-[#E2DFD7]'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#1F7A6C]/10 border border-[#1F7A6C]/25 p-2.5 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1F7A6C] shrink-0" />
                  <span className="text-[10px] text-[#134F45]">
                    Jaminan garansi cuci ulang 100% gratis jika hasil cucian belum bersih maksimal.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#4C9A5B]/20 text-[#4C9A5B] border border-[#4C9A5B]/30 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#2B2B28]">Pesanan Laundry Berhasil Dibuat!</h4>
                  <p className="text-xs text-[#6E6B65] mt-1">
                    Nomor Nota: <span className="font-mono font-bold text-[#1F7A6C]">{createdOrderNumber}</span>
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD7] text-left text-xs space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[#2B2B28] pb-1 border-b border-[#E2DFD7]">
                    <span className="text-[11px] text-[#6E6B65]">Jadwal Penjemputan:</span>
                    <span className="font-bold text-[#1F7A6C]">{pickupSlot}</span>
                  </div>
                  <div className="text-[11px] text-[#6E6B65]">
                    Kurir akan segera menuju alamat <span className="text-[#2B2B28] font-medium">{customerAddress.slice(0, 35)}...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-3.5 border-t border-[#E2DFD7] bg-white flex items-center justify-between gap-3">
            {step === 'service' && (
              <>
                <div>
                  <div className="text-[10px] text-[#6E6B65]">Estimasi Tagihan</div>
                  <div className="text-sm font-bold text-[#134F45]">{formatRupiah(grandTotal)}</div>
                </div>
                <button
                  onClick={() => setStep('schedule')}
                  className="px-5 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span>Atur Alamat & Waktu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'schedule' && (
              <>
                <button
                  onClick={() => setStep('service')}
                  className="px-3.5 py-2.5 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-semibold text-xs transition-colors border border-[#E2DFD7]"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="px-5 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'payment' && (
              <>
                <button
                  onClick={() => setStep('schedule')}
                  className="px-3.5 py-2.5 rounded-xl bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-semibold text-xs transition-colors border border-[#E2DFD7]"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmitBooking}
                  className="px-5 py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pesan Sekarang ({formatRupiah(grandTotal)})</span>
                </button>
              </>
            )}

            {step === 'success' && (
              <button
                onClick={handleViewLiveTracking}
                className="w-full py-2.5 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <span>Pantau Kurir & Status Cucian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
