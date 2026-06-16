import { useState } from 'react';
import type { Category } from './types';
import { useOrder } from './hooks/useOrder';
import { TabBar } from './components/TabBar';
import { MenuGrid } from './components/MenuGrid';
import { OrderPanel } from './components/OrderPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<Category>('piva');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total } = useOrder();

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-sans">
      {/* Desktop two-column layout */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '65%' }}>
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto">
            <MenuGrid activeTab={activeTab} getQty={getQty} onAddItem={addItem} />
          </div>
        </div>

        {/* Right column */}
        <div
          className="bg-white border-l border-[#E8E8E8] flex flex-col overflow-hidden"
          style={{ flexBasis: '35%' }}
        >
          <OrderPanel
            orderItems={orderItems}
            total={total}
            onAdjustQty={adjustQty}
            onRemove={removeItem}
            onReset={resetOrder}
          />
        </div>
      </div>

      {/* Mobile single-column layout */}
      <div className="md:hidden flex flex-col min-h-screen pb-16">
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
        <MenuGrid activeTab={activeTab} getQty={getQty} onAddItem={addItem} />
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E8E8E8] flex items-center justify-between px-4 z-20">
        <span className="text-[18px] font-bold text-[#1A1A1A]">Celkem: {total} Kč</span>
        <button
          onClick={() => setSheetOpen(true)}
          className="bg-[#1A1A1A] text-white rounded-[10px] px-[18px] py-[10px] text-[14px] font-medium"
        >
          Zobrazit objednávku
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
            style={{ height: '75vh', transition: 'transform 300ms ease' }}
          >
            <div className="h-full flex flex-col">
              <OrderPanel
                orderItems={orderItems}
                total={total}
                onAdjustQty={adjustQty}
                onRemove={removeItem}
                onReset={() => { resetOrder(); setSheetOpen(false); }}
                onClose={() => setSheetOpen(false)}
                isSheet
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
