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
      if (!searchTerm.trim()) {
        return; // Don't trigger if empty
      }
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
        className={`min-h-[44px] w-full clay-input p-2 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
          isFocused
            ? 'ring-4 ring-blue-500/25 border-blue-500 bg-white'
            : 'hover:border-slate-400'
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
              className="clay-token inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-all animate-fadeIn shrink-0 select-none"
            >
              <span className="truncate max-w-[220px]">{label}</span>
              <button
                type="button"
                data-testid="item-delete-trigger"
                aria-label={`ลบ ${label}`}
                onClick={e => handleRemoveToken(e, item)}
                className="clay-token-delete-btn w-4 h-4 hover:bg-blue-300/60 flex items-center justify-center text-blue-800 hover:text-blue-950 cursor-pointer shrink-0"
              >
                <X className="w-3 h-3 stroke-[3]" />
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
          className="flex-1 min-w-[130px] bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none py-1 px-1 font-medium"
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
        <div className="flex flex-wrap gap-1.5 pt-1">
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
                className={`text-xs px-3 py-1.5 transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'clay-pill-active'
                    : 'clay-pill-inactive'
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
                      isSelected ? 'text-blue-100 font-normal' : 'text-slate-500 font-normal'
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
              className="clay-pill-inactive text-xs px-3 py-1.5 border-dashed border-blue-400 text-blue-700 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-1 cursor-pointer font-bold"
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
