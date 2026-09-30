import React, { useState, useRef } from 'react';
import { X, Search, Check, Plus } from 'lucide-react';

export interface SelectOption {
  id: string;
  label: string;
  subtext?: string;
}

interface SearchableTokenMultiSelectProps {
  options: (string | SelectOption)[];
  selected: string[];
  onChange?: (selected: string[]) => void;
  onToggle: (item: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  showChipsList?: boolean;
  className?: string;
  tokenColorClass?: string;
  maxTokensInline?: number;
}

export const SearchableTokenMultiSelect: React.FC<SearchableTokenMultiSelectProps> = ({
  options,
  selected,
  onToggle,
  placeholder = 'เลือกหรือค้นหา...',
  searchPlaceholder = 'พิมพ์ค้นหา / เพิ่มตัวเลือก...',
  allowCustom = false,
  showChipsList = true,
  className = '',
  tokenColorClass = 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: SelectOption[] = options.map(opt =>
    typeof opt === 'string' ? { id: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(opt => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      opt.id.toLowerCase().includes(term) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(term))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        // Toggle the first matching filtered option
        const target = filteredOptions[0].id;
        if (!selected.includes(target)) {
          onToggle(target);
        }
        setSearchTerm('');
      } else if (allowCustom && searchTerm.trim()) {
        if (!selected.includes(searchTerm.trim())) {
          onToggle(searchTerm.trim());
        }
        setSearchTerm('');
      }
    } else if (e.key === 'Backspace' && !searchTerm && selected.length > 0) {
      // Remove last token when backspacing in empty input
      onToggle(selected[selected.length - 1]);
    }
  };

  const handleRemoveToken = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    onToggle(item);
    // Keep search input focused for fluid editing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Searchable input box with integrated removable selected tokens */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`min-h-[40px] w-full bg-white border rounded-lg p-1.5 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
          isFocused
            ? 'border-blue-500 ring-2 ring-blue-100 bg-white'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />

        {/* Selected Tokens (renderValue / tagRender) */}
        {selected.map(item => {
          const opt = normalizedOptions.find(o => o.id === item);
          const label = opt ? opt.label : item;
          return (
            <span
              key={item}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border transition-all animate-fadeIn shrink-0 select-none ${tokenColorClass}`}
            >
              <span className="truncate max-w-[220px]">{label}</span>
              <button
                type="button"
                data-testid="item-delete-trigger"
                aria-label={`ลบ ${label}`}
                onClick={e => handleRemoveToken(e, item)}
                className="w-3.5 h-3.5 rounded hover:bg-black/10 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors shrink-0"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </span>
          );
        })}

        {/* Integrated Search / Type Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : searchPlaceholder}
          className="flex-1 min-w-[130px] bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1 px-1"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setSearchTerm('');
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-1 text-xs shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick clickable choice pills / tokens */}
      {showChipsList && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {filteredOptions.map(opt => {
            const isSelected = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onToggle(opt.id);
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 stroke-[3] shrink-0" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <span>{opt.label}</span>
                {opt.subtext && (
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    ({opt.subtext})
                  </span>
                )}
              </button>
            );
          })}

          {allowCustom && searchTerm.trim() && !filteredOptions.some(o => o.id === searchTerm.trim()) && (
            <button
              type="button"
              onClick={() => {
                onToggle(searchTerm.trim());
                setSearchTerm('');
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-blue-400 text-blue-700 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่ม "{searchTerm.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
