import type { MenuItem, CardSize } from '../types';

const SIZE_STYLES: Record<CardSize, { minH: string; py: string; nameFont: string }> = {
  sm: { minH: 'min-h-[52px]',  py: 'py-2 px-3',        nameFont: 'text-[13px]' },
  md: { minH: 'min-h-[72px]',  py: 'py-[14px] px-4',   nameFont: 'text-[15px]' },
  lg: { minH: 'min-h-[96px]',  py: 'py-5 px-4',        nameFont: 'text-[17px]' },
};

interface Props {
  item: MenuItem;
  qty: number;
  onTap: () => void;
  dimmed?: boolean;
  bgColor?: string;
}

export function ItemCard({ item, qty, onTap, dimmed, bgColor = '#FFFFFF' }: Props) {
  const s = SIZE_STYLES[item.cardSize ?? 'md'];

  return (
    <button
      onClick={onTap}
      style={{ backgroundColor: bgColor }}
      className={`relative text-left w-full ${s.minH} ${s.py} rounded-[10px] transition-all ${
        dimmed ? 'opacity-60' : 'active:scale-95'
      } ${qty > 0 && !dimmed ? 'border-2 border-[#1A1A1A]' : 'border border-[#E8E8E8]'}`}
    >
      {qty > 0 && (
        <span className="absolute top-2 right-2 bg-[#C8102E] text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold px-1">
          {qty}
        </span>
      )}
      <div className="pr-6">
        <div className={`${s.nameFont} font-semibold text-[#1A1A1A] leading-tight`}>
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
