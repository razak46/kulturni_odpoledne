import type { MenuItem } from '../types';

interface Props {
  item: MenuItem;
  qty: number;
  onTap: () => void;
  dimmed?: boolean;
}

export function ItemCard({ item, qty, onTap, dimmed }: Props) {
  return (
    <button
      onClick={onTap}
      className={`relative text-left w-full min-h-[72px] py-[14px] px-4 rounded-[10px] bg-white transition-all ${
        dimmed ? 'opacity-60' : 'active:scale-95'
      } ${qty > 0 && !dimmed ? 'border-2 border-[#1A1A1A]' : 'border border-[#E8E8E8]'}`}
    >
      {qty > 0 && (
        <span className="absolute top-2 right-2 bg-[#C8102E] text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold px-1">
          {qty}
        </span>
      )}
      <div className="pr-6">
        <div className="text-[15px] font-semibold text-[#1A1A1A] leading-tight">
          {item.name}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[13px] text-[#6B6B6B]">{item.size ?? ''}</span>
          <span className="text-[13px] font-semibold text-[#1A1A1A]">{item.price} Kč</span>
        </div>
      </div>
    </button>
  );
}
