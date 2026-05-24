import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './TimePicker.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

// ── Types ──────────────────────────────────────────────────────────────────

export type TimePickerSize = 'sm' | 'md' | 'lg';

export interface TimePickerLocale {
  now: string;
  ok: string;
}

export const TIME_PICKER_LOCALES: Record<string, TimePickerLocale> = {
  en: { now: 'Now', ok: 'OK' },
  vi: { now: 'Bây giờ', ok: 'Xác nhận' },
};

export interface TimePickerProps {
  /**
   * Controlled value — format matches timeMode:
   * "HH" → e.g. "14"
   * "HH:mm" → e.g. "14:30"
   * "HH:mm:ss" → e.g. "14:30:00"
   */
  value?: string | null;
  /** Initial value for uncontrolled usage */
  defaultValue?: string | null;
  /** Called when confirmed — receives null when cleared */
  onChange?: (time: string | null) => void;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Show clear button when a value is selected */
  clearable?: boolean;
  /** Size preset */
  size?: TimePickerSize;
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
   * Pass a BCP-47 tag ("vi", "en") or a full TimePickerLocale object.
   * Auto-detects from <html lang="…"> when omitted.
   */
  locale?: string | TimePickerLocale;
  /**
   * Which time units to show.
   * "HH"       → hour only
   * "HH:mm"    → hour + minute (default)
   * "HH:mm:ss" → hour + minute + second
   */
  timeMode?: 'HH' | 'HH:mm' | 'HH:mm:ss';
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(
  h: number,
  m: number,
  s: number,
  mode: 'HH' | 'HH:mm' | 'HH:mm:ss',
): string {
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (mode === 'HH') return hh;
  if (mode === 'HH:mm') return `${hh}:${mm}`;
  return `${hh}:${mm}:${ss}`;
}

function parseTime(value: string | null | undefined): [number, number, number] {
  if (!value) return [0, 0, 0];
  const parts = value.split(':').map(Number);
  const h = Math.min(23, Math.max(0, isNaN(parts[0]) ? 0 : parts[0]));
  const m = Math.min(59, Math.max(0, isNaN(parts[1]) ? 0 : parts[1]));
  const s = Math.min(59, Math.max(0, isNaN(parts[2]) ? 0 : parts[2]));
  return [h, m, s];
}

function resolveLocale(
  prop: string | TimePickerLocale | undefined,
  detected: string,
): TimePickerLocale {
  if (prop !== undefined) {
    if (typeof prop === 'object') return prop;
    const key = prop.split('-')[0].toLowerCase();
    return TIME_PICKER_LOCALES[key] ?? TIME_PICKER_LOCALES.en;
  }
  return TIME_PICKER_LOCALES[detected] ?? TIME_PICKER_LOCALES.en;
}

// ── TimeColumn ─────────────────────────────────────────────────────────────

const ITEM_H  = 30;
const VISIBLE = 5;
const PAD_H   = ITEM_H * Math.floor(VISIBLE / 2); // 60px

interface TimeColumnProps {
  count:    number;
  value:    number;
  onChange: (v: number) => void;
  tabIndex: number;
}

const TimeColumn: React.FC<TimeColumnProps> = ({ count, value, onChange, tabIndex }) => {
  const ref       = useRef<HTMLDivElement>(null);
  const byCode    = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout>>();

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
    <div className="dsg-tp__time-col-wrap">
      <div
        ref={ref}
        className="dsg-tp__time-col"
        onScroll={handleScroll}
      >
        <div style={{ height: PAD_H, flexShrink: 0 }} />
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={cn('dsg-tp__time-item', i === value && 'dsg-tp__time-item--selected')}
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

const PANEL_HEIGHT = 240;

export const TimePicker: React.FC<TimePickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder = 'Select time',
  disabled    = false,
  clearable   = false,
  size        = 'md',
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
  const isControlled   = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null);
  const currentValue: string | null = isControlled ? (valueProp ?? null) : internalValue;

  const [open,        setOpen]        = useState(false);
  const [panelAbove,  setPanelAbove]  = useState(false);
  const [panelStyle,  setPanelStyle]  = useState<React.CSSProperties>({});
  const [mounted,     setMounted]     = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');

  // Pending (uncommitted) time while panel is open
  const [panelHour,   setPanelHour]   = useState(0);
  const [panelMinute, setPanelMinute] = useState(0);
  const [panelSecond, setPanelSecond] = useState(0);

