import { useState, useEffect, useCallback } from 'react';

interface Props {
  onClose: () => void;
}

type Operator = '+' | '-' | '×' | '÷';

export function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [justEqualed, setJustEqualed] = useState(false);

  const compute = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
    }
  };

  const fmt = (val: string): string => {
    if (val.length <= 9) return val;
    const n = parseFloat(val);
    if (!isFinite(n)) return 'Chyba';
    if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-6 && n !== 0)) {
      return n.toExponential(3);
    }
    return parseFloat(n.toPrecision(9)).toString();
  };

  const inputDigit = useCallback((d: string) => {
    setJustEqualed(false);
    if (waiting || justEqualed) {
      setDisplay(d);
      setWaiting(false);
      setJustEqualed(false);
    } else {
      setDisplay(prev => prev === '0' ? d : prev.length >= 12 ? prev : prev + d);
    }
  }, [waiting, justEqualed]);

  const inputDecimal = useCallback(() => {
    setJustEqualed(false);
    if (waiting) {
      setDisplay('0.');
      setWaiting(false);
      return;
    }
    setDisplay(prev => prev.includes('.') ? prev : prev + '.');
  }, [waiting]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaiting(false);
    setJustEqualed(false);
  }, []);

  const backspace = useCallback(() => {
    if (waiting || justEqualed) return;
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, [waiting, justEqualed]);

  const toggleSign = useCallback(() => {
    setDisplay(prev => {
      const n = parseFloat(prev);
      return String(-n);
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  }, []);

  const handleOp = useCallback((op: Operator) => {
    const value = parseFloat(display);
    if (prevValue !== null && !waiting) {
      const result = compute(prevValue, value, operator!);
      const clean = parseFloat(result.toPrecision(12)).toString();
      setDisplay(clean);
      setPrevValue(parseFloat(clean));
    } else {
      setPrevValue(value);
    }
    setOperator(op);
    setWaiting(true);
    setJustEqualed(false);
  }, [display, prevValue, operator, waiting]);

  const handleEquals = useCallback(() => {
    if (prevValue === null || operator === null) return;
    const value = parseFloat(display);
    const result = compute(prevValue, value, operator);
    const clean = parseFloat(result.toPrecision(12)).toString();
    setDisplay(clean);
    setPrevValue(null);
    setOperator(null);
    setWaiting(false);
    setJustEqualed(true);
  }, [display, prevValue, operator]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') handleOp('+');
      else if (e.key === '-') handleOp('-');
      else if (e.key === '*') handleOp('×');
      else if (e.key === '/') { e.preventDefault(); handleOp('÷'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape') onClose();
      else if (e.key === 'c' || e.key === 'C') clear();
      else if (e.key === '%') percent();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputDigit, inputDecimal, handleOp, handleEquals, backspace, clear, percent, onClose]);

  const displayLen = fmt(display).length;
  const displaySize = displayLen > 10 ? 'text-[30px]' : displayLen > 7 ? 'text-[38px]' : 'text-[50px]';

  const OpBtn = ({ label, op }: { label: string; op: Operator }) => (
    <button
      onClick={() => handleOp(op)}
      className={`flex items-center justify-center rounded-[22px] text-[24px] font-semibold h-[70px] active:opacity-70 transition-all ${
        operator === op && waiting
          ? 'bg-white text-[#FF9F0A]'
          : 'bg-[#FF9F0A] text-white'
      }`}
    >
      {label}
    </button>
  );

  const FuncBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-[22px] text-[20px] font-semibold bg-[#3A3A3C] text-white active:opacity-70 h-[70px]"
    >
      {label}
    </button>
  );

  const NumBtn = ({ label, onClick, wide }: { label: string; onClick: () => void; wide?: boolean }) => (
    <button
      onClick={onClick}
      className={`flex items-center rounded-[22px] text-[24px] font-medium bg-[#2C2C2E] text-white active:opacity-70 h-[70px] ${
        wide ? 'col-span-2 pl-7' : 'justify-center'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1E] rounded-3xl w-full max-w-[320px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Display */}
        <div className="px-6 pt-8 pb-3 min-h-[130px] flex flex-col justify-end items-end">
          {prevValue !== null && (
            <div className="text-[#666] text-[15px] mb-1 tabular-nums h-5">
              {parseFloat(prevValue.toPrecision(12))} {operator}
            </div>
          )}
          <div className={`${displaySize} font-light text-white tabular-nums leading-none text-right break-all transition-all`}>
            {fmt(display)}
          </div>
        </div>

        {/* Button grid */}
        <div className="grid grid-cols-4 gap-[10px] p-4">
          <FuncBtn label="C" onClick={clear} />
          <FuncBtn label="±" onClick={toggleSign} />
          <FuncBtn label="%" onClick={percent} />
          <OpBtn label="÷" op="÷" />

          <NumBtn label="7" onClick={() => inputDigit('7')} />
          <NumBtn label="8" onClick={() => inputDigit('8')} />
          <NumBtn label="9" onClick={() => inputDigit('9')} />
          <OpBtn label="×" op="×" />

          <NumBtn label="4" onClick={() => inputDigit('4')} />
          <NumBtn label="5" onClick={() => inputDigit('5')} />
          <NumBtn label="6" onClick={() => inputDigit('6')} />
          <OpBtn label="−" op="-" />

          <NumBtn label="1" onClick={() => inputDigit('1')} />
          <NumBtn label="2" onClick={() => inputDigit('2')} />
          <NumBtn label="3" onClick={() => inputDigit('3')} />
          <OpBtn label="+" op="+" />

          {/* Bottom row */}
          <NumBtn label="0" onClick={() => inputDigit('0')} wide />
          <NumBtn label="." onClick={inputDecimal} />
          <button
            onClick={handleEquals}
            className="flex items-center justify-center rounded-[22px] text-[24px] font-semibold bg-[#FF9F0A] text-white active:opacity-70 h-[70px]"
          >
            =
          </button>
        </div>

        {/* Backspace + close */}
        <div className="flex items-center justify-between px-5 pb-5 pt-1">
          <button
            onClick={backspace}
            className="flex items-center gap-1 text-[13px] text-[#555] px-2 py-1 rounded-lg hover:text-[#888] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L1.5 8L6 13H14.5V3H6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M7.5 6L11.5 10M11.5 6L7.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>Smazat</span>
          </button>
          <button
            onClick={onClose}
            className="text-[13px] text-[#555] px-2 py-1 rounded-lg hover:text-[#888] transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
