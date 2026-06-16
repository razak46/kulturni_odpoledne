import { useRef } from 'react';

interface Props {
  logoUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  editMode?: boolean;
}

export function LogoSlot({ logoUrl, onUpload, onRemove, editMode = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: 44, height: 44 }}>
      {editMode && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      )}

      <button
        type="button"
        onClick={editMode ? () => inputRef.current?.click() : undefined}
        title={editMode ? (logoUrl ? 'Změnit logo' : 'Přidat logo hospody') : undefined}
        className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center ${
          editMode ? 'transition-colors' : ''
        } ${
          logoUrl
            ? 'border-[#E8E8E8]'
            : editMode
              ? 'border-dashed border-[#D0D0D0] bg-[#F8F8F8] hover:border-[#9B9B9B]'
              : 'border-transparent bg-transparent'
        }`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <span className={`text-[18px] leading-none ${editMode ? 'text-[#C0C0C0]' : 'text-transparent'}`}>⌂</span>
        )}
      </button>

      {/* Remove button — only in edit mode when logo is set */}
      {editMode && logoUrl && (
        <button
          type="button"
          onClick={onRemove}
          title="Odebrat logo"
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8102E] text-white text-[9px] font-bold flex items-center justify-center leading-none z-10"
        >
          ×
        </button>
      )}
    </div>
  );
}
