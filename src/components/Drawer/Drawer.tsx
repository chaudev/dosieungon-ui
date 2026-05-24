import React, { useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Drawer.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: ReactNode;
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Add panel edge, header, and footer borders */
  bordered?: boolean;
  /** Border-radius preset for the drawer panel */
  rounded?: Rounded;
  className?: string;
  bodyClassName?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  placement = 'right',
  size = 'md',
  rounded,
  title,
  hideCloseButton = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  bordered = false,
  className,
  bodyClassName,
  footer,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${sw}px`;
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    };
  }, [open]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, handleClose]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        ref={overlayRef}
        className={cn('dsg-drawer-overlay', visible && 'dsg-drawer-overlay--visible')}
        onClick={() => { if (closeOnBackdrop) handleClose(); }}
        aria-hidden="true"
      />
      <div
        className={cn(
          'dsg-drawer',
          `dsg-drawer--${placement}`,
          `dsg-drawer--${size}`,
          visible && 'dsg-drawer--visible',
          bordered && 'dsg-drawer--bordered',
          rounded && `dsg-drawer--rounded-${rounded}`,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {!hideCloseButton && (
          <button
            type="button"
            className="dsg-drawer__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {title != null && (
          <div className="dsg-drawer__header">
            <h2 className="dsg-drawer__title">{title}</h2>
          </div>
        )}
        <div className={cn('dsg-drawer__body', bodyClassName)}>
          {children}
        </div>
        {footer && <div className="dsg-drawer__footer">{footer}</div>}
      </div>
    </>,
    document.body
  );
};
