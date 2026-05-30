import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Tooltip.css';
import { cn } from '../../utils/cn';

export type TooltipPlacement =
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight'
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom';

export type TooltipTrigger = 'hover' | 'click' | 'focus';

export interface TooltipProps {
  /** Tooltip content — set to null/undefined to disable */
  title: ReactNode;
  /** Placement relative to the trigger. Default: 'top' */
  placement?: TooltipPlacement;
  /** How to activate the tooltip. Default: 'hover' */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Called when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Custom background + arrow color */
  color?: string;
  /** Show the directional arrow. Default: true */
  arrow?: boolean;
  /** Delay before showing (ms). Default: 100 */
  mouseEnterDelay?: number;
  /** Delay before hiding (ms). Default: 100 */
  mouseLeaveDelay?: number;
  /** Disable the tooltip entirely */
  disabled?: boolean;
  /** Extra class applied to the overlay */
  overlayClassName?: string;
  /** Single trigger element */
  children: ReactNode;
}

const GAP = 8; // px between trigger edge and overlay edge (including arrow tip)

/** Resolve any CSS color string (including var(--...)) and return '#fff' or '#18181b'. */
function contrastColor(color: string): string {
  if (typeof document === 'undefined') return '#fff';
  const el = document.createElement('div');
  el.style.backgroundColor = color;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const bg = getComputedStyle(el).backgroundColor;
  document.body.removeChild(el);
  const match = bg.match(/\d+/g);
  if (!match) return '#fff';
  const [r, g, b] = match.map(Number);
  // WCAG relative luminance approximation
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? '#18181b' : '#fff';
}

function getPos(
  trigRect: DOMRect,
  tipRect: DOMRect,
  placement: TooltipPlacement,
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = trigRect.top - tipRect.height - GAP;
      left = trigRect.left + trigRect.width / 2 - tipRect.width / 2;
      break;
    case 'topLeft':
      top = trigRect.top - tipRect.height - GAP;
      left = trigRect.left;
      break;
    case 'topRight':
      top = trigRect.top - tipRect.height - GAP;
      left = trigRect.right - tipRect.width;
      break;
    case 'bottom':
      top = trigRect.bottom + GAP;
      left = trigRect.left + trigRect.width / 2 - tipRect.width / 2;
      break;
    case 'bottomLeft':
      top = trigRect.bottom + GAP;
      left = trigRect.left;
      break;
    case 'bottomRight':
      top = trigRect.bottom + GAP;
      left = trigRect.right - tipRect.width;
      break;
    case 'left':
      top = trigRect.top + trigRect.height / 2 - tipRect.height / 2;
      left = trigRect.left - tipRect.width - GAP;
      break;
    case 'leftTop':
      top = trigRect.top;
      left = trigRect.left - tipRect.width - GAP;
      break;
    case 'leftBottom':
      top = trigRect.bottom - tipRect.height;
      left = trigRect.left - tipRect.width - GAP;
      break;
    case 'right':
      top = trigRect.top + trigRect.height / 2 - tipRect.height / 2;
      left = trigRect.right + GAP;
      break;
    case 'rightTop':
      top = trigRect.top;
      left = trigRect.right + GAP;
      break;
    case 'rightBottom':
      top = trigRect.bottom - tipRect.height;
      left = trigRect.right + GAP;
      break;
  }

  // Clamp to viewport with 8px margin
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  left = Math.max(8, Math.min(left, vw - tipRect.width - 8));
  top = Math.max(8, Math.min(top, vh - tipRect.height - 8));

  return { top, left };
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  placement = 'top',
  trigger = 'hover',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  color,
  arrow = true,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  disabled = false,
  overlayClassName,
  children,
}) => {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? openProp! : internalOpen;

  const [mounted, setMounted] = useState(defaultOpen);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const [textColor, setTextColor] = useState('#fff');

  // Recompute text contrast whenever custom color changes
  useEffect(() => {
    if (!color) { setTextColor('#fff'); return; }
    setTextColor(contrastColor(color));
  }, [color]);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  const updatePos = useCallback(() => {
    if (!triggerRef.current || !overlayRef.current) return;
    const tRect = triggerRef.current.getBoundingClientRect();
    const oRect = overlayRef.current.getBoundingClientRect();
    setPos(getPos(tRect, oRect, placement));
  }, [placement]);

  const setOpen = useCallback(
    (val: boolean) => {
      if (!isControlled) setInternalOpen(val);
      onOpenChange?.(val);
    },
    [isControlled, onOpenChange],
  );

  const show = useCallback(() => {
    if (disabled || !title) return;
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    showTimer.current = setTimeout(() => setOpen(true), mouseEnterDelay);
  }, [disabled, title, mouseEnterDelay, setOpen]);

  const hide = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    hideTimer.current = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }, [mouseLeaveDelay, setOpen]);

  const toggle = useCallback(() => {
    if (open) hide(); else show();
  }, [open, show, hide]);

  // Mount → compute position → animate in / animate out → unmount
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r1 = requestAnimationFrame(() => {
        updatePos();
        const r2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 160);
      return () => clearTimeout(t);
    }
  }, [open, updatePos]);

  // Re-compute position on scroll / resize
  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePos]);

  // Escape key closes tooltip
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  // Outside click closes click-triggered tooltips
  useEffect(() => {
    if (!open || !triggers.includes('click')) return;
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        overlayRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, triggers, setOpen]);

  // Build trigger event props
  const hoverProps = triggers.includes('hover')
    ? { onMouseEnter: show, onMouseLeave: hide }
    : {};
  const focusProps = triggers.includes('focus')
    ? { onFocus: show, onBlur: hide }
    : {};
  const clickProps = triggers.includes('click')
    ? { onClick: toggle }
    : {};

  const overlay =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={overlayRef}
            role="tooltip"
            className={cn(
              'dsg-tooltip-overlay',
              `dsg-tooltip-overlay--${placement}`,
              visible && 'dsg-tooltip-overlay--visible',
              overlayClassName,
            )}
            style={{ top: pos.top, left: pos.left }}
          >
            {arrow && (
              <div
                className="dsg-tooltip-arrow"
                style={color ? { background: color } : undefined}
              />
            )}
            <div
              className="dsg-tooltip-inner"
              style={color ? { background: color, color: textColor } : undefined}
            >
              {title}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="dsg-tooltip-trigger"
        {...hoverProps}
        {...focusProps}
        {...clickProps}
      >
        {children}
      </span>
      {overlay}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
