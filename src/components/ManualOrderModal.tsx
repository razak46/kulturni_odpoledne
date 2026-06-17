import { useState } from 'react';

interface Props {
  onSave: (amount: number, note: string) => void;
  onClose: () => void;
}

export function ManualOrderModal({ onSave, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const valid = Number(amount) > 0;

  const handleSave = () => {
    if (!valid) return;
    onSave(Number(amount), note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Manuální objednávka</h2>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1">Částka (Kč)</label>
            <input
              type="number"
              min="1"
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="např. 148"
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[24px] font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1">Poznámka (volitelné)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="např. vinný lísteček, hotovost…"
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid}
            className="flex-1 bg-[#1A1A1A] text-white rounded-xl py-3 text-[14px] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
          >
            Zaevidovat
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-[#E8E8E8] text-[#6B6B6B] rounded-xl py-3 text-[14px]"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
