import { useState } from 'react';
import type { Category, MenuItem } from './types';
import { useOrder } from './hooks/useOrder';
import { useMenu } from './hooks/useMenu';
import { TabBar } from './components/TabBar';
import { MenuGrid } from './components/MenuGrid';
import { AllCategoriesView } from './components/AllCategoriesView';
import { OrderPanel } from './components/OrderPanel';
import { AddItemModal } from './components/AddItemModal';
import { PayButton } from './components/PayButton';

type ViewMode = 'tabs' | 'all';

export default function App() {
  const [activeTab, setActiveTab] = useState<Category>('piva');
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addFormCategory, setAddFormCategory] = useState<Category | null>(null);
  const [showResetMenuConfirm, setShowResetMenuConfirm] = useState(false);

  const { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total, itemCount } = useOrder();
  const { items, addMenuItem, removeMenuItem, resetMenu } = useMenu();

  const handleAddItem = (item: MenuItem, afterId: string) => addMenuItem(item, afterId);

  const handleResetMenu = () => {
    resetMenu();
    setShowResetMenuConfirm(false);
    setEditMode(false);
  };

  const toggleEdit = () => {
    setEditMode(e => !e);
    setShowResetMenuConfirm(false);
  };

  // Edit mode banner shown below the top bar
  const EditBar = () => (
    <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between shrink-0">
      <span className="text-[12px] text-white font-medium tracking-wide">Upravit nabídku</span>
      <div className="flex items-center gap-3">
        {showResetMenuConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-white/70">Obnovit výchozí nabídku?</span>
            <button onClick={handleResetMenu} className="text-[12px] bg-[#C8102E] text-white px-3 py-1 rounded-lg font-medium">
              Ano
            </button>
            <button onClick={() => setShowResetMenuConfirm(false)} className="text-[12px] text-white/60 px-2 py-1">
              Zpět
            </button>
          </div>
        ) : (
          <button onClick={() => setShowResetMenuConfirm(true)} className="text-[12px] text-white/60 underline">
            Obnovit výchozí
          </button>
        )}
      </div>
    </div>
  );

  // View mode toggle — rendered inline as rightSlot of TopBar
  const viewToggle = (
    <div className="flex items-center bg-[#F0F0F0] rounded-lg p-[3px]">
      <button
        onClick={() => setViewMode('tabs')}
        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
          viewMode === 'tabs' ? 'bg-white text-[#1A1A1A]' : 'text-[#9B9B9B]'
        }`}
      >
        Záložky
      </button>
      <button
        onClick={() => setViewMode('all')}
        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
          viewMode === 'all' ? 'bg-white text-[#1A1A1A]' : 'text-[#9B9B9B]'
        }`}
      >
        Vše
      </button>
    </div>
  );

  // Floating edit FAB — bottom-left
  const EditFab = () => (
    <button
      onClick={toggleEdit}
      className={`fixed bottom-6 left-4 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-[13px] font-semibold transition-colors ${
        editMode ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E8] text-[#6B6B6B]'
      }`}
    >
      <span className="text-[16px] leading-none">{editMode ? '✓' : '✎'}</span>
      <span>{editMode ? 'Hotovo' : 'Upravit nabídku'}</span>
    </button>
  );

  // Shared menu content depending on view mode
  const MenuContent = ({ topOffset = 0 }: { topOffset?: number }) => (
    viewMode === 'tabs' ? (
      <MenuGrid
        activeTab={activeTab}
        items={items}
        getQty={getQty}
        onAddItem={addItem}
        editMode={editMode}
        onDeleteItem={removeMenuItem}
        onOpenAddForm={() => setAddFormCategory(activeTab)}
      />
    ) : (
      <AllCategoriesView
        items={items}
        getQty={getQty}
        onAddItem={addItem}
        editMode={editMode}
        onDeleteItem={removeMenuItem}
        onOpenAddForm={(cat) => setAddFormCategory(cat as Category)}
        topOffset={topOffset}
      />
    )
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-sans">

      {/* ── Desktop two-column layout ── */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '65%' }}>
          {/* Sticky top bar */}
          <div className="bg-white border-b border-[#E8E8E8] shrink-0">
            {viewMode === 'tabs'
              ? <TabBar activeTab={activeTab} onChange={setActiveTab} rightSlot={viewToggle} />
              : (
                <div className="flex items-center">
                  <span className="flex-1 px-4 py-3 text-[13px] font-semibold text-[#1A1A1A]">Nabídka</span>
                  <div className="px-3 py-2">{viewToggle}</div>
                </div>
              )
            }
          </div>
          {editMode && <EditBar />}
          <div className="flex-1 overflow-y-auto">
            {/* topOffset: tab bar height (45px) + optional edit bar (36px) */}
            <MenuContent topOffset={editMode ? 81 : 45} />
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white border-l border-[#E8E8E8] flex flex-col overflow-hidden" style={{ flexBasis: '35%' }}>
          <OrderPanel
            orderItems={orderItems}
            total={total}
            onAdjustQty={adjustQty}
            onRemove={removeItem}
            onReset={resetOrder}
          />
        </div>
      </div>

      {/* ── Mobile single-column layout ── */}
      <div className="md:hidden flex flex-col min-h-screen pb-16">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E8E8] shrink-0">
          {viewMode === 'tabs'
            ? <TabBar activeTab={activeTab} onChange={setActiveTab} rightSlot={viewToggle} />
            : (
              <div className="flex items-center">
                <span className="flex-1 px-4 py-3 text-[13px] font-semibold text-[#1A1A1A]">Nabídka</span>
                <div className="px-3 py-2">{viewToggle}</div>
              </div>
            )
          }
        </div>
        {editMode && <EditBar />}
        <MenuContent topOffset={editMode ? 81 : 45} />
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
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
      {addFormCategory !== null && (
        <AddItemModal
          activeCategory={addFormCategory}
          allItems={items}
          onSave={handleAddItem}
          onClose={() => setAddFormCategory(null)}
        />
      )}

      {/* Edit FAB — always visible, bottom-left */}
      <EditFab />

      {/* Pay FAB — bottom-right, visible when order non-empty */}
      <div className="hidden md:block">
        <PayButton total={total} itemCount={itemCount} onPay={resetOrder} bottomOffset="bottom-6" />
      </div>
      <div className="md:hidden">
        <PayButton
          total={total}
          itemCount={itemCount}
          onPay={() => { resetOrder(); setSheetOpen(false); }}
          bottomOffset="bottom-20"
        />
      </div>
    </div>
  );
}
