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
      <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
        {isSheet && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#E8E8E8] rounded-full" />
        )}
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#9B9B9B] font-medium">
          Objednávka
        </span>
        <div className="flex items-center gap-1">
          {(onZoomOut || onZoomIn) && (
            <>
              <button
                onClick={onZoomOut}
                disabled={!canZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E8E8E8] text-[#1A1A1A] text-[15px] font-bold disabled:opacity-30"
                title="Zmenšit text"
              >
                A−
              </button>
              <button
                onClick={onZoomIn}
                disabled={!canZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E8E8E8] text-[#1A1A1A] text-[15px] font-bold disabled:opacity-30"
                title="Zvětšit text"
              >
                A+
              </button>
            </>
          )}
          {isSheet && onClose && (
            <button onClick={onClose} className="ml-1 text-[#9B9B9B] text-sm">
              Zavřít
            </button>
          )}
        </div>
      </div>

      {/* Order list — scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {orderItems.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-[14px] text-[#9B9B9B]">
            Zatím nic
          </div>
        ) : (
          orderItems.map(({ menuItem, quantity }) => (
            <div
              key={menuItem.id}
              className="flex items-center gap-2 px-5 py-[10px] border-b border-[#F0F0F0]"
            >
              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-[#1A1A1A] leading-tight">
                  {menuItem.name}
                </div>
                {menuItem.size && (
                  <div className="text-[12px] text-[#9B9B9B]">{menuItem.size}</div>
                )}
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onAdjustQty(menuItem.id, -1)}
                  className="w-8 h-8 border border-[#E8E8E8] rounded-lg text-[18px] text-[#1A1A1A] bg-white flex items-center justify-center leading-none"
                >
                  −
                </button>
                <span className="text-[16px] font-bold min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => onAdjustQty(menuItem.id, 1)}
                  className="w-8 h-8 border border-[#E8E8E8] rounded-lg text-[18px] text-[#1A1A1A] bg-white flex items-center justify-center leading-none"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="text-[14px] font-semibold text-[#1A1A1A] min-w-[52px] text-right shrink-0">
                {menuItem.price * quantity} Kč
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemove(menuItem.id)}
                className="w-7 h-7 flex items-center justify-center text-[#C8B0B0] text-[16px] shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Fixed bottom */}
      <div className="border-t border-[#E8E8E8] px-5 py-4 shrink-0 space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium">
            Celkem k zaplacení
          </div>
          <div className="text-[40px] font-extrabold text-[#1A1A1A] leading-tight">
            {total} Kč
          </div>
        </div>
        {onAddManual && (
          <button
            type="button"
            onClick={onAddManual}
            className="w-full border border-[#E8E8E8] rounded-xl py-2.5 text-[13px] font-medium text-[#9B9B9B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
          >
            + Manuální objednávka
          </button>
        )}
      </div>
    </div>
  );
}
