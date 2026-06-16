import { useState, useCallback } from 'react';
import type { Category, MenuItem } from './types';
import { useOrder } from './hooks/useOrder';
import { useMenu } from './hooks/useMenu';
import { useLogo } from './hooks/useLogo';
import { useFullscreen } from './hooks/useFullscreen';
import { TabBar } from './components/TabBar';
import { MenuGrid } from './components/MenuGrid';
import { AllCategoriesView } from './components/AllCategoriesView';
import { OrderPanel } from './components/OrderPanel';
import { AddItemModal } from './components/AddItemModal';
import { PayButton } from './components/PayButton';
import { LogoSlot } from './components/LogoSlot';

type ViewMode = 'tabs' | 'all';

export default function App() {
  const [activeTab, setActiveTab] = useState<Category>('piva');
  const [visibleSection, setVisibleSection] = useState<Category>('piva');
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addFormCategory, setAddFormCategory] = useState<Category | null>(null);
  const [showResetMenuConfirm, setShowResetMenuConfirm] = useState(false);
  const scrollToSection = useCallback((cat: Category) => {
    document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const { logoUrl, uploadLogo, removeLogo } = useLogo();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total, itemCount } = useOrder();
  const { items, addMenuItem, removeMenuItem, updateMenuItem, resizeMenuItem, reorderMenuItems, resetMenu } = useMenu();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = editingItemId ? items.find(i => i.id === editingItemId) ?? null : null;

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
      <span className="text-[12px] text-white font-medium tracking-wide">Úprava nabídky — klepnutím na − odstraníte položku</span>
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

  // Edit toggle button — used in top bar
  const editBtn = (
    <button
      onClick={toggleEdit}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors whitespace-nowrap ${
        editMode
          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
          : 'bg-[#F0F0F0] text-[#1A1A1A] border-[#E8E8E8]'
      }`}
    >
      <span className="text-[14px] leading-none">{editMode ? '✓' : '✎'}</span>
      <span>{editMode ? 'Hotovo' : 'Upravit'}</span>
    </button>
  );

  // View mode toggle pill
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

  // Fullscreen toggle button
  const fullscreenBtn = (
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Zmenšit' : 'Celá obrazovka'}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F0F0] border border-[#E8E8E8] text-[#1A1A1A] active:bg-[#E0E0E0]"
    >
      {isFullscreen ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 1v4H1M9 1v4h4M5 13v-4H1M9 13v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );

  // Controls group: view toggle + edit button — right side of top bar
  const topBarControls = (
    <div className="flex items-center gap-2 pr-3">
      {viewToggle}
      {editBtn}
      {fullscreenBtn}
    </div>
  );

  // Menu content
  const MenuContent = () => (
    viewMode === 'tabs' ? (
      <MenuGrid
        activeTab={activeTab}
        items={items}
        getQty={getQty}
        onAddItem={addItem}
        editMode={editMode}
        onDeleteItem={removeMenuItem}
        onResizeItem={resizeMenuItem}
        onEditItem={setEditingItemId}
        onReorder={reorderMenuItems}
        onOpenAddForm={() => setAddFormCategory(activeTab)}
      />
    ) : (
      <AllCategoriesView
        items={items}
        getQty={getQty}
        onAddItem={addItem}
        editMode={editMode}
        onDeleteItem={removeMenuItem}
        onResizeItem={resizeMenuItem}
        onEditItem={setEditingItemId}
        onReorder={reorderMenuItems}
        onOpenAddForm={(cat) => setAddFormCategory(cat as Category)}
        onVisibleSection={setVisibleSection}
      />
    )
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-sans">

      {/* ── Desktop two-column layout ── */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '65%' }}>
          {/* Top bar: logo + tabs + controls */}
          <div className="bg-white border-b border-[#E8E8E8] shrink-0 flex items-center">
            <div className="pl-3 shrink-0">
              <LogoSlot logoUrl={logoUrl} onUpload={uploadLogo} onRemove={removeLogo} />
            </div>
            <div className="flex-1 min-w-0">
              <TabBar
                activeTab={viewMode === 'tabs' ? activeTab : visibleSection}
                onChange={viewMode === 'tabs' ? setActiveTab : scrollToSection}
                rightSlot={topBarControls}
              />
            </div>
          </div>
          {editMode && <EditBar />}
          <div className="flex-1 overflow-y-auto">
            <MenuContent />
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white border-l border-[#E8E8E8] flex flex-col overflow-hidden" style={{ flexBasis: '35%' }}>
          <OrderPanel
            orderItems={orderItems}
            total={total}
            onAdjustQty={adjustQty}
            onRemove={removeItem}
          />
        </div>
      </div>

      {/* ── Mobile single-column layout ── */}
      <div className="md:hidden flex flex-col min-h-screen pb-16">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E8E8] shrink-0 flex items-center">
          <div className="pl-3 shrink-0">
            <LogoSlot logoUrl={logoUrl} onUpload={uploadLogo} onRemove={removeLogo} />
          </div>
          <div className="flex-1 min-w-0">
            <TabBar
              activeTab={viewMode === 'tabs' ? activeTab : visibleSection}
              onChange={viewMode === 'tabs' ? setActiveTab : scrollToSection}
              rightSlot={topBarControls}
            />
          </div>
        </div>
        {editMode && <EditBar />}
        <MenuContent />
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
          mode="add"
          activeCategory={addFormCategory}
          allItems={items}
          onSave={handleAddItem}
          onClose={() => setAddFormCategory(null)}
        />
      )}

      {/* Edit item modal */}
      {editingItem !== null && (
        <AddItemModal
          mode="edit"
          editItem={editingItem}
          allItems={items}
          onUpdate={updateMenuItem}
          onClose={() => setEditingItemId(null)}
        />
      )}

      {/* Dokončit FAB — always visible bottom-right */}
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
