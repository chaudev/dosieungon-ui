import React, {
  FocusEvent,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import '../../styles/variables.css';
import './InputNumber.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type InputNumberSize = 'sm' | 'md' | 'lg';

export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'value' | 'defaultValue' | 'type'
  > {
  /** Controlled numeric value */
  value?: number;
  /** Uncontrolled initial numeric value */
  defaultValue?: number;
  /**
   * Fires on every keystroke.
   * @param value Parsed number — null when empty or invalid
   * @param text  Formatted display text (may include thousand separators)
   */
  onChange?: (value: number | null, text: string) => void;
  /** Minimum allowed value — enforced on blur and spinner */
  min?: number;
  /** Maximum allowed value — enforced on blur and spinner */
  max?: number;
  /** Spinner increment step. Default: 1 */
  step?: number;
  /** Max decimal places. Default: unlimited */
  precision?: number;
  /** Format with thousand separators while typing */
  currency?: boolean;
  /** Thousand separator character. Default: "," */
  thousandSeparator?: string;
  /** Decimal separator character. Default: "." */
  decimalSeparator?: string;
  /** Symbol/text shown before the value (e.g. "₫" or "$") */
  prefix?: string;
  /** Symbol/text shown after the value (e.g. "VND") */
  suffix?: string;
  /** Show ▲ ▼ spinner buttons */
  controls?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  size?: InputNumberSize;
  rounded?: Rounded;
  wrapperClassName?: string;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

interface Opts {
  thousandSep: string;
  decimalSep: string;
  currency: boolean;
  precision?: number;
}

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function numToDisplay(num: number | null | undefined, opts: Opts): string {
  if (num == null || isNaN(num)) return '';
  const neg = num < 0;
  const abs = Math.abs(num);
  const raw = opts.precision !== undefined ? abs.toFixed(opts.precision) : String(abs);
  const dot = raw.indexOf('.');
  const intPart = dot >= 0 ? raw.slice(0, dot) : raw;
  const decPart = dot >= 0 ? raw.slice(dot + 1) : undefined;
  let out =
    (neg ? '-' : '') +
    (opts.currency
      ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandSep)
      : intPart);
  if (decPart !== undefined) out += opts.decimalSep + decPart;
  return out;
}

function parseRaw(
  raw: string,
  opts: Opts,
  allowNeg: boolean
): { display: string; value: number | null } {
  if (!raw) return { display: '', value: null };

  // Strip all existing thousand separators
  const stripped = raw.replace(new RegExp(esc(opts.thousandSep), 'g'), '');
  const neg = allowNeg && stripped.startsWith('-');
  const body = neg ? stripped.slice(1) : stripped;

  // Split at first decimal separator
  const decIdx = body.indexOf(opts.decimalSep);
  let intStr: string;
  let decStr: string | null = null;
  let hasDecPoint = false;

  if (decIdx >= 0) {
    intStr = body.slice(0, decIdx).replace(/\D/g, '');
    const rd = body.slice(decIdx + 1).replace(/\D/g, '');
    decStr = opts.precision !== undefined ? rd.slice(0, opts.precision) : rd;
    hasDecPoint = true;
  } else {
    intStr = body.replace(/\D/g, '');
  }

  // Re-insert thousand separators into integer part
  const fmtInt =
    opts.currency && intStr
      ? intStr.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandSep)
      : intStr;

  const sign = neg ? '-' : '';
  let display = sign + fmtInt;
  // Only show decimal part when precision allows it
  if (hasDecPoint && (opts.precision === undefined || opts.precision > 0)) {
    display += opts.decimalSep + (decStr ?? '');
  }

  // Nothing meaningful typed yet
  if (!intStr && !neg) return { display, value: null };

  const valStr = sign + (intStr || '0') + (decStr !== null ? '.' + decStr : '');
  const parsed = parseFloat(valStr);
  return { display, value: isNaN(parsed) ? null : parsed };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value: valueProp,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      currency = false,
      thousandSeparator = ',',
      decimalSeparator = '.',
      prefix,
      suffix,
      controls = false,
      label,
      required = false,
      error,
      hint,
      size = 'md',
      rounded,
      className,
      wrapperClassName,
      disabled,
      placeholder,
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    } = props;

    const isControlled = valueProp !== undefined;

    const opts = useMemo<Opts>(
      () => ({ thousandSep: thousandSeparator, decimalSep: decimalSeparator, currency, precision }),
      [thousandSeparator, decimalSeparator, currency, precision]
    );

    const [internalValue, setInternalValue] = useState<number | null>(
      defaultValue !== undefined ? defaultValue : null
    );
    const currentValue = isControlled ? (valueProp ?? null) : internalValue;

    const [displayText, setDisplayText] = useState<string>(() =>
      numToDisplay(isControlled ? valueProp : defaultValue, {
        thousandSep: thousandSeparator,
        decimalSep: decimalSeparator,
        currency,
        precision,
      })
    );

    const isFocused = useRef(false);

    // Sync display when controlled value changes from outside (not while user is typing)
    useEffect(() => {
      if (isControlled && !isFocused.current) {
        setDisplayText(numToDisplay(valueProp ?? null, opts));
      }
    }, [valueProp, opts, isControlled]);

    const commit = useCallback(
      (newVal: number | null, newDisplay: string) => {
        setDisplayText(newDisplay);
        if (!isControlled) setInternalValue(newVal);
        onChange?.(newVal, newDisplay);
      },
      [isControlled, onChange]
    );

    const clampAndFormat = useCallback(
      (val: number | null): { value: number | null; display: string } => {
        if (val === null) return { value: null, display: '' };
        let v = val;
        if (min !== undefined && v < min) v = min;
        if (max !== undefined && v > max) v = max;
        if (precision !== undefined) v = parseFloat(v.toFixed(precision));
        return { value: v, display: numToDisplay(v, opts) };
      },
      [min, max, precision, opts]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const allowNeg = min === undefined || min < 0;
        const { display, value } = parseRaw(raw, opts, allowNeg);
        commit(value, display);
      },
      [opts, min, commit]
    );

    const adjust = useCallback(
      (delta: number) => {
        if (disabled) return;
        const { value, display } = clampAndFormat((currentValue ?? 0) + delta);
        commit(value, display);
      },
      [disabled, currentValue, clampAndFormat, commit]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); adjust(step); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); adjust(-step); }
        onKeyDown?.(e);
      },
      [adjust, step, onKeyDown]
    );

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        isFocused.current = true;
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        isFocused.current = false;
        // Clean up display on blur (e.g. remove trailing decimal point "1,000." → "1,000")
        const { value: clamped, display: cleanDisplay } = clampAndFormat(currentValue);
        if (cleanDisplay !== displayText) setDisplayText(cleanDisplay);
        // Fire onChange only if numeric value changed (e.g. clamped to min/max)
        if (clamped !== currentValue) {
          if (!isControlled) setInternalValue(clamped);
          onChange?.(clamped, cleanDisplay);
        }
        onBlur?.(e);
      },
      [currentValue, displayText, clampAndFormat, isControlled, onChange, onBlur]
    );

    return (
      <div
        className={cn(
          'dsg-input-root',
          `dsg-input-root--${size}`,
          error && 'dsg-input-root--error',
          disabled && 'dsg-input-root--disabled',
          className
        )}
      >
        {label && (
          <label className={cn('dsg-input__label', required && 'dsg-input__label--required')}>
            {label}
          </label>
        )}

        <div
          className={cn(
            'dsg-input-wrapper',
            'dsg-input-number-wrapper',
            prefix && 'dsg-input-number-wrapper--has-prefix',
            suffix && 'dsg-input-number-wrapper--has-suffix',
            controls && 'dsg-input-number-wrapper--has-controls',
            rounded && `dsg-input-wrapper--rounded-${rounded}`,
            wrapperClassName
          )}
        >
          {prefix && (
            <span className="dsg-input-number__prefix" aria-hidden="true">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            type="text"
            inputMode={precision === 0 ? 'numeric' : 'decimal'}
            className="dsg-input__field dsg-input-number__field"
            value={displayText}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {suffix && (
            <span className="dsg-input-number__suffix" aria-hidden="true">
              {suffix}
            </span>
          )}

          {controls && (
            <div className="dsg-input-number__controls" aria-hidden="true">
              <button
                type="button"
                tabIndex={-1}
                className="dsg-input-number__btn dsg-input-number__btn--up"
                disabled={disabled || (max !== undefined && currentValue !== null && currentValue >= max)}
                onMouseDown={(e) => { e.preventDefault(); adjust(step); }}
              >
                <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                  <path
                    d="M1 5L5 1L9 5"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="dsg-input-number__btn dsg-input-number__btn--down"
                disabled={disabled || (min !== undefined && currentValue !== null && currentValue <= min)}
                onMouseDown={(e) => { e.preventDefault(); adjust(-step); }}
              >
                <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {error && (
          <span className="dsg-input__error-msg" role="alert">
            {error}
          </span>
        )}
        {!error && hint && <span className="dsg-input__hint">{hint}</span>}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber';
