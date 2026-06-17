import type { MenuItem, CardSize } from '../types';

const SIZE_STYLES: Record<CardSize, { minH: string; py: string; nameFont: string; priceFont: string }> = {
  sm: { minH: 'min-h-[52px]',  py: 'py-2 px-3',      nameFont: 'text-[13px]', priceFont: 'text-[13px]' },
  md: { minH: 'min-h-[72px]',  py: 'py-[14px] px-4', nameFont: 'text-[15px]', priceFont: 'text-[15px]' },
  lg: { minH: 'min-h-[96px]',  py: 'py-5 px-4',      nameFont: 'text-[17px]', priceFont: 'text-[17px]' },
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
  const selected = qty > 0 && !dimmed;
  return (
    <button
      onClick={onTap}
      style={{ backgroundColor: selected ? bgColor : bgColor }}
      className={`relative text-left w-full ${s.minH} ${s.py} rounded-xl transition-all ${
        dimmed ? 'opacity-50' : 'active:scale-[0.97]'
      } ${
        selected
          ? 'border-2 border-[#1A1A1A] shadow-md'
          : 'border border-[#E8E8E8] shadow-sm hover:border-[#C8C8C8]'
      }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 bg-[#C8102E] text-white rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-[11px] font-bold px-1 z-10 shadow-sm">
          {qty}
        </span>
      )}
      <div className="flex items-start justify-between gap-2 pr-7">
        <div className="flex-1 min-w-0">
          <span className={`${s.nameFont} font-semibold text-[#1A1A1A] leading-tight`}>
            {item.name}
          </span>
          {item.size && (
            <div className="text-[11px] text-[#888] mt-0.5 font-medium">{item.size}</div>
          )}
        </div>
        <span className={`${s.priceFont} font-bold tabular-nums shrink-0 ${selected ? 'text-[#1A1A1A]' : 'text-[#555]'}`}>
          {item.price} <span className="text-[0.75em] font-semibold">Kč</span>
        </span>
      </div>
    </button>
  );
}
