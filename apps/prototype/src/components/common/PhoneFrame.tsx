import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  deviceColor?: 'indigo' | 'cyan' | 'slate';
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  title = 'Flutter Mobile App',
  badge = 'Mobile Simulation',
  deviceColor = 'indigo',
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Device Label / Header Tag */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-[#2B2B28]">{title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
          deviceColor === 'cyan' ? 'bg-[#4A90A4]/15 text-[#2D6574] border border-[#4A90A4]/30' : 'bg-[#1F7A6C]/15 text-[#134F45] border border-[#1F7A6C]/30'
        }`}>
          {badge}
        </span>
      </div>

      {/* Realistic Smartphone Hardware Bezel */}
      <div className="w-[375px] h-[740px] max-w-full bg-[#2B2B28] rounded-[44px] p-3 shadow-2xl ring-1 ring-[#3E3E3A] border-4 border-[#3E3E3A] flex flex-col relative overflow-hidden">
        {/* Dynamic Island / Speaker Notch Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between w-[320px] px-3 text-[11px] text-[#2B2B28] font-mono">
          <span className="font-bold">09:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-24 h-4 bg-[#1F1F1D] rounded-full border border-[#3E3E3A] flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2B2B28]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#1F7A6C]" />
          </div>
          <div className="flex items-center gap-1 text-[#2B2B28]">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content Window */}
        <div className="flex-1 rounded-[34px] overflow-hidden bg-[#FAF9F6] text-[#2B2B28] flex flex-col pt-7 relative border border-[#E2DFD7]">
          {children}

          {/* iOS / Android Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#2B2B28]/30 rounded-full pointer-events-none z-50" />
        </div>
      </div>
    </div>
  );
};
