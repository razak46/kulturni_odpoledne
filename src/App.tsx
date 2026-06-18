import { useState, useCallback } from 'react';
import type { Category, MenuItem } from './types';
import { useOrder } from './hooks/useOrder';
import { useMenu } from './hooks/useMenu';
import { useLogo } from './hooks/useLogo';
import { useFullscreen } from './hooks/useFullscreen';
import { useFontScale } from './hooks/useFontScale';
import { useOrderHistory } from './hooks/useOrderHistory';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { TabBar } from './components/TabBar';
import { MenuGrid } from './components/MenuGrid';
import { AllCategoriesView } from './components/AllCategoriesView';
import { OrderPanel } from './components/OrderPanel';
import { AddItemModal } from './components/AddItemModal';
import { PayButton } from './components/PayButton';
import { LogoSlot } from './components/LogoSlot';
import { OrderHistoryView } from './components/OrderHistoryView';
import { ManualOrderModal } from './components/ManualOrderModal';
import { Calculator } from './components/Calculator';

type ViewMode = 'tabs' | 'all';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();

  // Show a blank screen while the session check is in flight
  if (authLoading) return <div className="min-h-screen bg-[#F8F8F8]" />;

  // Gate the whole app behind authentication
  if (!user) return <LoginScreen onLogin={login} />;

  return <PosApp onLogout={logout} />;
}

