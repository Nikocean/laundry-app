import React, { useState } from 'react';
import { Sparkles, Edit2, Check, Clock, ShieldCheck, Tag } from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { formatRupiah } from '../../utils/formatters';

export const AdminServicesPricing: React.FC = () => {
  const { services, updateServicePrice, perfumes } = useLaundry();
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  const startEdit = (id: string, currentPrice: number) => {
    setEditingServiceId(id);
    setEditingPrice(currentPrice);
  };

  const saveEdit = (id: string) => {
    updateServicePrice(id, editingPrice);
    setEditingServiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Services Price Table */}
      <div className="bg-white border border-[#E2DFD7] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#1F7A6C]" />
              <span>Daftar Layanan & Pengaturan Tarif Laundry</span>
            </h3>
            <p className="text-xs text-[#6E6B65]">Kelola harga kiloan, express, satuan pakaian, spa tas & sepatu</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEDE7] text-[#6E6B65] uppercase font-mono text-[11px] border-b border-[#E2DFD7]">
              <tr>
                <th className="py-3 px-4 font-bold">Nama Layanan</th>
                <th className="py-3 px-4 font-bold">Kategori</th>
                <th className="py-3 px-4 font-bold">Estimasi Pengerjaan</th>
                <th className="py-3 px-4 font-bold">Tarif Dasar (IDR)</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD7]">
              {services.map(srv => {
                const isEditing = editingServiceId === srv.id;
                return (
                  <tr key={srv.id} className="hover:bg-[#EFEDE7]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#2B2B28]">
                      <div>{srv.name}</div>
                      <div className="text-[11px] text-[#6E6B65] font-normal">{srv.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize bg-[#EFEDE7] text-[#2B2B28] px-2.5 py-0.5 rounded-full border border-[#E2DFD7] text-[10px] font-mono">
                        {srv.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#2B2B28]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#6E6B65]" />
                        <span>{srv.estimatedDurationHours} Jam</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#6E6B65]">Rp</span>
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={e => setEditingPrice(Number(e.target.value))}
                            className="w-24 bg-white border border-[#1F7A6C] rounded-lg px-2 py-1 text-[#2B2B28] font-bold"
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-[#1F7A6C]">{formatRupiah(srv.basePrice)} / {srv.unit}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(srv.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#4C9A5B] hover:bg-[#3D8049] text-white font-bold flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(srv.id, srv.basePrice)}
                          className="px-3 py-1.5 rounded-lg bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-semibold flex items-center gap-1 ml-auto transition-colors border border-[#E2DFD7]"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#1F7A6C]" />
                          <span>Ubah Tarif</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perfume Catalog Settings */}
      <div className="bg-white border border-[#E2DFD7] rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#2B2B28] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F2B705]" />
          <span>Katalog Aroma Parfum Premium Laundry</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {perfumes.map(p => (
            <div key={p.id} className="bg-[#EFEDE7] p-3.5 rounded-xl border border-[#E2DFD7] text-xs space-y-1">
              <div className="font-bold text-[#134F45]">🌸 {p.name}</div>
              <div className="text-[11px] text-[#6E6B65]">{p.notes}</div>
              <div className="text-[10px] text-[#4C9A5B] font-semibold pt-1">✓ Aktif di Aplikasi Customer & POS</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
