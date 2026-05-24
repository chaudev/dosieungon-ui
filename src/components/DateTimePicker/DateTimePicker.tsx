import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './DateTimePicker.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

// ── Types ──────────────────────────────────────────────────────────────────

export type DateTimePickerSize = 'sm' | 'md' | 'lg';
export type TimeMode = 'HH' | 'HH:mm' | 'HH:mm:ss';
type PanelView = 'date' | 'month' | 'year';

export interface DateTimePickerLocale {
  months: [string,string,string,string,string,string,string,string,string,string,string,string];
  monthsShort?: [string,string,string,string,string,string,string,string,string,string,string,string];
  weekdays: [string,string,string,string,string,string,string];
  today: string;
  now: string;
  ok: string;
}

export const DATE_TIME_PICKER_LOCALES: Record<string, DateTimePickerLocale> = {
  en: {
    months:   ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdays: ['Su','Mo','Tu','We','Th','Fr','Sa'],
    today:    'Today',
    now:      'Now',
    ok:       'OK',
  },
  vi: {
    months:      ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    monthsShort: ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'],
    weekdays:    ['CN','T2','T3','T4','T5','T6','T7'],
    today:       'Hôm nay',
    now:         'Bây giờ',
    ok:          'Xác nhận',
  },
};

export interface DateTimePickerProps {
  /** Controlled value */
  value?: Date | null;
  /** Initial value for uncontrolled usage */
  defaultValue?: Date | null;
  /** Called when confirmed — receives null when cleared */
  onChange?: (date: Date | null) => void;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Show clear button when a value is selected */
  clearable?: boolean;
  /**
   * Display format string.
   * Tokens: YYYY MM DD HH mm ss
   * Defaults to "MM/DD/YYYY HH:mm", "MM/DD/YYYY HH", or "MM/DD/YYYY HH:mm:ss"
   * based on timeMode.
   */
  format?: string;
  /** Size preset */
  size?: DateTimePickerSize;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** Return true to disable a specific date */
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
  /** Border-radius preset */
  rounded?: Rounded;
  /** Show or hide the icon (default: true) */
  showIcon?: boolean;
  /** Replace the default icon with a custom ReactNode */
  icon?: React.ReactNode;
  /**
   * Locale for panel labels.
   * Pass a BCP-47 tag ("vi", "en") or a full DateTimePickerLocale object.
   * Auto-detects from <html lang="…"> when omitted.
   */
  locale?: string | DateTimePickerLocale;
  /**
   * Which time units to show.
   * "HH"       → hour only
   * "HH:mm"    → hour + minute (default)
   * "HH:mm:ss" → hour + minute + second
   */
  timeMode?: TimeMode;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(date: Date, fmt: string): string {
  const y  = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d  = date.getDate();
  const h  = date.getHours();
  const mi = date.getMinutes();
  const s  = date.getSeconds();
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss|M|D/g, (token) => {
    switch (token) {
      case 'YYYY': return String(y);
      case 'MM':   return String(mo).padStart(2, '0');
      case 'DD':   return String(d).padStart(2, '0');
      case 'HH':   return String(h).padStart(2, '0');
      case 'mm':   return String(mi).padStart(2, '0');
      case 'ss':   return String(s).padStart(2, '0');
      case 'M':    return String(mo);
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
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function resolveLocale(
  prop: string | DateTimePickerLocale | undefined,
  detected: string
): DateTimePickerLocale {
  if (prop !== undefined) {
    if (typeof prop === 'object') return prop;
    const key = prop.split('-')[0].toLowerCase();
    return DATE_TIME_PICKER_LOCALES[key] ?? DATE_TIME_PICKER_LOCALES.en;
  }
  return DATE_TIME_PICKER_LOCALES[detected] ?? DATE_TIME_PICKER_LOCALES.en;
}

function defaultFormatForMode(mode: TimeMode): string {
  if (mode === 'HH')       return 'MM/DD/YYYY HH';
  if (mode === 'HH:mm:ss') return 'MM/DD/YYYY HH:mm:ss';
  return 'MM/DD/YYYY HH:mm';
}

// ── TimeColumn ─────────────────────────────────────────────────────────────

const ITEM_H  = 30;
const VISIBLE = 5;
const PAD_H   = ITEM_H * Math.floor(VISIBLE / 2); // 60px — allows first/last item to center

interface TimeColumnProps {
  count:    number;
  value:    number;
  onChange: (v: number) => void;
  tabIndex: number;
}

const TimeColumn: React.FC<TimeColumnProps> = ({ count, value, onChange, tabIndex }) => {
  const ref      = useRef<HTMLDivElement>(null);
  const byCode   = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout>>();

  // Scroll to selected value whenever it changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    byCode.current = true;
    el.scrollTop = value * ITEM_H;
    const t = setTimeout(() => { byCode.current = false; }, 250);
    return () => clearTimeout(t);
  }, [value]);

  const handleScroll = useCallback(() => {
    if (byCode.current) return;
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const v = Math.round(el.scrollTop / ITEM_H);
      onChange(Math.max(0, Math.min(count - 1, v)));
    }, 120);
  }, [count, onChange]);

