import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import '../../styles/variables.css';
import './Checkbox.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode;
  indeterminate?: boolean;
  size?: CheckboxSize;
  /** Border-radius preset for the checkbox indicator */
  rounded?: Rounded;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, checked, size = 'md', rounded, disabled, className, onChange, ...props }, ref) => {
    const isChecked = checked ?? false;

    return (
      <label
        className={cn(
          'dsg-checkbox',
          `dsg-checkbox--${size}`,
          isChecked && !indeterminate && 'dsg-checkbox--checked',
          indeterminate && 'dsg-checkbox--indeterminate',
          disabled && 'dsg-checkbox--disabled',
          rounded && `dsg-checkbox--rounded-${rounded}`,
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="dsg-checkbox__input"
          checked={isChecked}
          disabled={disabled}
          onChange={onChange}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          {...props}
        />
        <span className="dsg-checkbox__indicator" aria-hidden="true">
          <span className="dsg-checkbox__check">
            {indeterminate ? (
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                <path d="M1 1H9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </span>
        {label && <span className="dsg-checkbox__label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
