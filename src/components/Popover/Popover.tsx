import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Popover.css';
import { cn } from '../../utils/cn';

export type PopoverPlacement =
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight'
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom';

export type PopoverTrigger = 'hover' | 'click' | 'focus';

export interface PopoverProps {
  /** Header title of the popover card */
  title?: ReactNode;
  /** Body content of the popover card */
  content: ReactNode;
  /** Placement relative to the trigger. Default: 'top' */
  placement?: PopoverPlacement;
  /** How to activate the popover. Default: 'click' */
  trigger?: PopoverTrigger | PopoverTrigger[];
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Called when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Show the directional arrow. Default: true */
  arrow?: boolean;
  /** Show a close × button in the header. Default: false */
  showCloseButton?: boolean;
  /** Delay before showing on hover (ms). Default: 100 */
  mouseEnterDelay?: number;
  /** Delay before hiding on hover (ms). Default: 100 */
  mouseLeaveDelay?: number;
  /** Disable the popover entirely */
  disabled?: boolean;
  /** Extra class applied to the overlay */
  overlayClassName?: string;
  /** Single trigger element */
  children: ReactNode;
}

const GAP = 8;

function getPos(
  trigRect: DOMRect,
  tipRect: DOMRect,
  placement: PopoverPlacement,
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

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  left = Math.max(8, Math.min(left, vw - tipRect.width - 8));
  top = Math.max(8, Math.min(top, vh - tipRect.height - 8));

  return { top, left };
}

export const Popover: React.FC<PopoverProps> = ({
  title,
  content,
  placement = 'top',
  trigger = 'click',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  arrow = true,
  showCloseButton = false,
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
    if (disabled) return;
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    showTimer.current = setTimeout(() => setOpen(true), mouseEnterDelay);
  }, [disabled, mouseEnterDelay, setOpen]);

  const hide = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    hideTimer.current = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }, [mouseLeaveDelay, setOpen]);

  const toggle = useCallback(() => {
    if (open) hide(); else show();
  }, [open, show, hide]);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  // Outside click closes the popover
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        overlayRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, setOpen]);

  const hoverProps = triggers.includes('hover')
    ? { onMouseEnter: show, onMouseLeave: hide }
    : {};
  const focusProps = triggers.includes('focus')
    ? { onFocus: show, onBlur: hide }
    : {};
  const clickProps = triggers.includes('click')
    ? { onClick: toggle }
    : {};

  const hasTitle = title !== undefined && title !== null;

  const overlay =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            className={cn(
              'dsg-popover-overlay',
              `dsg-popover-overlay--${placement}`,
              visible && 'dsg-popover-overlay--visible',
              overlayClassName,
            )}
            style={{ top: pos.top, left: pos.left }}
          >
            {arrow && <div className="dsg-popover-arrow" />}
            <div className="dsg-popover-inner">
              {hasTitle && (
                <div className="dsg-popover-header">
                  <span>{title}</span>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="dsg-popover-close"
                      onClick={() => setOpen(false)}
                      aria-label="Close"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M1 1l10 10M11 1L1 11"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {content && (
                <div
                  className={cn(
                    'dsg-popover-body',
                    !hasTitle && 'dsg-popover-body--no-header',
                  )}
                >
                  {content}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="dsg-popover-trigger"
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

Popover.displayName = 'Popover';
