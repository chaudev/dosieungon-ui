import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Popconfirm.css';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';

export type PopconfirmPlacement =
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight'
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom';

export interface PopconfirmProps {
  /** Confirmation question (required) */
  title: ReactNode;
  /** Optional description shown below the title */
  description?: ReactNode;
  /** Icon shown next to the title. Defaults to a warning circle */
  icon?: ReactNode;
  /** Placement relative to the trigger. Default: 'top' */
  placement?: PopconfirmPlacement;
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Called when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Called when OK is clicked. Return a Promise to show loading on the button */
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** Called when Cancel is clicked */
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** OK button text. Default: 'OK' */
  okText?: ReactNode;
  /** Cancel button text. Default: 'Cancel' */
  cancelText?: ReactNode;
  /** Variant for the OK button. Default: 'danger' */
  okType?: ButtonVariant;
  /** Show the directional arrow. Default: true */
  arrow?: boolean;
  /** Disable the trigger so the popconfirm never opens */
  disabled?: boolean;
  /** Extra class applied to the floating overlay */
  overlayClassName?: string;
  /** Single trigger element */
  children: ReactNode;
}

const GAP = 8;

function getPos(
  trigRect: DOMRect,
  tipRect: DOMRect,
  placement: PopconfirmPlacement,
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

const WarningIcon = () => (
  <svg
    className="dsg-popconfirm-icon"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z" />
    <path d="M7.25 5.25a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
  </svg>
);

export const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  icon,
  placement = 'top',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  okType = 'danger',
  arrow = true,
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
  const [okLoading, setOkLoading] = useState(false);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!open);
  }, [disabled, open, setOpen]);

  // Effect 1: control mounted/unmounted state
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 160);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Effect 2: after overlay is mounted in the DOM, calculate position then animate in
  useEffect(() => {
    if (!mounted || !open) return;
    const r1 = requestAnimationFrame(() => {
      updatePos();
      const r2 = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [mounted, open, updatePos]);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        overlayRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, setOpen]);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onCancel?.(e);
      setOpen(false);
    },
    [onCancel, setOpen],
  );

  const handleOk = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const result = onConfirm?.(e);
      if (result instanceof Promise) {
        setOkLoading(true);
        try {
          await result;
        } finally {
          setOkLoading(false);
        }
      }
      setOpen(false);
    },
    [onConfirm, setOpen],
  );

  const overlay =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="false"
            className={cn(
              'dsg-popconfirm-overlay',
              `dsg-popconfirm-overlay--${placement}`,
              visible && 'dsg-popconfirm-overlay--visible',
              overlayClassName,
            )}
            style={{ top: pos.top, left: pos.left }}
          >
            {arrow && <div className="dsg-popconfirm-arrow" />}
            <div className="dsg-popconfirm-inner">
              <div className="dsg-popconfirm-body">
                <span className="dsg-popconfirm-icon-wrap">
                  {icon !== undefined ? icon : <WarningIcon />}
                </span>
                <div className="dsg-popconfirm-content">
                  <div className="dsg-popconfirm-title">{title}</div>
                  {description && (
                    <div className="dsg-popconfirm-description">{description}</div>
                  )}
                </div>
              </div>
              <div className="dsg-popconfirm-footer">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
                <Button
                  size="sm"
                  variant={okType}
                  loading={okLoading}
                  onClick={handleOk}
                >
                  {okText}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="dsg-popconfirm-trigger"
        onClick={toggle}
      >
        {children}
      </span>
      {overlay}
    </>
  );
};

Popconfirm.displayName = 'Popconfirm';
