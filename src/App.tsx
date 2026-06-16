import { useState } from 'react';
import type { Category, MenuItem } from './types';
import { useOrder } from './hooks/useOrder';
import { useMenu } from './hooks/useMenu';
import { TabBar } from './components/TabBar';
import { MenuGrid } from './components/MenuGrid';
import { OrderPanel } from './components/OrderPanel';
import { AddItemModal } from './components/AddItemModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<Category>('piva');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [showResetMenuConfirm, setShowResetMenuConfirm] = useState(false);

  const { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total } = useOrder();
  const { items, addMenuItem, removeMenuItem, resetMenu } = useMenu();

  const handleAddItem = (item: MenuItem, afterId: string) => {
    addMenuItem(item, afterId);
  };

  const handleResetMenu = () => {
    resetMenu();
    setShowResetMenuConfirm(false);
    setEditMode(false);
  };

  const EditBar = () => (
    <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between">
      <span className="text-[12px] text-white font-medium tracking-wide">
        Upravit nabídku
      </span>
      <div className="flex items-center gap-3">
        {showResetMenuConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-white/70">Obnovit výchozí nabídku?</span>
            <button
              onClick={handleResetMenu}
              className="text-[12px] bg-[#C8102E] text-white px-3 py-1 rounded-lg font-medium"
            >
              Ano
            </button>
            <button
              onClick={() => setShowResetMenuConfirm(false)}
              className="text-[12px] text-white/60 px-2 py-1"
            >
              Zpět
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetMenuConfirm(true)}
            className="text-[12px] text-white/60 underline"
          >
            Obnovit výchozí
          </button>
        )}
        <button
          onClick={() => { setEditMode(false); setShowResetMenuConfirm(false); }}
          className="text-[12px] bg-white/20 text-white px-3 py-1 rounded-lg font-medium"
        >
          Hotovo
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-sans">
      {/* Desktop two-column layout */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '65%' }}>
          <div className="flex items-center border-b border-[#E8E8E8] bg-white">
            <div className="flex-1">
              <TabBar activeTab={activeTab} onChange={setActiveTab} />
            </div>
            <button
              onClick={() => setEditMode(e => !e)}
              className={`mr-3 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors shrink-0 ${
                editMode
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'border-[#E8E8E8] text-[#6B6B6B] bg-white'
              }`}
            >
              {editMode ? 'Hotovo' : 'Upravit'}
            </button>
          </div>
          {editMode && <EditBar />}
          <div className="flex-1 overflow-y-auto">
            <MenuGrid
              activeTab={activeTab}
              items={items}
              getQty={getQty}
              onAddItem={addItem}
              editMode={editMode}
              onDeleteItem={removeMenuItem}
              onOpenAddForm={() => setAddFormOpen(true)}
            />
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
        <div className="flex items-center bg-white border-b border-[#E8E8E8]">
          <div className="flex-1">
            <TabBar activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <button
            onClick={() => setEditMode(e => !e)}
            className={`mr-3 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors shrink-0 ${
              editMode
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'border-[#E8E8E8] text-[#6B6B6B] bg-white'
            }`}
          >
            {editMode ? 'Hotovo' : 'Upravit'}
          </button>
        </div>
        {editMode && <EditBar />}
        <MenuGrid
          activeTab={activeTab}
          items={items}
          getQty={getQty}
          onAddItem={addItem}
          editMode={editMode}
          onDeleteItem={removeMenuItem}
          onOpenAddForm={() => setAddFormOpen(true)}
        />
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
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

      {/* Add item modal */}
      {addFormOpen && (
        <AddItemModal
          activeCategory={activeTab}
          allItems={items}
          onSave={handleAddItem}
          onClose={() => setAddFormOpen(false)}
        />
      )}
    </div>
  );
}
