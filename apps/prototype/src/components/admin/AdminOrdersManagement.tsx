import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Bike,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { Order, OrderStatus } from '../../types/laundry';
import { formatRupiah, formatShortDate, getStatusBadgeInfo } from '../../utils/formatters';

interface AdminOrdersManagementProps {
  onOpenReceipt: (orderId: string) => void;
  onOpenPos: () => void;
}

export const AdminOrdersManagement: React.FC<AdminOrdersManagementProps> = ({
  onOpenReceipt,
  onOpenPos,
}) => {
  const { orders, couriers, updateOrderStatus, assignCourier } = useLaundry();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  // Status progression definitions
  const statusColumns: { key: OrderStatus; label: string; bg: string; border: string }[] = [
    { key: 'pending', label: 'Menunggu Konfirmasi', bg: 'bg-[#9C9890]/15', border: 'border-[#9C9890]/30' },
    { key: 'picked_up', label: 'Di Workshop Laundry', bg: 'bg-[#4A90A4]/15', border: 'border-[#4A90A4]/30' },
    { key: 'washing', label: 'Sedang Dicuci / Setrika', bg: 'bg-[#1F7A6C]/15', border: 'border-[#1F7A6C]/30' },
    { key: 'done', label: 'Selesai & Siap Antar', bg: 'bg-[#F2B705]/20', border: 'border-[#F2B705]/40' },
    { key: 'delivering', label: 'Sedang Diantar Kurir', bg: 'bg-[#E8873A]/15', border: 'border-[#E8873A]/30' },
    { key: 'delivered', label: 'Selesai / Diterima', bg: 'bg-[#4C9A5B]/15', border: 'border-[#4C9A5B]/30' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNextStatus = (order: Order) => {
    switch (order.status) {
      case 'pending':
        updateOrderStatus(order.id, 'picked_up', 'Admin Kasir', 'Barang tiba di workshop');
        break;
      case 'picked_up':
        updateOrderStatus(order.id, 'washing', 'Operator Cuci', 'Mulai proses pencucian');
        break;
      case 'washing':
        updateOrderStatus(order.id, 'done', 'QC Operator', 'Selesai disetrika & packing');
        break;
      case 'done':
        // Trigger assign courier modal
        setAssigningOrder(order);
        break;
      case 'delivering':
        updateOrderStatus(order.id, 'delivered', 'Admin Toko', 'Dikonfirmasi diterima pelanggan');
        break;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2DFD7] shadow-sm">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E6B65] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari no. order (LND-...), nama pelanggan, atau no. telepon..."
              className="w-full bg-[#EFEDE7] border border-[#E2DFD7] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2B2B28] placeholder-[#6E6B65] focus:outline-none focus:border-[#1F7A6C]"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="bg-[#EFEDE7] border border-[#E2DFD7] rounded-xl px-3 py-2 text-xs text-[#2B2B28] focus:outline-none focus:border-[#1F7A6C]"
          >
            <option value="all">Semua Status ({orders.length})</option>
            <option value="pending">Menunggu Konfirmasi</option>
            <option value="picked_up">Di Workshop</option>
            <option value="washing">Sedang Dicuci</option>
            <option value="done">Selesai Cuci (Siap Antar)</option>
            <option value="delivering">Sedang Diantar</option>
            <option value="delivered">Telah Diterima</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#EFEDE7] p-1 rounded-xl border border-[#E2DFD7] flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-[#1F7A6C] text-white shadow-sm' : 'text-[#6E6B65] hover:text-[#2B2B28]'
              }`}
            >
              Tabel Data
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-[#1F7A6C] text-white shadow-sm' : 'text-[#6E6B65] hover:text-[#2B2B28]'
              }`}
            >
              Kanban Board
            </button>
          </div>

          <button
            onClick={onOpenPos}
            className="px-4 py-2 rounded-xl bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Order Walk-in POS</span>
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#E2DFD7] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFEDE7] text-[#6E6B65] uppercase font-mono text-[11px] border-b border-[#E2DFD7]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">No. Order & Tgl</th>
                  <th className="py-3.5 px-4 font-bold">Pelanggan</th>
                  <th className="py-3.5 px-4 font-bold">Layanan & Parfum</th>
                  <th className="py-3.5 px-4 font-bold">Total (IDR)</th>
                  <th className="py-3.5 px-4 font-bold">Status Pesanan</th>
                  <th className="py-3.5 px-4 font-bold">Kurir Assigned</th>
                  <th className="py-3.5 px-4 font-bold text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DFD7]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#6E6B65]">
                      Tidak ada data pesanan yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(ord => {
                    const statusInfo = getStatusBadgeInfo(ord.status);
                    return (
                      <tr key={ord.id} className="hover:bg-[#EFEDE7]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-[#1F7A6C]">{ord.orderNumber}</div>
                          <div className="text-[10px] text-[#6E6B65] mt-0.5">{formatShortDate(ord.createdAt)}</div>
                          {ord.source === 'offline_pos' && (
                            <span className="text-[9px] bg-[#1F7A6C]/15 text-[#134F45] px-1 rounded font-semibold">Walk-in POS</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#2B2B28]">{ord.customerName}</div>
                          <div className="text-[11px] text-[#6E6B65]">{ord.customerPhone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[#2B2B28] font-medium">{ord.serviceName}</div>
                          <div className="text-[11px] text-[#1F7A6C] font-semibold">🌸 {ord.perfumeAroma}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#2B2B28]">{formatRupiah(ord.totalPrice)}</div>
                          <span className="text-[10px] text-[#6E6B65] uppercase font-mono">{ord.paymentMethod} • {ord.paymentStatus}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {ord.courierName ? (
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-3.5 h-3.5 text-[#1F7A6C]" />
                              <span className="text-[#134F45] font-semibold">{ord.courierName}</span>
                            </div>
                          ) : (
                            <span className="text-[#6E6B65] italic">Belum di-assign</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenReceipt(ord.id)}
                              className="p-1.5 rounded-lg bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] transition-colors"
                              title="Cetak Nota"
                            >
                              <FileText className="w-4 h-4 text-[#1F7A6C]" />
                            </button>

                            {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                              <button
                                onClick={() => handleNextStatus(ord)}
                                className="px-2.5 py-1 rounded-lg bg-[#1F7A6C] hover:bg-[#134F45] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                              >
                                {ord.status === 'pending' && <span>Terima & Jemput</span>}
                                {ord.status === 'picked_up' && <span>Mulai Cuci</span>}
                                {ord.status === 'washing' && <span>Selesai Cuci</span>}
                                {ord.status === 'done' && <span>Assign Kurir</span>}
                                {ord.status === 'delivering' && <span>Konfirmasi Tuntas</span>}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusColumns.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-white border border-[#E2DFD7] rounded-2xl p-3 flex flex-col min-h-[480px] shadow-sm"
              >
                <div className={`p-2.5 rounded-xl border ${col.bg} ${col.border} mb-3 flex items-center justify-between`}>
                  <span className="font-bold text-xs text-[#2B2B28]">{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-[#2B2B28] border border-[#E2DFD7] text-[10px] font-bold flex items-center justify-center">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colOrders.map(ord => (
                    <div
                      key={ord.id}
                      className="bg-[#EFEDE7] border border-[#E2DFD7] hover:border-[#1F7A6C] rounded-xl p-3 shadow-xs space-y-2 text-xs transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#1F7A6C] text-[11px]">{ord.orderNumber}</span>
                        <span className="text-[10px] text-[#6E6B65]">{formatShortDate(ord.createdAt).split(',')[1]}</span>
                      </div>

                      <div className="font-semibold text-[#2B2B28]">{ord.customerName}</div>
                      <div className="text-[11px] text-[#6E6B65] line-clamp-1">{ord.serviceName}</div>

                      <div className="border-t border-[#E2DFD7] pt-2 flex items-center justify-between">
                        <span className="font-bold text-[#2B2B28]">{formatRupiah(ord.totalPrice)}</span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="p-1 rounded bg-[#1F7A6C] hover:bg-[#134F45] text-white"
                          title="Lanjut Tahap Berikutnya"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Courier Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-[#E2DFD7] rounded-2xl shadow-xl p-5 space-y-4 text-[#2B2B28]">
            <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#1F7A6C]" />
                <h4 className="font-bold text-sm">Pilih Kurir Pengantar</h4>
              </div>
              <button
                onClick={() => setAssigningOrder(null)}
                className="text-[#6E6B65] hover:text-[#2B2B28]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#6E6B65]">
              Menugaskan kurir untuk pesanan <span className="font-bold text-[#1F7A6C]">{assigningOrder.orderNumber}</span> ({assigningOrder.customerName})
            </div>

            <div className="space-y-2">
              {couriers.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    assignCourier(assigningOrder.id, c.id);
                    setAssigningOrder(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    c.isAvailable
                      ? 'bg-[#EFEDE7] border-[#E2DFD7] hover:border-[#1F7A6C]'
                      : 'bg-[#FAF9F6] border-[#E2DFD7]/60 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-[#E2DFD7]" />
                    <div>
                      <div className="font-bold text-xs text-[#2B2B28]">{c.name}</div>
                      <div className="text-[10px] text-[#6E6B65]">{c.vehicle} • {c.plateNumber}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.isAvailable ? 'bg-[#4C9A5B]/20 text-[#4C9A5B]' : 'bg-[#E2DFD7] text-[#6E6B65]'}`}>
                      {c.isAvailable ? 'Siap Antar' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
