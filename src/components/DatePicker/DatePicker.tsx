import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './DatePicker.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

// ── Types ──────────────────────────────────────────────────────────────────

export type DatePickerSize = 'sm' | 'md' | 'lg';
type PanelView = 'date' | 'month' | 'year';

export interface DatePickerLocale {
  /** 12 full month names — used in the header and month-picker grid */
  months: [string,string,string,string,string,string,string,string,string,string,string,string];
  /** 12 abbreviated month names — used in the month-picker grid cells.
   *  Falls back to the first 3 characters of `months[i]` when omitted. */
  monthsShort?: [string,string,string,string,string,string,string,string,string,string,string,string];
  /** 7 weekday labels starting from Sunday */
  weekdays: [string,string,string,string,string,string,string];
  /** Label for the "Today" footer button */
  today: string;
}

/** Built-in locale definitions — keyed by BCP-47 primary language tag */
export const DATE_PICKER_LOCALES: Record<string, DatePickerLocale> = {
  en: {
    months:      ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdays:    ['Su','Mo','Tu','We','Th','Fr','Sa'],
    today:       'Today',
  },
  vi: {
    months:      ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    monthsShort: ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'],
    weekdays:    ['CN','T2','T3','T4','T5','T6','T7'],
    today:       'Hôm nay',
  },
};

export interface DatePickerProps {
  /** Controlled date value */
  value?: Date | null;
  /** Default value for uncontrolled usage */
  defaultValue?: Date | null;
  /** Called when date changes — receives null when cleared */
  onChange?: (date: Date | null) => void;
  /** Placeholder text shown when no date is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Show a clear button when a date is selected */
  clearable?: boolean;
  /** Date format string. Supported tokens: YYYY, MM, DD */
  format?: string;
  /** Size preset */
  size?: DatePickerSize;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** Custom function returning true for dates that should be disabled */
  disabledDate?: (date: Date) => boolean;
  /** Label rendered above the trigger */
  label?: string;
  /** Mark label as required */
  required?: boolean;
  /** Error message shown below the trigger */
  error?: string;
  /** Hint text shown below the trigger */
  hint?: string;
  /** Additional class on the root element */
  className?: string;
  /** Border-radius preset for the trigger */
  rounded?: Rounded;
  /** Show or hide the calendar icon (default: true) */
  showIcon?: boolean;
  /** Replace the default calendar icon with a custom ReactNode */
  icon?: React.ReactNode;
  /**
   * Locale for panel labels (month names, weekdays, today button).
   * - Pass a BCP-47 language tag string: `"vi"`, `"en"`, …
   * - Pass a custom `DatePickerLocale` object for full control.
   * - Omit to auto-detect from `<html lang="…">` (falls back to `"en"`).
   */
  locale?: string | DatePickerLocale;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date, fmt: string): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return fmt.replace(/YYYY|MM|DD|M|D/g, (token) => {
    switch (token) {
      case 'YYYY': return String(y);
      case 'MM':   return String(m).padStart(2, '0');
      case 'DD':   return String(d).padStart(2, '0');
      case 'M':    return String(m);
      case 'D':    return String(d);
      default:     return token;
    }
  });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── Locale resolver ────────────────────────────────────────────────────────

function resolveLocale(prop: string | DatePickerLocale | undefined, detected: string): DatePickerLocale {
  if (prop !== undefined) {
    if (typeof prop === 'object') return prop;
    const key = prop.split('-')[0].toLowerCase();
    return DATE_PICKER_LOCALES[key] ?? DATE_PICKER_LOCALES.en;
  }
  return DATE_PICKER_LOCALES[detected] ?? DATE_PICKER_LOCALES.en;
}

// ── Component ──────────────────────────────────────────────────────────────

