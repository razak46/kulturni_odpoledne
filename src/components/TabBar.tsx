import type { Category } from '../types';

const TABS: { id: Category; label: string }[] = [
  { id: 'piva',    label: 'Piva' },
  { id: 'napoje',  label: 'Nápoje' },
  { id: 'alkohol', label: 'Alkohol' },
  { id: 'jidlo',   label: 'Jídlo' },
];

interface Props {
  activeTab: Category;
  onChange: (tab: Category) => void;
}

export function TabBar({ activeTab, onChange }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#E8E8E8] flex">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-sm transition-colors ${
            activeTab === tab.id
              ? 'font-bold text-[#1A1A1A] border-b-2 border-[#C8102E]'
              : 'font-normal text-[#9B9B9B]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