  return (
    <div className="dsg-dtp__time-col-wrap">
      <div
        ref={ref}
        className="dsg-dtp__time-col"
        onScroll={handleScroll}
      >
        <div style={{ height: PAD_H, flexShrink: 0 }} />
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={cn('dsg-dtp__time-item', i === value && 'dsg-dtp__time-item--selected')}
            onClick={() => onChange(i)}
            tabIndex={tabIndex}
          >
            {String(i).padStart(2, '0')}
          </button>
        ))}
        <div style={{ height: PAD_H, flexShrink: 0 }} />
      </div>
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder = 'Select date & time',
  disabled    = false,
  clearable   = false,
  format,
  size        = 'md',
  minDate,
  maxDate,
  disabledDate,
  label,
  required    = false,
  error,
  hint,
  className,
  rounded,
  showIcon    = true,
  icon,
  locale: localeProp,
  timeMode    = 'HH:mm',
}) => {
  const resolvedFormat = format ?? defaultFormatForMode(timeMode);
  const isControlled   = valueProp !== undefined;

  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const currentValue: Date | null = isControlled ? (valueProp ?? null) : internalValue;

  const [open,          setOpen]          = useState(false);
  const [panelView,     setPanelView]     = useState<PanelView>('date');
  const [panelYear,     setPanelYear]     = useState(new Date().getFullYear());
  const [panelMonth,    setPanelMonth]    = useState(new Date().getMonth());
  const [yearRangeStart, setYearRangeStart] = useState(() => Math.floor(new Date().getFullYear() / 12) * 12);

  // Pending (uncommitted) date+time while panel is open
  const [panelDate,   setPanelDate]   = useState<Date | null>(null);
  const [panelHour,   setPanelHour]   = useState(0);
  const [panelMinute, setPanelMinute] = useState(0);
  const [panelSecond, setPanelSecond] = useState(0);

  const [panelAbove, setPanelAbove] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [mounted,    setMounted]    = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');

  const rootRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());

  useEffect(() => {
    setMounted(true);
    const lang = document.documentElement.lang || navigator.language || 'en';
    setDetectedLang(lang.split('-')[0].toLowerCase());
  }, []);

  const loc = resolveLocale(localeProp, detectedLang);
  const monthsShort = loc.monthsShort ?? (loc.months.map(m => m.slice(0, 3)) as DateTimePickerLocale['monthsShort']);

  // ── Positioning ──────────────────────────────────────────────────────────

  const PANEL_HEIGHT = 410;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const above      = spaceBelow < PANEL_HEIGHT && spaceAbove > spaceBelow;
    // Min width accounts for calendar (220px) + divider (17px) + time columns
    const minW = timeMode === 'HH:mm:ss' ? 460 : timeMode === 'HH:mm' ? 400 : 340;
    setPanelAbove(above);
    setPanelStyle(
      above
        ? { position: 'fixed', left: rect.left, bottom: window.innerHeight - rect.top + 6, top: 'auto', width: rect.width < minW ? minW : rect.width }
        : { position: 'fixed', left: rect.left, top: rect.bottom + 6, width: rect.width < minW ? minW : rect.width }
    );
  }, [timeMode]);

  // ── Open / close ─────────────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    if (disabled) return;
    calcPosition();
    const base = currentValue;
    if (base) {
      setPanelDate(startOfDay(base));
      setPanelYear(base.getFullYear());
      setPanelMonth(base.getMonth());
      setPanelHour(base.getHours());
      setPanelMinute(base.getMinutes());
      setPanelSecond(base.getSeconds());
      setYearRangeStart(Math.floor(base.getFullYear() / 12) * 12);
    } else {
      const now = new Date();
      setPanelDate(null);
      setPanelYear(now.getFullYear());
      setPanelMonth(now.getMonth());
      setPanelHour(0);
      setPanelMinute(0);
      setPanelSecond(0);
      setYearRangeStart(Math.floor(now.getFullYear() / 12) * 12);
    }
    setPanelView('date');
    setOpen(true);
  }, [disabled, calcPosition, currentValue]);

  const closePanel = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', calcPosition, true);
    window.addEventListener('resize', calcPosition);
    return () => {
      window.removeEventListener('scroll', calcPosition, true);
      window.removeEventListener('resize', calcPosition);
    };
  }, [open, calcPosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closePanel]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectPanelDate = useCallback((date: Date) => {
    setPanelDate(startOfDay(date));
  }, []);

  const handleOk = useCallback(() => {
    if (!panelDate) return;
    const result = new Date(
      panelDate.getFullYear(),
      panelDate.getMonth(),
      panelDate.getDate(),
      panelHour,
      timeMode === 'HH' ? 0 : panelMinute,
      timeMode === 'HH:mm:ss' ? panelSecond : 0,
      0
    );
    if (!isControlled) setInternalValue(result);
    onChange?.(result);
    closePanel();
  }, [panelDate, panelHour, panelMinute, panelSecond, timeMode, isControlled, onChange, closePanel]);

  const handleNow = useCallback(() => {
    const now = new Date();
    setPanelDate(startOfDay(now));
    setPanelYear(now.getFullYear());
    setPanelMonth(now.getMonth());
    setPanelHour(now.getHours());
    setPanelMinute(now.getMinutes());
    setPanelSecond(now.getSeconds());
  }, []);

  const clearDate = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) setInternalValue(null);
    onChange?.(null);
  }, [isControlled, onChange]);

  // ── Disabled check ────────────────────────────────────────────────────────

  const isDateDisabled = useCallback((date: Date): boolean => {
    const d = startOfDay(date);
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return disabledDate?.(d) ?? false;
  }, [minDate, maxDate, disabledDate]);

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

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDaysInMonth - i;
      const m = panelMonth === 0 ? 11 : panelMonth - 1;
      const y = panelMonth === 0 ? panelYear - 1 : panelYear;
      cells.push({ date: new Date(y, m, d), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(panelYear, panelMonth, d), inMonth: true });
    }
    const nextM = panelMonth === 11 ? 0 : panelMonth + 1;
    const nextY = panelMonth === 11 ? panelYear + 1 : panelYear;
    let fill = 1;
    while (cells.length % 7 !== 0) cells.push({ date: new Date(nextY, nextM, fill++), inMonth: false });
    while (cells.length < 42)      cells.push({ date: new Date(nextY, nextM, fill++), inMonth: false });
    return cells;
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open ? closePanel() : openPanel();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasValue     = currentValue !== null;
  const displayText  = hasValue ? formatDateTime(currentValue!, resolvedFormat) : '';
  const tabIdx       = open ? 0 : -1;
  const showMinute   = timeMode === 'HH:mm' || timeMode === 'HH:mm:ss';
  const showSecond   = timeMode === 'HH:mm:ss';
  const okDisabled   = panelDate === null;

  return (
    <div
      ref={rootRef}
      className={cn(
        'dsg-dtp',
        `dsg-dtp--${size}`,
        open     && 'dsg-dtp--open',
        disabled && 'dsg-dtp--disabled',
        error    && 'dsg-dtp--error',
        className
      )}
    >
      {/* Label */}
      {label && (
        <span className={cn('dsg-dtp__label', required && 'dsg-dtp__label--required')}>
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={cn('dsg-dtp__trigger', rounded && `dsg-dtp__trigger--rounded-${rounded}`)}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={hasValue ? `Selected: ${displayText}` : placeholder}
      >
        <span className="dsg-dtp__value">
          {hasValue
            ? <span className="dsg-dtp__text">{displayText}</span>
            : <span className="dsg-dtp__placeholder">{placeholder}</span>
          }
        </span>
        <span className="dsg-dtp__suffix">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="dsg-dtp__clear"
              onClick={clearDate}
              aria-label="Clear"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {showIcon && (
            <span className="dsg-dtp__cal-icon" aria-hidden="true">
              {icon ?? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1.25" y="2.5" width="12.5" height="11.25" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 1.25V3.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M10.5 1.25V3.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M1.25 6H13.75" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="10.5" cy="10.5" r="3" fill="var(--dsg-bg)" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M10.5 9.25V10.5H11.75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          )}
        </span>
      </button>

      {/* Panel — rendered in portal */}
      {mounted && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className={cn(
            'dsg-dtp__panel',
            open && 'dsg-dtp__panel--open',
            panelAbove ? 'dsg-dtp__panel--above' : 'dsg-dtp__panel--below'
          )}
          role="dialog"
          aria-label="Date and time picker"
          aria-modal="false"
        >
          {/* ── Header ── */}
          <div className="dsg-dtp__header">
            <button type="button" className="dsg-dtp__nav" onClick={prevPanel} aria-label="Previous" tabIndex={tabIdx}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="dsg-dtp__header-title">
              {panelView === 'date' && (
                <>
                  <button type="button" className="dsg-dtp__header-btn" onClick={() => setPanelView('month')} tabIndex={tabIdx}>
                    {loc.months[panelMonth]}
                  </button>
                  <button type="button" className="dsg-dtp__header-btn" onClick={() => { setYearRangeStart(Math.floor(panelYear / 12) * 12); setPanelView('year'); }} tabIndex={tabIdx}>
                    {panelYear}
                  </button>
                </>
              )}
              {panelView === 'month' && (
                <button type="button" className="dsg-dtp__header-btn" onClick={() => { setYearRangeStart(Math.floor(panelYear / 12) * 12); setPanelView('year'); }} tabIndex={tabIdx}>
                  {panelYear}
                </button>
              )}
              {panelView === 'year' && (
                <span className="dsg-dtp__header-range">{yearRangeStart}&thinsp;–&thinsp;{yearRangeStart + 11}</span>
              )}
            </div>

            <button type="button" className="dsg-dtp__nav" onClick={nextPanel} aria-label="Next" tabIndex={tabIdx}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* ── Body: calendar (left) + time columns (right) ── */}
          <div className="dsg-dtp__body">

            {/* Calendar section */}
            <div className="dsg-dtp__calendar-section">
              {/* Date view */}
              {panelView === 'date' && (
                <>
                  <div className="dsg-dtp__weekdays">
                    {loc.weekdays.map((d) => (
                      <span key={d} className="dsg-dtp__weekday">{d}</span>
                    ))}
                  </div>
                  <div className="dsg-dtp__cells">
                    {buildCells().map(({ date, inMonth }, i) => {
                      const isDisabled = isDateDisabled(date);
                      const isSelected = panelDate ? isSameDay(date, panelDate) : false;
                      const isToday    = isSameDay(date, today);
                      return (
                        <button
                          key={i}
                          type="button"
                          className={cn(
                            'dsg-dtp__cell',
                            !inMonth   && 'dsg-dtp__cell--other-month',
                            isSelected && 'dsg-dtp__cell--selected',
                            isToday && !isSelected && 'dsg-dtp__cell--today',
                            isDisabled && 'dsg-dtp__cell--disabled'
                          )}
                          onClick={() => !isDisabled && selectPanelDate(date)}
                          disabled={isDisabled}
                          aria-label={`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
                          aria-pressed={isSelected}
                          tabIndex={tabIdx}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Month view */}
              {panelView === 'month' && (
                <div className="dsg-dtp__months">
                  {loc.months.map((month, i) => {
                    const isSelected = panelDate?.getMonth() === i && panelDate?.getFullYear() === panelYear;
                    const isCurrent  = !isSelected && today.getMonth() === i && today.getFullYear() === panelYear;
                    return (
                      <button
                        key={month}
                        type="button"
                        className={cn('dsg-dtp__month-cell', isSelected && 'dsg-dtp__month-cell--selected', isCurrent && 'dsg-dtp__month-cell--current')}
                        onClick={() => { setPanelMonth(i); setPanelView('date'); }}
                        tabIndex={tabIdx}
                      >
                        {monthsShort![i]}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Year view */}
              {panelView === 'year' && (
                <div className="dsg-dtp__years">
                  {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => {
                    const isSelected = panelDate?.getFullYear() === y;
                    const isCurrent  = !isSelected && today.getFullYear() === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        className={cn('dsg-dtp__year-cell', isSelected && 'dsg-dtp__year-cell--selected', isCurrent && 'dsg-dtp__year-cell--current')}
                        onClick={() => { setPanelYear(y); setPanelView('month'); }}
                        tabIndex={tabIdx}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vertical divider */}
            <div className="dsg-dtp__divider" />

            {/* Time section — right column */}
            <div className="dsg-dtp__time-section">
              <div className="dsg-dtp__time-body">
                <div className="dsg-dtp__time-highlight" />
                <TimeColumn count={24} value={panelHour} onChange={setPanelHour} tabIndex={tabIdx} />
                {showMinute && (
                  <>
                    <span className="dsg-dtp__time-sep">:</span>
                    <TimeColumn count={60} value={panelMinute} onChange={setPanelMinute} tabIndex={tabIdx} />
                  </>
                )}
                {showSecond && (
                  <>
                    <span className="dsg-dtp__time-sep">:</span>
                    <TimeColumn count={60} value={panelSecond} onChange={setPanelSecond} tabIndex={tabIdx} />
                  </>
                )}
              </div>
            </div>

          </div>{/* /body */}

          {/* ── Footer ── */}
          <div className="dsg-dtp__footer">
            <button type="button" className="dsg-dtp__now-btn" onClick={handleNow} tabIndex={tabIdx}>
              {loc.now}
            </button>
            <button
              type="button"
              className={cn('dsg-dtp__ok-btn', okDisabled && 'dsg-dtp__ok-btn--disabled')}
              onClick={handleOk}
              disabled={okDisabled}
              tabIndex={tabIdx}
            >
              {loc.ok}
            </button>
          </div>
        </div>,
        document.body
      )}

      {error && <span className="dsg-dtp__error-msg">{error}</span>}
      {!error && hint && <span className="dsg-dtp__hint">{hint}</span>}
    </div>
  );
};
