import React, {
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import '../../styles/variables.css';
import './Segmented.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type SegmentedValue = string | number;
export type SegmentedSize = 'sm' | 'md' | 'lg';

export interface SegmentedOption {
  /** Display label */
  label: ReactNode;
  /** Unique value for this segment */
  value: SegmentedValue;
  /** Disable this individual segment */
  disabled?: boolean;
  /** Optional icon rendered before the label */
  icon?: ReactNode;
}

/** Options can be plain strings/numbers or full option objects */
export type SegmentedRawOption = SegmentedValue | SegmentedOption;

export interface SegmentedProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** List of segment options */
  options: SegmentedRawOption[];
  /** Controlled selected value */
  value?: SegmentedValue;
  /** Uncontrolled initial value — defaults to first option */
  defaultValue?: SegmentedValue;
  /** Called when the active segment changes */
  onChange?: (value: SegmentedValue) => void;
  /** Size preset */
  size?: SegmentedSize;
  /** Disable every segment */
  disabled?: boolean;
  /** Stretch to fill container — each segment shares space equally */
  block?: boolean;
  /** Bold the active segment label — default false */
  activeBold?: boolean;
  /** Background color of the track */
  background?: string;
  /** Background color of the active indicator */
  activeBackground?: string;
  /** Text color of inactive segments */
  textColor?: string;
  /** Text color of the active segment */
  activeTextColor?: string;
  /** Border-radius preset */
  rounded?: Rounded;
}

function normalize(opt: SegmentedRawOption): SegmentedOption {
  if (typeof opt === 'string' || typeof opt === 'number') {
    return { label: String(opt), value: opt };
  }
  return opt;
}

export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(
  (
    {
      options: rawOptions,
      value: valueProp,
      defaultValue,
      onChange,
      size = 'md',
      disabled = false,
      block = false,
      activeBold = false,
      background,
      activeBackground,
      textColor,
      activeTextColor,
      rounded,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const options = rawOptions.map(normalize);

    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = useState<SegmentedValue>(
      () => defaultValue ?? options[0]?.value
    );

    const selected = isControlled ? valueProp : internal;
    const selectedIdx = options.findIndex((o) => o.value === selected);

    // Refs to each item button — used to measure position for the indicator
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Indicator geometry — driven by measured DOM position, not CSS math
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    // Sync indicator to the selected item's actual offsetLeft / offsetWidth.
    // useLayoutEffect fires before the browser paints, so there's no visible
    // flash even on first render.
    useLayoutEffect(() => {
      const el = itemRefs.current[selectedIdx];
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }, [selectedIdx, size, block]); // re-measure when layout-affecting props change

    // Enable the CSS transition only after the first paint so the indicator
    // jumps to its initial position without animating from 0.
    const [ready, setReady] = useState(false);
    useEffect(() => {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }, []);

    const handleSelect = (opt: SegmentedOption) => {
      if (disabled || opt.disabled) return;
      if (opt.value === selected) return;
      if (!isControlled) setInternal(opt.value);
      onChange?.(opt.value);
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'dsg-segmented',
          `dsg-segmented--${size}`,
          block && 'dsg-segmented--block',
          activeBold && 'dsg-segmented--active-bold',
          disabled && 'dsg-segmented--disabled',
          rounded && `dsg-segmented--rounded-${rounded}`,
          className
        )}
        style={{
          ...(background && { '--_bg': background }),
          ...(activeBackground && { '--_active-bg': activeBackground }),
          ...(textColor && { '--_text': textColor }),
          ...(activeTextColor && { '--_active-text': activeTextColor }),
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {selectedIdx >= 0 && (
          <span
            className={cn(
              'dsg-segmented__indicator',
              ready && 'dsg-segmented__indicator--ready'
            )}
            style={{ left: indicator.left, width: indicator.width }}
            aria-hidden="true"
          />
        )}

        {options.map((opt, i) => {
          const isSelected = opt.value === selected;
          const isDisabled = disabled || !!opt.disabled;

          return (
            <button
              key={String(opt.value)}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              className={cn(
                'dsg-segmented__item',
                isSelected && 'dsg-segmented__item--selected',
                isDisabled && 'dsg-segmented__item--disabled'
              )}
              onClick={() => handleSelect(opt)}
            >
              {opt.icon && (
                <span className="dsg-segmented__icon" aria-hidden="true">
                  {opt.icon}
                </span>
              )}
              {opt.label != null && opt.label !== '' && (
                <span className="dsg-segmented__label">{opt.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

Segmented.displayName = 'Segmented';
