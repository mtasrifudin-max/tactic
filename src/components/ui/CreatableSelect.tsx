import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Plus, Check, Search, X } from 'lucide-react';

export interface CreatableSelectOption {
  value: string;
  label: string;
  code?: string;
}

export interface CreatableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onCreateOption: (newValue: string) => void;
  options: CreatableSelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  label,
  value,
  onChange,
  onCreateOption,
  options,
  placeholder = 'Select or type to add...',
  required = false,
  error,
  helperText,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on query
  const trimmedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(trimmedQuery) || (opt.code && opt.code.toLowerCase().includes(trimmedQuery))
  );

  const exactMatchExists = options.some(
    opt => opt.label.trim().toLowerCase() === trimmedQuery
  );

  const canCreateNew = trimmedQuery.length > 0 && !exactMatchExists;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const handleCreate = () => {
    const newVal = query.trim();
    if (!newVal) return;
    onCreateOption(newVal);
    onChange(newVal);
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const totalItems = filteredOptions.length + (canCreateNew ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (canCreateNew && highlightedIndex === filteredOptions.length) {
        handleCreate();
      } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (canCreateNew) {
        handleCreate();
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const currentOption = options.find(o => o.value === value);

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#172B4D]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(prev => !prev);
              if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 50);
              }
            }
          }}
          className={`w-full text-xs bg-white border rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-all ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-slate-300'
          } ${
            error
              ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20'
              : isOpen
              ? 'border-[#0070C0] ring-2 ring-[#0070C0]/20'
              : 'border-slate-200'
          }`}
        >
          <span className={`truncate ${!value ? 'text-slate-400' : 'text-[#172B4D] font-medium'}`}>
            {currentOption ? currentOption.label : value || placeholder}
          </span>

          <div className="flex items-center gap-1 shrink-0 ml-2 text-slate-400">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-0.5 hover:text-slate-600 rounded transition-colors"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#0070C0]' : ''}`} />
          </div>
        </div>

        {/* Dropdown Menu Overlay */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs animate-in fade-in-50 zoom-in-95 duration-100 max-h-64 flex flex-col">
            {/* Search / Inline Filter Box */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-1.5 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full text-xs bg-transparent focus:outline-none text-[#172B4D]"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-48 divide-y divide-slate-50 p-1">
              {filteredOptions.length === 0 && !canCreateNew && (
                <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
                  Tidak ada opsi yang cocok.
                </div>
              )}

              {filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#0070C0] font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 text-[#172B4D]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.code && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                          {opt.code}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0070C0] shrink-0" />}
                  </div>
                );
              })}

              {/* Inline Add / Create Option Row */}
              {canCreateNew && (
                <div
                  onClick={handleCreate}
                  className={`mt-1 p-2 rounded-lg bg-blue-50/70 border border-dashed border-blue-200 text-[#0070C0] hover:bg-blue-100/70 cursor-pointer flex items-center gap-2 font-medium transition-colors ${
                    highlightedIndex === filteredOptions.length ? 'ring-2 ring-[#0070C0]/30' : ''
                  }`}
                >
                  <div className="w-5 h-5 rounded-md bg-[#0070C0] text-white flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] text-slate-500">Tambah baru: </span>
                    <strong className="text-[#0070C0]">"{query.trim()}"</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
};
