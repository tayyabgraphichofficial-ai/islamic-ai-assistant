import React from 'react';
import { Delete, Space, CornerDownLeft, Trash2 } from 'lucide-react';

interface UrduKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter: () => void;
}

export default function UrduKeyboard({ onKeyPress, onBackspace, onClear, onEnter }: UrduKeyboardProps) {
  // Standard Urdu characters organized in logical typing rows
  const row1 = ["آ", "ا", "ب", "پ", "ت", "ٹ", "ث", "ج", "چ", "ح", "خ"];
  const row2 = ["د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ", "س", "ش", "ص", "ض"];
  const row3 = ["ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن"];
  const row4 = ["و", "ہ", "ھ", "ء", "ی", "ے", "۔", "؟", "،", "!"];

  const renderKey = (char: string) => (
    <button
      key={char}
      type="button"
      id={`key-${char}`}
      onClick={() => onKeyPress(char)}
      className="h-10 sm:h-12 flex-1 flex items-center justify-center font-urdu text-[16px] sm:text-[18px] text-gray-800 bg-white hover:bg-slate-100 active:bg-slate-200 rounded shadow-xs transition-all duration-150 select-none border border-slate-100"
    >
      {char}
    </button>
  );

  return (
    <div className="bg-slate-100/95 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-lg space-y-1.5 max-w-full" dir="rtl">
      {/* Row 1 */}
      <div className="flex gap-1 justify-center">
        {row1.map(renderKey)}
      </div>

      {/* Row 2 */}
      <div className="flex gap-1 justify-center">
        {row2.map(renderKey)}
      </div>

      {/* Row 3 */}
      <div className="flex gap-1 justify-center">
        {row3.map(renderKey)}
      </div>

      {/* Row 4 & Control Keys */}
      <div className="flex gap-1 justify-center">
        {row4.map(renderKey)}
      </div>

      {/* Spacing & Actions Row */}
      <div className="flex gap-1.5 h-10 sm:h-12">
        <button
          type="button"
          id="key-clear"
          onClick={onClear}
          className="px-2.5 sm:px-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 rounded flex items-center gap-1 text-xs font-semibold shadow-xs border border-rose-100 transition-colors"
          title="Clear everything"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">صاف کریں</span>
        </button>

        <button
          type="button"
          id="key-space"
          onClick={() => onKeyPress(' ')}
          className="flex-1 bg-white hover:bg-slate-100 active:bg-slate-200 rounded flex items-center justify-center gap-1.5 shadow-xs border border-slate-100 transition-colors"
        >
          <Space className="w-4 h-4 text-slate-400" />
          <span className="font-urdu text-sm text-slate-500">جگہ (اسپیس)</span>
        </button>

        <button
          type="button"
          id="key-backspace"
          onClick={onBackspace}
          className="px-3 sm:px-5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-700 rounded flex items-center justify-center shadow-xs border border-amber-100 transition-colors"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          type="button"
          id="key-submit"
          onClick={onEnter}
          className="px-3 sm:px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded flex items-center justify-center gap-1 text-xs font-bold shadow-xs transition-colors"
        >
          <CornerDownLeft className="w-5 h-5" />
          <span className="hidden sm:inline">پوچھیں</span>
        </button>
      </div>
    </div>
  );
}