  const rootRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const lang = document.documentElement.lang || navigator.language || 'en';
    setDetectedLang(lang.split('-')[0].toLowerCase());
  }, []);

  const loc = resolveLocale(localeProp, detectedLang);

  // ── Positioning ──────────────────────────────────────────────────────────

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const above      = spaceBelow < PANEL_HEIGHT && spaceAbove > spaceBelow;

    // Min panel width based on number of columns (must be wide enough for footer buttons)
    const minW = timeMode === 'HH:mm:ss' ? 260 : timeMode === 'HH:mm' ? 210 : 190;
    const triggerW = rect.width;

    let left: number;
    let width: number;
    if (triggerW >= minW) {
      // Trigger is wide enough — match it, left-align
      left  = rect.left;
      width = triggerW;
    } else {
      // Panel would be wider than trigger — center it under trigger
      width = minW;
      left  = rect.left + triggerW / 2 - minW / 2;
    }

    setPanelAbove(above);
    setPanelStyle(
      above
        ? { position: 'fixed', left: Math.max(8, left), bottom: window.innerHeight - rect.top + 6, top: 'auto', width }
        : { position: 'fixed', left: Math.max(8, left), top: rect.bottom + 6, width },
    );
  }, [timeMode]);

  // ── Open / close ─────────────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    if (disabled) return;
    calcPosition();
    const [h, m, s] = parseTime(currentValue);
    setPanelHour(h);
    setPanelMinute(m);
    setPanelSecond(s);
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

  const handleOk = useCallback(() => {
    const result = formatTime(
      panelHour,
      timeMode === 'HH' ? 0 : panelMinute,
      timeMode === 'HH:mm:ss' ? panelSecond : 0,
      timeMode,
    );
    if (!isControlled) setInternalValue(result);
    onChange?.(result);
    closePanel();
  }, [panelHour, panelMinute, panelSecond, timeMode, isControlled, onChange, closePanel]);

  const handleNow = useCallback(() => {
    const now = new Date();
    setPanelHour(now.getHours());
    setPanelMinute(now.getMinutes());
    setPanelSecond(now.getSeconds());
  }, []);

  const clearTime = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) setInternalValue(null);
    onChange?.(null);
  }, [isControlled, onChange]);

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open ? closePanel() : openPanel();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasValue    = currentValue !== null;
  const displayText = hasValue ? currentValue! : '';
  const tabIdx      = open ? 0 : -1;
  const showMinute  = timeMode === 'HH:mm' || timeMode === 'HH:mm:ss';
  const showSecond  = timeMode === 'HH:mm:ss';

  return (
    <div
      ref={rootRef}
      className={cn(
        'dsg-tp',
        `dsg-tp--${size}`,
        open     && 'dsg-tp--open',
        disabled && 'dsg-tp--disabled',
        error    && 'dsg-tp--error',
        className,
      )}
    >
      {/* Label */}
      {label && (
        <span className={cn('dsg-tp__label', required && 'dsg-tp__label--required')}>
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={cn('dsg-tp__trigger', rounded && `dsg-tp__trigger--rounded-${rounded}`)}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={hasValue ? `Selected: ${displayText}` : placeholder}
      >
        <span className="dsg-tp__value">
          {hasValue
            ? <span className="dsg-tp__text">{displayText}</span>
            : <span className="dsg-tp__placeholder">{placeholder}</span>
          }
        </span>
        <span className="dsg-tp__suffix">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="dsg-tp__clear"
              onClick={clearTime}
              aria-label="Clear"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {showIcon && (
            <span className="dsg-tp__clock-icon" aria-hidden="true">
              {icon ?? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7.5 4.5V7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
            'dsg-tp__panel',
            open && 'dsg-tp__panel--open',
            panelAbove ? 'dsg-tp__panel--above' : 'dsg-tp__panel--below',
          )}
          role="dialog"
          aria-label="Time picker"
          aria-modal="false"
        >
          {/* Time columns */}
          <div className="dsg-tp__time-body">
            <div className="dsg-tp__time-highlight" />
            <TimeColumn count={24} value={panelHour} onChange={setPanelHour} tabIndex={tabIdx} />
            {showMinute && (
              <>
                <span className="dsg-tp__time-sep">:</span>
                <TimeColumn count={60} value={panelMinute} onChange={setPanelMinute} tabIndex={tabIdx} />
              </>
            )}
            {showSecond && (
              <>
                <span className="dsg-tp__time-sep">:</span>
                <TimeColumn count={60} value={panelSecond} onChange={setPanelSecond} tabIndex={tabIdx} />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="dsg-tp__footer">
            <button type="button" className="dsg-tp__now-btn" onClick={handleNow} tabIndex={tabIdx}>
              {loc.now}
            </button>
            <button
              type="button"
              className="dsg-tp__ok-btn"
              onClick={handleOk}
              tabIndex={tabIdx}
            >
              {loc.ok}
            </button>
          </div>
        </div>,
        document.body,
      )}

      {error && <span className="dsg-tp__error-msg">{error}</span>}
      {!error && hint && <span className="dsg-tp__hint">{hint}</span>}
    </div>
  );
};
