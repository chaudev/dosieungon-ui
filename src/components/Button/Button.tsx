import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import '../../styles/variables.css';
import './Button.css';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Square button for icons only — hides children text */
  iconOnly?: boolean;
  /** Icon rendered before the label */
  leftIcon?: ReactNode;
  /** Icon rendered after the label */
  rightIcon?: ReactNode;
  /** For outline variant — color variant (danger | warning | secondary) */
  color?: 'danger' | 'warning' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      color,
      children,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'dsg-btn',
          `dsg-btn--${variant}`,
          `dsg-btn--${size}`,
          color && `dsg-btn--${color}`,
          iconOnly && 'dsg-btn--icon-only',
          loading && 'dsg-btn--loading',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="dsg-btn__spinner" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="dsg-btn__icon" aria-hidden="true">{leftIcon}</span>
        ) : null}

        {!iconOnly && children}

        {!loading && rightIcon && (
          <span className="dsg-btn__icon" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
