import type { Category } from '../types';
import type { ReactNode } from 'react';

const TABS: { id: Category; label: string }[] = [
  { id: 'piva',    label: 'Piva' },
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
    <div className="flex items-stretch">
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
      {rightSlot && (
        <div className="flex items-center px-3 shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
