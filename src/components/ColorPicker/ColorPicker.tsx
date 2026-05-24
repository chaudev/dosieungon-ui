import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './ColorPicker.css';
import { cn } from '../../utils/cn';

// ── Color math ────────────────────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d   = max - min;
  let h = 0;
  if (d !== 0) {
    if      (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else                h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, max === 0 ? 0 : d / max, max];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function hexToHsv(hex: string): [number, number, number] | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(...rgb) : null;
}

// ── Gradient utilities ────────────────────────────────────────────────────────

export interface GradientStop {
  id: string;
  color: string;   // uppercase hex, e.g. "#FF0000"
  position: number; // 0–1
}

let _gid = 0;
function nextId(): string { return `cp${++_gid}`; }

function parseGradientCss(css: string): { stops: GradientStop[]; angle: number } | null {
  const m = css.match(/linear-gradient\(\s*(\d+(?:\.\d+)?)deg\s*,\s*([\s\S]+?)\s*\)$/);
  if (!m) return null;
  const angle = parseFloat(m[1]);
  const parts  = m[2].split(/,\s*(?=#)/);
  if (parts.length < 2) return null;
  const stops: GradientStop[] = parts.map(p => {
    const [color, pct] = p.trim().split(/\s+/);
    return { id: nextId(), color: color.toUpperCase(), position: parseFloat(pct) / 100 };
  });
  return { stops, angle };
}

function buildGradientCss(stops: GradientStop[], angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const s = sorted.map(st => `${st.color} ${Math.round(st.position * 100)}%`).join(', ');
  return `linear-gradient(${angle}deg, ${s})`;
}

function isGradient(value: string): boolean {
  return value.startsWith('linear-gradient');
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PRESETS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#000000', '#525252', '#A3A3A3', '#FFFFFF',
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColorPickerMode = 'solid' | 'gradient' | 'both';
export type ColorPickerSize = 'sm' | 'md' | 'lg';

export interface ColorPickerTriggerState {
  open: boolean;
  value: string;
}

export interface ColorPickerProps {
  /** Current value — hex string (`#RRGGBB`) for solid, CSS `linear-gradient(...)` for gradient */
  value?: string;
  /** Initial value for uncontrolled usage */
  defaultValue?: string;
  /** Called whenever the color changes */
  onChange?: (value: string) => void;
  /** Which modes to show — `'both'` renders Solid/Gradient tabs */
  mode?: ColorPickerMode;
  /** Disable the picker */
  disabled?: boolean;
  /** Size of the trigger button */
  size?: ColorPickerSize;
  /** Quick-access color presets */
  presets?: string[];
  /** Show the hex input field */
  showInput?: boolean;
  /** Show the preset swatches */
  showPresets?: boolean;
  /** Show the chevron arrow on the trigger button */
  showArrow?: boolean;
  /** Show the hex color code text on the trigger button */
  showColorCode?: boolean;
  /** Custom border-radius for the trigger button (number → px, string → as-is) */
  triggerRadius?: string | number;
  /** Replace the trigger entirely — ReactNode or render-prop receiving `{ open, value }` */
  trigger?: React.ReactNode | ((state: ColorPickerTriggerState) => React.ReactNode);
  /** Trigger placeholder when no value */
  placeholder?: string;
  /** Extra className on the root element */
  className?: string;
}

// ── SolidColorCanvas ──────────────────────────────────────────────────────────

interface CanvasProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}

function SolidColorCanvas({ hue, saturation, value, onChange }: CanvasProps) {
  const ref      = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const getPos = useCallback(
    (cx: number, cy: number) => {
      const el = ref.current;
      if (!el) return { s: saturation, v: value };
      const r = el.getBoundingClientRect();
      return {
        s: Math.max(0, Math.min(1, (cx - r.left) / r.width)),
        v: Math.max(0, Math.min(1, 1 - (cy - r.top)  / r.height)),
      };
    },
    [saturation, value]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      ref.current?.setPointerCapture(e.pointerId);
      const { s, v } = getPos(e.clientX, e.clientY);
      onChange(s, v);
    },
    [getPos, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const { s, v } = getPos(e.clientX, e.clientY);
      onChange(s, v);
    },
    [getPos, onChange]
  );

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  const [r, g, b] = hsvToRgb(hue, saturation, value);

  return (
    <div
      ref={ref}
      className="dsg-colorpicker__canvas"
      style={{ background: `hsl(${hue}, 100%, 50%)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="dsg-colorpicker__canvas-white" />
      <div className="dsg-colorpicker__canvas-black" />
      <div
        className="dsg-colorpicker__cursor"
        style={{
          left: `${saturation * 100}%`,
          top:  `${(1 - value) * 100}%`,
          background: rgbToHex(r, g, b),
        }}
      />
    </div>
  );
}

// ── HueSlider ─────────────────────────────────────────────────────────────────

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

function HueSlider({ hue, onChange }: HueSliderProps) {
  const ref      = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const getHue = useCallback(
    (cx: number) => {
      const el = ref.current;
      if (!el) return hue;
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(360, ((cx - r.left) / r.width) * 360));
    },
    [hue]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      ref.current?.setPointerCapture(e.pointerId);
      onChange(getHue(e.clientX));
    },
    [getHue, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onChange(getHue(e.clientX));
    },
    [getHue, onChange]
  );

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div
      ref={ref}
      className="dsg-colorpicker__hue"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="dsg-colorpicker__hue-thumb" style={{ left: `${(hue / 360) * 100}%` }} />
    </div>
  );
}

// ── SolidPicker ───────────────────────────────────────────────────────────────

interface SolidPickerProps {
  hex: string;
  onChange: (hex: string) => void;
  presets?: string[];
  showInput?: boolean;
  showPresets?: boolean;
}

function SolidPicker({
  hex,
  onChange,
  presets = DEFAULT_PRESETS,
  showInput  = true,
  showPresets = true,
}: SolidPickerProps) {
  // Internal HSV — decoupled from hex prop so hue is preserved during drag
  const lastEmitted = useRef(hex);
  const [h, setH] = useState(() => (hexToHsv(hex) ?? [0, 1, 1])[0]);
  const [s, setS] = useState(() => (hexToHsv(hex) ?? [0, 1, 1])[1]);
  const [v, setV] = useState(() => (hexToHsv(hex) ?? [0, 1, 1])[2]);
  const [inputVal, setInputVal] = useState(hex.replace('#', ''));

  // Sync from external (controlled) changes only
  useEffect(() => {
    if (hex !== lastEmitted.current) {
      const parsed = hexToHsv(hex);
      if (parsed) { setH(parsed[0]); setS(parsed[1]); setV(parsed[2]); }
      setInputVal(hex.replace('#', ''));
      lastEmitted.current = hex;
    }
  }, [hex]);

  const emit = useCallback(
    (nh: number, ns: number, nv: number) => {
      const newHex = rgbToHex(...hsvToRgb(nh, ns, nv));
      lastEmitted.current = newHex;
      onChange(newHex);
    },
    [onChange]
  );

  const handleCanvasChange = useCallback(
    (ns: number, nv: number) => { setS(ns); setV(nv); emit(h, ns, nv); },
    [h, emit]
  );

  const handleHueChange = useCallback(
    (nh: number) => { setH(nh); emit(nh, s, v); },
    [s, v, emit]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      setInputVal(raw);
      if (raw.length === 6) {
        const norm   = '#' + raw.toUpperCase();
        const parsed = hexToHsv(norm);
        if (parsed) {
          setH(parsed[0]); setS(parsed[1]); setV(parsed[2]);
          lastEmitted.current = norm;
          onChange(norm);
        }
      }
    },
    [onChange]
  );

  return (
    <div className="dsg-colorpicker__solid">
      <SolidColorCanvas hue={h} saturation={s} value={v} onChange={handleCanvasChange} />

      <div className="dsg-colorpicker__sliders">
        <div className="dsg-colorpicker__preview" style={{ background: hex }} />
        <HueSlider hue={h} onChange={handleHueChange} />
      </div>

      {showInput && (
        <div className="dsg-colorpicker__inputs">
          <span className="dsg-colorpicker__input-prefix">#</span>
          <input
            className="dsg-colorpicker__hex-input"
            value={inputVal}
            onChange={handleInputChange}
            onBlur={() => setInputVal(hex.replace('#', ''))}
            maxLength={6}
            spellCheck={false}
            autoComplete="off"
            aria-label="Hex color value"
          />
        </div>
      )}

      {showPresets && presets.length > 0 && (
        <div className="dsg-colorpicker__presets">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              className={cn(
                'dsg-colorpicker__preset',
                p.toUpperCase() === hex.toUpperCase() && 'dsg-colorpicker__preset--active'
              )}
              style={{ background: p }}
              title={p}
              onClick={() => {
                const norm   = p.toUpperCase();
                const parsed = hexToHsv(norm);
                if (parsed) { setH(parsed[0]); setS(parsed[1]); setV(parsed[2]); }
                lastEmitted.current = norm;
                onChange(norm);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── GradientPicker ────────────────────────────────────────────────────────────

interface GradientPickerProps {
  stops: GradientStop[];
  angle: number;
  onStopsChange: (stops: GradientStop[]) => void;
  onAngleChange: (angle: number) => void;
  presets?: string[];
  showPresets?: boolean;
}

function GradientPicker({
  stops,
  angle,
  onStopsChange,
  onAngleChange,
  presets,
  showPresets,
}: GradientPickerProps) {
  const [activeId, setActiveId] = useState(stops[0]?.id ?? '');
  const barRef      = useRef<HTMLDivElement>(null);
  const draggingId  = useRef<string | null>(null);
  const didDrag     = useRef(false);

  const activeStop = stops.find(s => s.id === activeId) ?? stops[0];

  const barPreview = useMemo(() => buildGradientCss(stops, 90), [stops]);

  const getBarPos = useCallback((cx: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (cx - r.left) / r.width));
  }, []);

  // Click on bar → add stop
  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDrag.current) { didDrag.current = false; return; }
      const pos    = getBarPos(e.clientX);
      const sorted = [...stops].sort((a, b) => a.position - b.position);
      let   color  = sorted[0]?.color ?? '#FFFFFF';
      for (const st of sorted) { if (st.position <= pos) color = st.color; }
      const newStop: GradientStop = { id: nextId(), color, position: pos };
      onStopsChange([...stops, newStop]);
      setActiveId(newStop.id);
    },
    [stops, getBarPos, onStopsChange]
  );

  const handleStopPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      draggingId.current = id;
      didDrag.current    = false;
      setActiveId(id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handleStopPointerMove = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (draggingId.current !== id) return;
      didDrag.current = true;
      const pos = getBarPos(e.clientX);
      onStopsChange(stops.map(st => st.id === id ? { ...st, position: pos } : st));
    },
    [stops, getBarPos, onStopsChange]
  );

  const handleStopPointerUp = useCallback(() => { draggingId.current = null; }, []);

  const handleDeleteActive = useCallback(() => {
    if (!activeStop || stops.length <= 2) return;
    const next = stops.filter(s => s.id !== activeStop.id);
    onStopsChange(next);
    setActiveId(next[0]?.id ?? '');
  }, [stops, activeStop, onStopsChange]);

  const handleStopColorChange = useCallback(
    (hex: string) => {
      if (!activeStop) return;
      onStopsChange(stops.map(s => s.id === activeStop.id ? { ...s, color: hex } : s));
    },
    [stops, activeStop, onStopsChange]
  );

  return (
    <div className="dsg-colorpicker__gradient">
      {/* Gradient bar with draggable stop handles */}
      <div className="dsg-colorpicker__gradient-wrap">
        <div
          ref={barRef}
          className="dsg-colorpicker__gradient-bar"
          style={{ background: barPreview }}
          onClick={handleBarClick}
        />
        <div className="dsg-colorpicker__gradient-stops">
          {stops.map(stop => (
            <div
              key={stop.id}
              className={cn('dsg-colorpicker__stop', stop.id === activeId && 'dsg-colorpicker__stop--active')}
              style={{ left: `${stop.position * 100}%`, background: stop.color }}
              onPointerDown={e => handleStopPointerDown(e, stop.id)}
              onPointerMove={e => handleStopPointerMove(e, stop.id)}
              onPointerUp={handleStopPointerUp}
              onClick={e => { e.stopPropagation(); setActiveId(stop.id); }}
            />
          ))}
        </div>
      </div>

      {/* Angle + delete stop */}
      <div className="dsg-colorpicker__gradient-controls">
        <div className="dsg-colorpicker__angle-row">
          <span className="dsg-colorpicker__angle-label">Angle</span>
          <input
            type="number"
            min={0}
            max={360}
            className="dsg-colorpicker__angle-input"
            value={angle}
            onChange={e => onAngleChange(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
            aria-label="Gradient angle"
          />
          <span className="dsg-colorpicker__angle-deg">°</span>
        </div>

        {stops.length > 2 && (
          <button
            type="button"
            className="dsg-colorpicker__stop-delete"
            onClick={handleDeleteActive}
            title="Remove selected stop"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Color picker for the active stop */}
      {activeStop && (
        <div className="dsg-colorpicker__stop-color">
          <SolidPicker
            hex={activeStop.color}
            onChange={handleStopColorChange}
            presets={presets}
            showInput
            showPresets={showPresets}
          />
        </div>
      )}
    </div>
  );
}

// ── ColorPicker (main export) ─────────────────────────────────────────────────

function makeDefaultStops(): GradientStop[] {
  return [
    { id: nextId(), color: '#0285F7', position: 0 },
    { id: nextId(), color: '#8B5CF6', position: 1 },
  ];
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      mode = 'both',
      disabled = false,
      size = 'md',
      presets = DEFAULT_PRESETS,
      showInput    = true,
      showPresets  = true,
      showArrow    = true,
      showColorCode = true,
      triggerRadius,
      trigger,
      placeholder = 'Pick a color',
      className,
    },
    ref
  ) => {
    const isControlled = valueProp !== undefined;

    const [internalValue, setInternalValue] = useState(() => {
      if (defaultValue) return defaultValue;
      if (mode === 'gradient') return buildGradientCss(makeDefaultStops(), 90);
      return '#0285F7';
    });

    const currentValue = isControlled ? valueProp! : internalValue;

    // Active panel
    const [activeMode, setActiveMode] = useState<'solid' | 'gradient'>(() => {
      if (mode === 'gradient') return 'gradient';
      if (mode === 'solid')    return 'solid';
      return isGradient(currentValue) ? 'gradient' : 'solid';
    });

    // Gradient internal state
    const [stops, setStops] = useState<GradientStop[]>(() => {
      if (isGradient(currentValue)) {
        return parseGradientCss(currentValue)?.stops ?? makeDefaultStops();
      }
      return makeDefaultStops();
    });
    const [angle, setAngle] = useState<number>(() =>
      isGradient(currentValue) ? (parseGradientCss(currentValue)?.angle ?? 90) : 90
    );

    const solidHex = isGradient(currentValue) ? (stops[0]?.color ?? '#0285F7') : currentValue;

    // Popover
    const [open, setOpen]   = useState(false);
    const [pos, setPos]     = useState({ top: 0, left: 0 });
    const triggerRef        = useRef<HTMLElement>(null);
    const popRef            = useRef<HTMLDivElement>(null);

    const computePos = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r  = el.getBoundingClientRect();
      const pw = 264;
      const ph = popRef.current?.offsetHeight ?? 440;
      let top  = r.bottom + 6;
      let left = r.left;
      if (top  + ph > window.innerHeight - 8) top  = r.top - ph - 6;
      if (top < 8) top = 8;
      if (left + pw > window.innerWidth  - 8) left = window.innerWidth - pw - 8;
      if (left < 8) left = 8;
      setPos({ top, left });
    }, []);

    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (
          !triggerRef.current?.contains(e.target as Node) &&
          !popRef.current?.contains(e.target as Node)
        ) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [open]);

    // After popover mounts, remeasure using its real height and reposition
    useEffect(() => {
      if (!open) return;
      const id = requestAnimationFrame(() => computePos());
      return () => cancelAnimationFrame(id);
    }, [open, computePos]);

    // Recompute position on scroll / resize so popover tracks the trigger
    useEffect(() => {
      if (!open) return;
      window.addEventListener('scroll', computePos, true);
      window.addEventListener('resize', computePos);
      return () => {
        window.removeEventListener('scroll', computePos, true);
        window.removeEventListener('resize', computePos);
      };
    }, [open, computePos]);

    const emit = useCallback((val: string) => {
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
    }, [isControlled, onChange]);

    const handleSolidChange = useCallback((hex: string) => emit(hex), [emit]);

    const handleStopsChange = useCallback(
      (newStops: GradientStop[]) => {
        setStops(newStops);
        emit(buildGradientCss(newStops, angle));
      },
      [angle, emit]
    );

    const handleAngleChange = useCallback(
      (newAngle: number) => {
        setAngle(newAngle);
        emit(buildGradientCss(stops, newAngle));
      },
      [stops, emit]
    );

    const handleModeSwitch = useCallback(
      (newMode: 'solid' | 'gradient') => {
        setActiveMode(newMode);
        if (newMode === 'solid') {
          emit(stops[0]?.color ?? '#0285F7');
        } else {
          const newStops = [
            { id: nextId(), color: solidHex, position: 0 as const },
            { id: nextId(), color: '#8B5CF6', position: 1 as const },
          ];
          setStops(newStops);
          emit(buildGradientCss(newStops, angle));
        }
      },
      [stops, solidHex, angle, emit]
    );

    const triggerLabel = isGradient(currentValue) ? 'Gradient' : currentValue;

    const handleToggle = useCallback(() => {
      if (disabled) return;
      if (open) { setOpen(false); } else { computePos(); setOpen(true); }
    }, [disabled, open, computePos]);

    const triggerRadiusStyle = triggerRadius !== undefined
      ? { borderRadius: typeof triggerRadius === 'number' ? `${triggerRadius}px` : triggerRadius }
      : undefined;

    return (
      <div ref={ref} className={cn('dsg-colorpicker', className)}>
        {trigger != null ? (
          /* ── Custom trigger ── */
          <span
            ref={triggerRef as React.RefObject<HTMLSpanElement>}
            onClick={handleToggle}
            style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            {typeof trigger === 'function'
              ? trigger({ open, value: currentValue })
              : trigger}
          </span>
        ) : (
          /* ── Default trigger button ── */
          <button
            ref={triggerRef as React.RefObject<HTMLButtonElement>}
            type="button"
            disabled={disabled}
            className={cn(
              'dsg-colorpicker__trigger',
              `dsg-colorpicker__trigger--${size}`,
              !showColorCode && !showArrow && 'dsg-colorpicker__trigger--icon-only',
              open && 'dsg-colorpicker__trigger--open'
            )}
            style={triggerRadiusStyle}
            onClick={handleToggle}
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <span className="dsg-colorpicker__swatch" style={{ background: currentValue }} />
            {showColorCode && (
              <span className="dsg-colorpicker__label">{triggerLabel || placeholder}</span>
            )}
            {showArrow && (
              <svg
                className="dsg-colorpicker__chevron"
                width="12" height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
        )}

        {open && typeof document !== 'undefined' && createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Color picker"
            className="dsg-colorpicker__popover"
            style={{ top: pos.top, left: pos.left }}
          >
            {mode === 'both' && (
              <div className="dsg-colorpicker__tabs" role="tablist">
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeMode === 'solid'}
                  className={cn('dsg-colorpicker__tab', activeMode === 'solid' && 'dsg-colorpicker__tab--active')}
                  onClick={() => handleModeSwitch('solid')}
                >
                  Solid
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeMode === 'gradient'}
                  className={cn('dsg-colorpicker__tab', activeMode === 'gradient' && 'dsg-colorpicker__tab--active')}
                  onClick={() => handleModeSwitch('gradient')}
                >
                  Gradient
                </button>
              </div>
            )}

            {activeMode === 'solid' ? (
              <SolidPicker
                hex={solidHex}
                onChange={handleSolidChange}
                presets={presets}
                showInput={showInput}
                showPresets={showPresets}
              />
            ) : (
              <GradientPicker
                stops={stops}
                angle={angle}
                onStopsChange={handleStopsChange}
                onAngleChange={handleAngleChange}
                presets={presets}
                showPresets={showPresets}
              />
            )}
          </div>,
          document.body
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
