import type { MenuItem, CardSize } from '../types';

const SIZE_STYLES: Record<CardSize, { minH: string; py: string; font: string }> = {
  sm: { minH: 'min-h-[52px]',  py: 'py-2 px-3',      font: 'text-[13px]' },
  md: { minH: 'min-h-[72px]',  py: 'py-[14px] px-4', font: 'text-[15px]' },
  lg: { minH: 'min-h-[96px]',  py: 'py-5 px-4',      font: 'text-[17px]' },
};

interface Props {
  item: MenuItem;
  qty: number;
  onTap: () => void;
  dimmed?: boolean;
  bgColor?: string;
}

export function BeerCard({ item, qty, onTap, dimmed, bgColor = '#FFFFFF' }: Props) {
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
        <span className="absolute top-2 right-2 bg-[#C8102E] text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold px-1 z-10">
          {qty}
        </span>
      )}
      <div className="flex items-center justify-between gap-2 pr-6">
        <span className={`${s.font} font-semibold text-[#1A1A1A] leading-tight`}>
          {item.name}
          {item.size && <span className="font-bold text-[#C8102E]"> - {item.size}</span>}
        </span>
        <span className={`${s.font} font-bold text-[#1A1A1A] shrink-0`}>
          {item.price} Kč
        </span>
      </div>
    </button>
  );
}
