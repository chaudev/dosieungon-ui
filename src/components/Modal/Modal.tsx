import React, { useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Modal.css';
import { cn } from '../../utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Controls open state */
  open: boolean;
  /** Called when user closes the modal */
  onClose: () => void;
  /** Modal title shown in the header */
  title?: ReactNode;
  /** Width preset */
  size?: ModalSize;
  /** Close when clicking the backdrop */
  closeOnBackdrop?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
  /** Additional class on the modal panel */
  className?: string;
  /** Additional class on the body area */
  bodyClassName?: string;
  children?: ReactNode;
  /** Content rendered in the footer area */
  footer?: ReactNode;
  /** Hide the × close button */
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  bodyClassName,
  children,
  footer,
  hideCloseButton = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle mount/unmount with animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame to trigger CSS transition
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
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  // Escape key
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
    <div
      ref={overlayRef}
      className={cn('dsg-modal-overlay', visible && 'dsg-modal-overlay--visible')}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === overlayRef.current) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div
        className={cn('dsg-modal', `dsg-modal--${size}`, className)}
        role="document"
      >
        {(title != null || !hideCloseButton) && (
          <div className="dsg-modal__header">
            {title != null && (
              <h2 className="dsg-modal__title">{title}</h2>
            )}
            {!hideCloseButton && (
              <button
                className="dsg-modal__close"
                onClick={handleClose}
                aria-label="Close"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className={cn('dsg-modal__body', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="dsg-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
