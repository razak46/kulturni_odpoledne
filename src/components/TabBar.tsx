import type { Category } from '../types';
import type { ReactNode } from 'react';

const TABS: { id: Category; label: string }[] = [
  { id: 'piva',    label: 'Pivo & Limo' },
  { id: 'napoje',  label: 'Nápoje' },
  { id: 'alkohol', label: 'Alkohol' },
  { id: 'jidlo',   label: 'Jídlo' },
];

interface Props {
  activeTab: Category;
  onChange: (tab: Category) => void;
  rightSlot?: ReactNode;
}

export function TabBar({ activeTab, onChange, rightSlot }: Props) {
  return (
    <div className="flex items-center h-12">
      <div className="flex items-center gap-0.5 px-2 h-full">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#9B9B9B] hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {rightSlot && (
        <div className="flex items-center px-3 ml-auto shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
