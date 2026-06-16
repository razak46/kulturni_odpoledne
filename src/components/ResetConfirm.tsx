interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div className="mt-3">
      <p className="text-[13px] text-[#1A1A1A] mb-2">
        Opravdu smazat celou objednávku?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="bg-[#C8102E] text-white rounded-lg px-4 py-2 text-[13px] font-medium"
        >
          Ano, smazat
        </button>
        <button
          onClick={onCancel}
          className="text-[#6B6B6B] px-4 py-2 text-[13px] bg-transparent"
        >
          Zpět
        </button>
      </div>
    </div>
  );
}