export const DatePicker: React.FC<DatePickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  clearable = false,
  format = 'MM/DD/YYYY',
  size = 'md',
  minDate,
  maxDate,
  disabledDate,
  label,
  required = false,
  error,
  hint,
  className,
  rounded,
  showIcon = true,
  icon,
  locale: localeProp,
}) => {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue != null ? startOfDay(defaultValue) : null
  );
  const currentValue: Date | null = isControlled
    ? (valueProp != null ? startOfDay(valueProp) : null)
    : internalValue;

  const [open, setOpen] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>('date');
  const [panelYear, setPanelYear] = useState<number>(() =>
    (currentValue ?? new Date()).getFullYear()
  );
  const [panelMonth, setPanelMonth] = useState<number>(() =>
    (currentValue ?? new Date()).getMonth()
  );
  const [yearRangeStart, setYearRangeStart] = useState<number>(() => {
    const y = (currentValue ?? new Date()).getFullYear();
    return Math.floor(y / 12) * 12;
  });
  const [panelAbove, setPanelAbove] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');

  const rootRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const today = startOfDay(new Date());

  // SSR guard for portal + detect <html lang="">
  useEffect(() => {
    setMounted(true);
    const lang = document.documentElement.lang || navigator.language || 'en';
    setDetectedLang(lang.split('-')[0].toLowerCase());
  }, []);

  const loc = resolveLocale(localeProp, detectedLang);
  const monthsShort = loc.monthsShort ?? (loc.months.map(m => m.slice(0, 3)) as DatePickerLocale['monthsShort']);

  // ── Positioning ──────────────────────────────────────────────────────────

  const PANEL_HEIGHT = 350;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const above      = spaceBelow < PANEL_HEIGHT && spaceAbove > spaceBelow;
    setPanelAbove(above);
    setPanelStyle(
      above
        ? { position: 'fixed', left: rect.left, bottom: window.innerHeight - rect.top + 6, top: 'auto', width: rect.width < 284 ? 284 : rect.width }
        : { position: 'fixed', left: rect.left, top: rect.bottom + 6, width: rect.width < 284 ? 284 : rect.width }
    );
  }, []);

  // ── Open / close ─────────────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    if (disabled) return;
    calcPosition();
    const base = currentValue ?? new Date();
    setPanelYear(base.getFullYear());
    setPanelMonth(base.getMonth());
    setYearRangeStart(Math.floor(base.getFullYear() / 12) * 12);
    setPanelView('date');
    setOpen(true);
  }, [disabled, calcPosition, currentValue]);

  const closePanel = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Recalc position on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', calcPosition, true);
    window.addEventListener('resize', calcPosition);
    return () => {
      window.removeEventListener('scroll', calcPosition, true);
      window.removeEventListener('resize', calcPosition);
    };
  }, [open, calcPosition]);

  // Close on outside click — panel is in portal so check panelRef too
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = rootRef.current?.contains(target);
      const inPanel   = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closePanel]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectDate = useCallback(
    (date: Date) => {
      const d = startOfDay(date);
      if (!isControlled) setInternalValue(d);
      onChange?.(d);
      closePanel();
    },
    [isControlled, onChange, closePanel]
  );

  const clearDate = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue(null);
      onChange?.(null);
    },
    [isControlled, onChange]
  );

  // ── Disabled check ────────────────────────────────────────────────────────

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      const d = startOfDay(date);
      if (minDate && d < startOfDay(minDate)) return true;
      if (maxDate && d > startOfDay(maxDate)) return true;
      return disabledDate?.(d) ?? false;
    },
    [minDate, maxDate, disabledDate]
  );

  // ── Navigation ────────────────────────────────────────────────────────────

  const prevPanel = () => {
    if (panelView === 'date') {
      if (panelMonth === 0) { setPanelMonth(11); setPanelYear(y => y - 1); }
      else setPanelMonth(m => m - 1);
    } else if (panelView === 'month') {
      setPanelYear(y => y - 1);
    } else {
      setYearRangeStart(s => s - 12);
    }
  };

  const nextPanel = () => {
    if (panelView === 'date') {
      if (panelMonth === 11) { setPanelMonth(0); setPanelYear(y => y + 1); }
      else setPanelMonth(m => m + 1);
    } else if (panelView === 'month') {
      setPanelYear(y => y + 1);
    } else {
      setYearRangeStart(s => s + 12);
    }
  };

  // ── Calendar grid ─────────────────────────────────────────────────────────

  const buildCells = (): { date: Date; inMonth: boolean }[] => {
    const daysInMonth     = new Date(panelYear, panelMonth + 1, 0).getDate();
    const firstDay        = new Date(panelYear, panelMonth, 1).getDay();
    const prevDaysInMonth = new Date(panelYear, panelMonth, 0).getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];

    // Trailing days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDaysInMonth - i;
      const m = panelMonth === 0 ? 11 : panelMonth - 1;
      const y = panelMonth === 0 ? panelYear - 1 : panelYear;
      cells.push({ date: new Date(y, m, d), inMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(panelYear, panelMonth, d), inMonth: true });
    }

    // Fill to complete the last row
    const nextM = panelMonth === 11 ? 0 : panelMonth + 1;
    const nextY = panelMonth === 11 ? panelYear + 1 : panelYear;
    let fill = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ date: new Date(nextY, nextM, fill++), inMonth: false });
    }

    // Always render 6 rows (42 cells) for consistent panel height
    while (cells.length < 42) {
      cells.push({ date: new Date(nextY, nextM, fill++), inMonth: false });
    }

    return cells;
  };

  // ── Today handling ────────────────────────────────────────────────────────

  const todayDisabled = isDateDisabled(today);

  const handleTodayClick = () => {
    if (todayDisabled) return;
    selectDate(today);
  };

  // ── Trigger keyboard ──────────────────────────────────────────────────────

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open ? closePanel() : openPanel();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasValue  = currentValue !== null;
  const displayText = hasValue ? formatDate(currentValue!, format) : '';

  return (
    <div
      ref={rootRef}
      className={cn(
        'dsg-datepicker',
        `dsg-datepicker--${size}`,
        open      && 'dsg-datepicker--open',
        disabled  && 'dsg-datepicker--disabled',
        error     && 'dsg-datepicker--error',
        className
      )}
    >
      {/* Label */}
      {label && (
        <span
          className={cn(
            'dsg-datepicker__label',
            required && 'dsg-datepicker__label--required'
          )}
        >
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'dsg-datepicker__trigger',
          rounded && `dsg-datepicker__trigger--rounded-${rounded}`
        )}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={hasValue ? `Selected date: ${displayText}` : placeholder}
      >
        <span className="dsg-datepicker__value">
          {hasValue ? (
            <span className="dsg-datepicker__text">{displayText}</span>
          ) : (
            <span className="dsg-datepicker__placeholder">{placeholder}</span>
          )}
        </span>

        <span className="dsg-datepicker__suffix">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="dsg-datepicker__clear"
              onClick={clearDate}
              aria-label="Clear date"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {showIcon && (
            <span className="dsg-datepicker__cal-icon" aria-hidden="true">
              {icon ?? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1.25" y="2.5" width="12.5" height="11.25" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 1.25V3.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M10.5 1.25V3.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M1.25 6H13.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              )}
            </span>
          )}
        </span>
      </button>

      {/* Panel — rendered in portal to escape overflow:hidden containers */}
      {mounted && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className={cn(
            'dsg-datepicker__panel',
            open && 'dsg-datepicker__panel--open',
            panelAbove
              ? 'dsg-datepicker__panel--above'
              : 'dsg-datepicker__panel--below'
          )}
          role="dialog"
          aria-label="Date picker"
          aria-modal="false"
        >
        {/* ── Header ── */}
        <div className="dsg-datepicker__header">
          <button
            type="button"
            className="dsg-datepicker__nav"
            onClick={prevPanel}
            aria-label="Previous"
            tabIndex={open ? 0 : -1}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="dsg-datepicker__header-title">
            {panelView === 'date' && (
              <>
                <button
                  type="button"
                  className="dsg-datepicker__header-btn"
                  onClick={() => setPanelView('month')}
                  tabIndex={open ? 0 : -1}
                >
                  {loc.months[panelMonth]}
                </button>
                <button
                  type="button"
                  className="dsg-datepicker__header-btn"
                  onClick={() => {
                    setYearRangeStart(Math.floor(panelYear / 12) * 12);
                    setPanelView('year');
                  }}
                  tabIndex={open ? 0 : -1}
                >
                  {panelYear}
                </button>
              </>
            )}
            {panelView === 'month' && (
              <button
                type="button"
                className="dsg-datepicker__header-btn"
                onClick={() => {
                  setYearRangeStart(Math.floor(panelYear / 12) * 12);
                  setPanelView('year');
                }}
                tabIndex={open ? 0 : -1}
              >
                {panelYear}
              </button>
            )}
            {panelView === 'year' && (
              <span className="dsg-datepicker__header-range">
                {yearRangeStart}&thinsp;–&thinsp;{yearRangeStart + 11}
              </span>
            )}
          </div>

          <button
            type="button"
            className="dsg-datepicker__nav"
            onClick={nextPanel}
            aria-label="Next"
            tabIndex={open ? 0 : -1}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── Date view ── */}
        {panelView === 'date' && (
          <>
            {/* Weekday row */}
            <div className="dsg-datepicker__weekdays">
              {loc.weekdays.map((d) => (
                <span key={d} className="dsg-datepicker__weekday">
                  {d}
                </span>
              ))}
            </div>

            {/* Day cells */}
            <div className="dsg-datepicker__cells">
              {buildCells().map(({ date, inMonth }, i) => {
                const isDisabled = isDateDisabled(date);
                const isSelected = currentValue ? isSameDay(date, currentValue) : false;
                const isToday    = isSameDay(date, today);
                return (
                  <button
                    key={i}
                    type="button"
                    className={cn(
                      'dsg-datepicker__cell',
                      !inMonth    && 'dsg-datepicker__cell--other-month',
                      isSelected  && 'dsg-datepicker__cell--selected',
                      isToday && !isSelected && 'dsg-datepicker__cell--today',
                      isDisabled  && 'dsg-datepicker__cell--disabled'
                    )}
                    onClick={() => !isDisabled && selectDate(date)}
                    disabled={isDisabled}
                    aria-label={formatDate(date, 'YYYY-MM-DD')}
                    aria-pressed={isSelected}
                    tabIndex={open ? 0 : -1}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Month view ── */}
        {panelView === 'month' && (
          <div className="dsg-datepicker__months">
            {loc.months.map((month, i) => {
              const isSelected =
                currentValue?.getMonth() === i &&
                currentValue?.getFullYear() === panelYear;
              const isCurrent =
                !isSelected &&
                today.getMonth() === i &&
                today.getFullYear() === panelYear;
              return (
                <button
                  key={month}
                  type="button"
                  className={cn(
                    'dsg-datepicker__month-cell',
                    isSelected && 'dsg-datepicker__month-cell--selected',
                    isCurrent  && 'dsg-datepicker__month-cell--current'
                  )}
                  onClick={() => {
                    setPanelMonth(i);
                    setPanelView('date');
                  }}
                  tabIndex={open ? 0 : -1}
                >
                  {monthsShort![i]}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Year view ── */}
        {panelView === 'year' && (
          <div className="dsg-datepicker__years">
            {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => {
              const isSelected = currentValue?.getFullYear() === y;
              const isCurrent  = !isSelected && today.getFullYear() === y;
              return (
                <button
                  key={y}
                  type="button"
                  className={cn(
                    'dsg-datepicker__year-cell',
                    isSelected && 'dsg-datepicker__year-cell--selected',
                    isCurrent  && 'dsg-datepicker__year-cell--current'
                  )}
                  onClick={() => {
                    setPanelYear(y);
                    setPanelView('month');
                  }}
                  tabIndex={open ? 0 : -1}
                >
                  {y}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="dsg-datepicker__footer">
          <button
            type="button"
            className={cn(
              'dsg-datepicker__today-btn',
              todayDisabled && 'dsg-datepicker__today-btn--disabled'
            )}
            onClick={handleTodayClick}
            disabled={todayDisabled}
            tabIndex={open ? 0 : -1}
          >
            {loc.today}
          </button>
        </div>
      </div>,
      document.body
    )}

      {/* Error / hint */}
      {error && <span className="dsg-datepicker__error-msg">{error}</span>}
      {!error && hint && <span className="dsg-datepicker__hint">{hint}</span>}
    </div>
  );
};
