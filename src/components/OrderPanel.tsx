import { useState } from 'react';
import type { OrderItem } from '../types';
import { ResetConfirm } from './ResetConfirm';

interface Props {
  orderItems: OrderItem[];
  total: number;
  onAdjustQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onClose?: () => void;
  isSheet?: boolean;
}

export function OrderPanel({
  orderItems,
  total,
  onAdjustQty,
  onRemove,
  onReset,
  onClose,
  isSheet = false,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    onReset();
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        {isSheet && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#E8E8E8] rounded-full" />
        )}
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#9B9B9B] font-medium">
          Objednávka
        </span>
        {isSheet && onClose && (
          <button onClick={onClose} className="text-[#9B9B9B] text-sm">
            Zavřít
          </button>
        )}
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto">
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
      <div className="border-t border-[#E8E8E8] px-5 py-4 shrink-0">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] font-medium">
          Celkem k zaplacení
        </div>
        <div className="text-[40px] font-extrabold text-[#1A1A1A] leading-tight">
          {total} Kč
        </div>

        {showConfirm ? (
          <ResetConfirm
            onConfirm={handleReset}
            onCancel={() => setShowConfirm(false)}
          />
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full h-11 mt-3 border-[1.5px] border-[#C8102E] bg-white text-[#C8102E] rounded-[10px] text-[14px] font-medium"
          >
            Resetovat objednávku
          </button>
        )}
      </div>
    </div>
  );
}
