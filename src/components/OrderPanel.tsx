import type { OrderItem } from '../types';

interface Props {
  orderItems: OrderItem[];
  total: number;
  onAdjustQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClose?: () => void;
  isSheet?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  onAddManual?: () => void;
}

export function OrderPanel({
  orderItems,
  total,
  onAdjustQty,
  onRemove,
  onClose,
  isSheet = false,
  onZoomIn,
  onZoomOut,
  canZoomIn = true,
  canZoomOut = true,
  onAddManual,
}: Props) {

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0 bg-white">
        {isSheet && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#E0E0E0] rounded-full" />
        )}
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#ADADAD] font-semibold">
          Aktuální objednávka
        </span>
        <div className="flex items-center gap-1">
          {(onZoomOut || onZoomIn) && (
            <>
              <button
                onClick={onZoomOut}
                disabled={!canZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#EBEBEB] text-[#555] text-[13px] font-bold disabled:opacity-30 hover:bg-[#F5F5F5]"
                title="Zmenšit text"
              >
                A−
              </button>
              <button
                onClick={onZoomIn}
                disabled={!canZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#EBEBEB] text-[#555] text-[13px] font-bold disabled:opacity-30 hover:bg-[#F5F5F5]"
                title="Zvětšit text"
              >
                A+
              </button>
            </>
          )}
          {isSheet && onClose && (
            <button onClick={onClose} className="ml-1 text-[13px] text-[#9B9B9B] font-medium px-1">
              Zavřít
            </button>
          )}
        </div>
      </div>

      {/* Order list — scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {orderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[80px] gap-1.5 pb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[#DCDCDC]">
              <rect x="4" y="6" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6V5a4 4 0 018 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 13h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[13px] text-[#C0C0C0] font-medium">Zatím nic</span>
          </div>
        ) : (
          orderItems.map(({ menuItem, quantity }) => (
            <div
              key={menuItem.id}
              className="flex items-center gap-2 px-4 py-[9px] border-b border-[#F5F5F5]"
            >
              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">
                  {menuItem.name}
                </div>
                {menuItem.size && (
                  <div className="text-[11px] text-[#ADADAD] font-medium mt-0.5">{menuItem.size}</div>
                )}
              </div>

              {/* Qty controls */}
              <div className="flex items-center shrink-0">
                <button
                  onClick={() => onAdjustQty(menuItem.id, -1)}
                  className="w-7 h-7 rounded-lg bg-[#F2F2F2] text-[#333] text-[18px] flex items-center justify-center leading-none active:bg-[#E5E5E5] transition-colors"
                >
                  −
                </button>
                <span className="text-[15px] font-bold min-w-[28px] text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => onAdjustQty(menuItem.id, 1)}
                  className="w-7 h-7 rounded-lg bg-[#F2F2F2] text-[#333] text-[18px] flex items-center justify-center leading-none active:bg-[#E5E5E5] transition-colors"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="text-[13px] font-bold text-[#1A1A1A] min-w-[48px] text-right shrink-0 tabular-nums">
                {menuItem.price * quantity} Kč
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemove(menuItem.id)}
                className="w-6 h-6 flex items-center justify-center text-[#D0C0C0] hover:text-[#C8102E] text-[18px] shrink-0 transition-colors"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Dark total section */}
      <div className="bg-[#1A1A1A] px-5 py-4 shrink-0 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#666] font-semibold mb-1">
            Celkem k zaplacení
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[42px] font-extrabold text-white leading-none tabular-nums">
              {total}
            </span>
            <span className="text-[20px] font-bold text-[#888] leading-none">Kč</span>
          </div>
        </div>
        {onAddManual && (
          <button
            type="button"
            onClick={onAddManual}
            className="w-full border border-[#2E2E2E] rounded-xl py-2.5 text-[13px] font-medium text-[#777] hover:border-[#444] hover:text-[#AAA] transition-colors"
          >
            + Manuální objednávka
          </button>
        )}
      </div>
    </div>
  );
}
