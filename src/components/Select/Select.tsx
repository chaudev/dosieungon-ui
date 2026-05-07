import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ReactNode,
  MouseEvent,
} from 'react';
import '../../styles/variables.css';
import './Select.css';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  group: string;
  options: SelectOption[];
}

export type SelectOptionOrGroup = SelectOption | SelectGroup;

function isGroup(item: SelectOptionOrGroup): item is SelectGroup {
  return 'group' in item && 'options' in item;
}

function flattenOptions(items: SelectOptionOrGroup[]): SelectOption[] {
  return items.flatMap((item: SelectOptionOrGroup) => (isGroup(item) ? item.options : [item]));
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps {
  /** Array of options or option groups */
  options: SelectOptionOrGroup[];
  /** Controlled value — string/number for single, array for multiple */
  value?: string | number | (string | number)[];
  /** Default value for uncontrolled usage */
  defaultValue?: string | number | (string | number)[];
  /** Called when selection changes */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** Enable multi-select */
  multiple?: boolean;
  /** Show search input inside dropdown */
  searchable?: boolean;
  /** Placeholder when no option is selected */
  placeholder?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Show a clear button when value is selected */
  clearable?: boolean;
  /** Label rendered above the trigger */
  label?: string;
  /** Mark label as required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Hint text below the select */
  hint?: string;
  /** Size preset */
  size?: SelectSize;
  /** Additional class on the root element */
  className?: string;
  /** Empty state message */
  emptyText?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = 'Select...',
  disabled = false,
  clearable = false,
  label,
  required = false,
  error,
  hint,
  size = 'md',
  className,
  emptyText = 'No options found',
}) => {
  // Internal value state for uncontrolled usage
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
    const init = valueProp ?? defaultValue;
    if (init == null) return [];
    return Array.isArray(init) ? init : [init];
  });

  const selectedValues: (string | number)[] = isControlled
    ? valueProp == null
      ? []
      : Array.isArray(valueProp)
      ? valueProp
      : [valueProp]
    : internalValue;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [dropdownAbove, setDropdownAbove] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allFlat = flattenOptions(options);

  // Filtered options
  const filteredOptions: SelectOptionOrGroup[] = searchable && search
    ? options.reduce<SelectOptionOrGroup[]>((acc, item) => {
        if (isGroup(item)) {
          const matched = item.options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase())
          );
          if (matched.length) acc.push({ group: item.group, options: matched });
        } else {
          if (item.label.toLowerCase().includes(search.toLowerCase())) acc.push(item);
        }
        return acc;
      }, [])
    : options;

  const filteredFlat = flattenOptions(filteredOptions);

  // Determine dropdown position
  const calcPosition = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setDropdownAbove(spaceBelow < 280 && spaceAbove > spaceBelow);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    calcPosition();
    setOpen(true);
    setSearch('');
    setHighlighted(-1);
    setTimeout(() => searchRef.current?.focus(), 10);
  }, [disabled, calcPosition]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch('');
    setHighlighted(-1);
    triggerRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;

      let newValues: (string | number)[];
      if (multiple) {
        const already = selectedValues.includes(option.value);
        newValues = already
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
      } else {
        newValues = [option.value];
        closeDropdown();
      }

      if (!isControlled) setInternalValue(newValues);
      onChange?.(multiple ? newValues : newValues[0]);
    },
    [multiple, selectedValues, isControlled, onChange, closeDropdown]
  );

  const removeChip = useCallback(
    (val: string | number, e: MouseEvent) => {
      e.stopPropagation();
      const newValues = selectedValues.filter((v) => v !== val);
      if (!isControlled) setInternalValue(newValues);
      onChange?.(multiple ? newValues : newValues[0]);
    },
    [selectedValues, isControlled, onChange, multiple]
  );

  const clearAll = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue([]);
      onChange?.(multiple ? [] : ('' as any));
    },
    [isControlled, onChange, multiple]
  );

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!open) {
          e.preventDefault();
          openDropdown();
        } else if (highlighted >= 0 && filteredFlat[highlighted]) {
          e.preventDefault();
          selectOption(filteredFlat[highlighted]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openDropdown();
        setHighlighted((h) => Math.min(h + 1, filteredFlat.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openDropdown();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Escape':
        closeDropdown();
        break;
      case 'Tab':
        if (open) closeDropdown();
        break;
    }
  };

  // Scroll highlighted into view
  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('.dsg-select__option');
    items[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  // Label lookup
  const getLabelForValue = (val: string | number) =>
    allFlat.find((o) => o.value === val)?.label ?? String(val);

  const hasValue = selectedValues.length > 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        'dsg-select',
        `dsg-select--${size}`,
        open && 'dsg-select--open',
        error && 'dsg-select--error',
        className
      )}
    >
      {label && (
        <span className={cn('dsg-select__label', required && 'dsg-select__label--required')}>
          {label}
        </span>
      )}

      <button
        ref={triggerRef}
        type="button"
        className="dsg-select__trigger"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Value display */}
        <span className="dsg-select__value">
          {!hasValue ? (
            <span className="dsg-select__placeholder">{placeholder}</span>
          ) : multiple ? (
            selectedValues.map((val) => (
              <span key={val} className="dsg-select__chip">
                <span className="dsg-select__chip-label">{getLabelForValue(val)}</span>
                <button
                  type="button"
                  className="dsg-select__chip-remove"
                  onClick={(e) => removeChip(val, e)}
                  aria-label={`Remove ${getLabelForValue(val)}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </span>
            ))
          ) : (
            <span className="dsg-select__single-value">
              {getLabelForValue(selectedValues[0])}
            </span>
          )}
        </span>

        {/* Right icons */}
        <span className="dsg-select__icons">
          {clearable && hasValue && (
            <span
              role="button"
              tabIndex={-1}
              className="dsg-select__clear"
              onClick={clearAll}
              aria-label="Clear selection"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          <span className="dsg-select__chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </span>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          'dsg-select__dropdown',
          dropdownAbove ? 'dsg-select__dropdown--above' : 'dsg-select__dropdown--below'
        )}
        role="listbox"
        aria-multiselectable={multiple}
      >
        {searchable && (
          <div className="dsg-select__search-wrapper">
            <input
              ref={searchRef}
              type="text"
              className="dsg-select__search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              aria-label="Search options"
            />
          </div>
        )}

        <div ref={listRef} className="dsg-select__list">
          {filteredFlat.length === 0 ? (
            <div className="dsg-select__empty">{emptyText}</div>
          ) : (
            filteredOptions.map((item, groupIdx) => {
              if (isGroup(item)) {
                return (
                  <div key={item.group}>
                    <div className="dsg-select__group-label">{item.group}</div>
                    {item.options.map((opt) => {
                      const flatIdx = filteredFlat.indexOf(opt);
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <OptionItem
                          key={opt.value}
                          option={opt}
                          selected={isSelected}
                          highlighted={highlighted === flatIdx}
                          multiple={multiple}
                          onSelect={selectOption}
                          onHighlight={() => setHighlighted(flatIdx)}
                        />
                      );
                    })}
                  </div>
                );
              }
              const flatIdx = filteredFlat.indexOf(item);
              const isSelected = selectedValues.includes(item.value);
              return (
                <OptionItem
                  key={item.value}
                  option={item}
                  selected={isSelected}
                  highlighted={highlighted === flatIdx}
                  multiple={multiple}
                  onSelect={selectOption}
                  onHighlight={() => setHighlighted(flatIdx)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Hint / error */}
      {error && <span className="dsg-select__error-msg">{error}</span>}
      {!error && hint && <span className="dsg-select__hint">{hint}</span>}
    </div>
  );
};

interface OptionItemProps {
  option: SelectOption;
  selected: boolean;
  highlighted: boolean;
  multiple: boolean;
  onSelect: (o: SelectOption) => void;
  onHighlight: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({
  option,
  selected,
  highlighted,
  multiple,
  onSelect,
  onHighlight,
}) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    aria-disabled={option.disabled}
    className={cn(
      'dsg-select__option',
      selected && 'dsg-select__option--selected',
      highlighted && 'dsg-select__option--highlighted',
      option.disabled && 'dsg-select__option--disabled'
    )}
    onClick={() => onSelect(option)}
    onMouseEnter={onHighlight}
    tabIndex={-1}
  >
    {multiple && (
      <span
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          border: `1.5px solid ${selected ? 'var(--dsg-primary)' : 'var(--dsg-border)'}`,
          borderRadius: 4,
          background: selected ? 'var(--dsg-primary)' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
        }}
        aria-hidden="true"
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    )}
    <span style={{ flex: 1, minWidth: 0 }}>{option.label}</span>
    {!multiple && selected && (
      <span className="dsg-select__option-check" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    )}
  </button>
);
