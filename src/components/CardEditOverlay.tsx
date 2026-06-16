import type { CardSize } from '../types';

const SIZES: CardSize[] = ['sm', 'md', 'lg'];

interface Props {
  itemId: string;
  cardSize: CardSize;
  onDelete: (id: string) => void;
  onResize: (id: string, delta: 1 | -1) => void;
  onEdit: (id: string) => void;
}

export function CardEditOverlay({ itemId, cardSize, onDelete, onResize, onEdit }: Props) {
  const idx = SIZES.indexOf(cardSize);
  const canShrink = idx > 0;
  const canGrow = idx < SIZES.length - 1;

  return (
    <>
      {/* Delete — top left */}
      <button
        onClick={() => onDelete(itemId)}
        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#C8102E] text-white text-[15px] flex items-center justify-center font-bold leading-none z-10"
      >
        ×
      </button>

      {/* Edit — top center */}
      <button
        onClick={() => onEdit(itemId)}
        className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[13px] flex items-center justify-center leading-none z-10"
        title="Upravit"
      >
        ✎
      </button>

      {/* Size controls — bottom right */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
        <button
          onClick={() => canShrink && onResize(itemId, -1)}
          className={`w-6 h-6 rounded-md border text-[11px] font-bold flex items-center justify-center leading-none transition-colors ${
            canShrink ? 'bg-white border-[#D0D0D0] text-[#1A1A1A]' : 'opacity-0 pointer-events-none'
          }`}
        >
          A−
        </button>
        <button
          onClick={() => canGrow && onResize(itemId, 1)}
          className={`w-6 h-6 rounded-md border text-[11px] font-bold flex items-center justify-center leading-none transition-colors ${
            canGrow ? 'bg-white border-[#D0D0D0] text-[#1A1A1A]' : 'opacity-0 pointer-events-none'
          }`}
        >
          A+
        </button>
      </div>
    </>
  );
}
