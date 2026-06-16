import type { MenuItem } from '../types';

interface Props {
  item: MenuItem;
  qty: number;
  onTap: () => void;
  dimmed?: boolean;
  bgColor?: string;
}

export function BeerCard({ item, qty, onTap, dimmed, bgColor = '#FFFFFF' }: Props) {
  return (
    <button
      onClick={onTap}
      style={{ backgroundColor: bgColor }}
      className={`relative text-left w-full min-h-[130px] p-4 rounded-xl transition-all ${
        dimmed ? 'opacity-60' : 'active:scale-95'
      } ${qty > 0 && !dimmed ? 'border-2 border-[#1A1A1A]' : 'border border-[#E8E8E8]'}`}
    >
      {qty > 0 && (
        <span className="absolute top-2 right-2 bg-[#C8102E] text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold px-1">
          {qty}
        </span>
      )}
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="text-[36px] font-extrabold text-[#1A1A1A] leading-tight">
            {item.size}
          </div>
          <div className="text-base font-bold text-[#1A1A1A] mt-1">
            {item.name}
          </div>
        </div>
        <div className="text-base font-bold text-[#1A1A1A] mt-3 text-right">
          {item.price} Kč
        </div>
      </div>
    </button>
  );
}
