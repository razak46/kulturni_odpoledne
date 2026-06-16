import type { MenuItem, CardSize } from '../types';

const SIZE_STYLES: Record<CardSize, { minH: string; p: string; sizeFont: string }> = {
  sm: { minH: 'min-h-[88px]',  p: 'p-3', sizeFont: 'text-[22px]' },
  md: { minH: 'min-h-[130px]', p: 'p-4', sizeFont: 'text-[36px]' },
  lg: { minH: 'min-h-[170px]', p: 'p-5', sizeFont: 'text-[52px]' },
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
      className={`relative text-left w-full ${s.minH} ${s.p} rounded-xl transition-all ${
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
          <div className={`${s.sizeFont} font-extrabold text-[#1A1A1A] leading-tight`}>
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