function PosApp({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Category>('piva');
  const [visibleSection, setVisibleSection] = useState<Category>('piva');
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addFormCategory, setAddFormCategory] = useState<Category | null>(null);
  const [showResetMenuConfirm, setShowResetMenuConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const scrollToSection = useCallback((cat: Category) => {
    document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const { logoUrl, uploadLogo, removeLogo } = useLogo();
  const { records, addRecord, deleteRecord, updateRecord, refresh: refreshOrders, refreshing: ordersRefreshing, lastRefreshed: ordersLastRefreshed } = useOrderHistory();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { zoomIn, zoomOut, canZoomIn, canZoomOut } = useFontScale();

  const { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total, itemCount } = useOrder();
  const { items, addMenuItem, removeMenuItem, updateMenuItem, resizeMenuItem, reorderMenuItems, resetMenu } = useMenu();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = editingItemId ? items.find(i => i.id === editingItemId) ?? null : null;

  const handleAddItem = (item: MenuItem, afterId: string) => addMenuItem(item, afterId);

  const handleDokoncit = (closeSheet = false) => {
    addRecord(
      orderItems.map(oi => ({ name: oi.menuItem.name, size: oi.menuItem.size, price: oi.menuItem.price, qty: oi.quantity })),
      total,
      false,
    );
    resetOrder();
    if (closeSheet) setSheetOpen(false);
  };

  const handleManualOrder = (amount: number, note: string) => {
    addRecord([], amount, true, note || undefined);
    setShowManual(false);
  };

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

  // Calculator button
  const calcBtn = (
    <button
      type="button"
      onClick={() => setShowCalc(true)}
      title="Kalkulačka"
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F0F0] border border-[#E8E8E8] text-[#1A1A1A] active:bg-[#E0E0E0]"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="3.5" y="3.5" width="2.5" height="1.8" rx="0.5" fill="currentColor"/>
        <rect x="6.25" y="3.5" width="2.5" height="1.8" rx="0.5" fill="currentColor"/>
        <rect x="9" y="3.5" width="2.5" height="1.8" rx="0.5" fill="currentColor"/>
        <rect x="3.5" y="6.5" width="2.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
        <rect x="6.25" y="6.5" width="2.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
        <rect x="9" y="6.5" width="2.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
        <rect x="3.5" y="9.2" width="2.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
        <rect x="6.25" y="9.2" width="2.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
        <rect x="9" y="9.2" width="2.5" height="1.5" rx="0.5" fill="currentColor"/>
      </svg>
    </button>
  );

  // History icon button
  const historyBtn = (
    <button
      type="button"
      onClick={() => setShowHistory(true)}
      title="Evidence objednávek"
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F0F0] border border-[#E8E8E8] text-[#1A1A1A] active:bg-[#E0E0E0]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="10" x2="7.5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </button>
  );

  const logoutBtn = (
    <button
      type="button"
      onClick={onLogout}
      title="Odhlásit se"
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F0F0] border border-[#E8E8E8] text-[#9B9B9B] active:bg-[#E0E0E0]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9.5 4.5L12 7l-2.5 2.5M12 7H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  // Controls group: view toggle + edit button — right side of top bar
  const topBarControls = (
    <div className="flex items-center gap-2 pr-3">
      {viewToggle}
      {editBtn}
      {calcBtn}
      {historyBtn}
      {fullscreenBtn}
      {logoutBtn}
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
    <div className="min-h-screen bg-[#EFEDE9] font-sans">

      {/* ── Desktop two-column layout (lg = 1024px, iPad landscape and larger) ── */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '65%' }}>
          {/* Top bar: logo + tabs + controls */}
          <div className="bg-white border-b border-[#EBEBEB] shadow-sm shrink-0 flex items-center">
            <div className="pl-3 shrink-0">
              <LogoSlot logoUrl={logoUrl} onUpload={uploadLogo} onRemove={removeLogo} editMode={editMode} />
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
        <div className="bg-white border-l border-[#EBEBEB] flex flex-col overflow-hidden" style={{ flexBasis: '35%' }}>
          <OrderPanel
            orderItems={orderItems}
            total={total}
            onAdjustQty={adjustQty}
            onRemove={removeItem}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
            onAddManual={() => setShowManual(true)}
          />
        </div>
      </div>

      {/* ── Mobile/tablet single-column layout (up to lg = 1024px, portrait iPad and phones) ── */}
      <div className="lg:hidden fixed inset-0 flex flex-col overflow-hidden" style={{ paddingBottom: 64 }}>
        {/* Top bar */}
        <div className="bg-white border-b border-[#EBEBEB] shadow-sm shrink-0 flex items-center z-10">
          <div className="pl-3 shrink-0">
            <LogoSlot logoUrl={logoUrl} onUpload={uploadLogo} onRemove={removeLogo} editMode={editMode} />
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

      {/* Mobile/tablet sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1A1A1A] border-t border-[#2A2A2A] flex items-center justify-between px-4 z-20">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#666] font-semibold leading-none mb-0.5">Celkem</div>
          <span className="text-[20px] font-extrabold text-white tabular-nums">{total} Kč</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="border border-[#333] text-[#888] rounded-xl px-3.5 py-2 text-[13px] font-medium hover:border-[#555] transition-colors"
          >
            + Manuální
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="bg-white text-[#1A1A1A] rounded-xl px-4 py-2 text-[14px] font-semibold active:scale-95 transition-transform"
          >
            Objednávka
          </button>
        </div>
      </div>

      {/* Mobile/tablet bottom sheet */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
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
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                canZoomIn={canZoomIn}
                canZoomOut={canZoomOut}
                onAddManual={() => { setSheetOpen(false); setShowManual(true); }}
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

      {/* Zaplatit FAB — always visible bottom-right */}
      <div className="hidden lg:block">
        <PayButton total={total} itemCount={itemCount} onPay={() => handleDokoncit()} bottomRem={1.5} />
      </div>
      <div className="lg:hidden">
        <PayButton total={total} itemCount={itemCount} onPay={() => handleDokoncit(true)} bottomRem={5} />
      </div>

      {/* Order history overlay */}
      {showHistory && (
        <OrderHistoryView
          records={records}
          menuItems={items}
          onClose={() => setShowHistory(false)}
          onAddManual={() => setShowManual(true)}
          onRefresh={refreshOrders}
          onDelete={deleteRecord}
          onUpdate={updateRecord}
          refreshing={ordersRefreshing}
          lastRefreshed={ordersLastRefreshed}
        />
      )}

      {/* Manual order modal */}
      {showManual && (
        <ManualOrderModal
          onSave={handleManualOrder}
          onClose={() => setShowManual(false)}
        />
      )}

      {/* Calculator */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </div>
  );
}
