import React from 'react';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { formatRupiah, formatShortDate, getStatusBadgeInfo } from '../../utils/formatters';

interface CustomerHistoryViewProps {
  onSelectOrder: (orderId: string) => void;
  onOpenReceipt: (orderId: string) => void;
}

export const CustomerHistoryView: React.FC<CustomerHistoryViewProps> = ({
  onSelectOrder,
  onOpenReceipt,
}) => {
  const { orders } = useLaundry();

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2B2B28]">Riwayat Pesanan Laundry</h3>
        <span className="text-xs text-[#6E6B65]">Total {orders.length} Transaksi</span>
      </div>

      <div className="space-y-3">
        {orders.map(order => {
          const statusInfo = getStatusBadgeInfo(order.status);
          return (
            <div
              key={order.id}
              className="bg-white border border-[#E2DFD7] hover:border-[#1F7A6C] rounded-2xl p-3.5 shadow-sm space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-[#1F7A6C]">{order.orderNumber}</span>
                  <div className="text-[11px] text-[#6E6B65]">{formatShortDate(order.createdAt)}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="text-xs font-semibold text-[#2B2B28]">
                {order.serviceName}
              </div>

              <div className="text-[11px] text-[#6E6B65] line-clamp-1">
                📍 {order.customerAddress}
              </div>

              <div className="border-t border-[#E2DFD7] pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#6E6B65]">Total: </span>
                  <span className="font-bold text-[#134F45]">{formatRupiah(order.totalPrice)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenReceipt(order.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#EFEDE7] hover:bg-[#E2DFD7] text-[#2B2B28] font-semibold text-[11px] flex items-center gap-1 transition-colors border border-[#E2DFD7]"
                  >
                    <FileText className="w-3 h-3 text-[#1F7A6C]" />
                    <span>Nota</span>
                  </button>
                  <button
                    onClick={() => onSelectOrder(order.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#1F7A6C] hover:bg-[#134F45] text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <span>Lacak</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
