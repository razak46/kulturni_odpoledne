import type { CategoryDef } from '../types';
import type { ReactNode } from 'react';

interface Props {
  categories: CategoryDef[];
  activeTab: string;
  onChange: (tab: string) => void;
  rightSlot?: ReactNode;
}

export function TabBar({ categories, activeTab, onChange, rightSlot }: Props) {
  return (
    <div className="no-scrollbar overflow-x-auto h-12 flex items-center">
      <div className="flex items-center gap-0.5 px-2 h-full shrink-0">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
              activeTab === cat.id
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#9B9B9B] hover:text-[#1A1A1A]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {rightSlot && (
        <div className="flex items-center pl-1 pr-3 shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
