import React, { useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Drawer.css';
import { cn } from '../../utils/cn';

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
  title,
  hideCloseButton = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
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
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${sw}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {(title != null || !hideCloseButton) && (
          <div className="dsg-drawer__header">
            {title != null && <h2 className="dsg-drawer__title">{title}</h2>}
            {!hideCloseButton && (
              <button
                type="button"
                className="dsg-drawer__close"
                onClick={handleClose}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
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
