import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import '../../styles/variables.css';
import './Switch.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode;
  /** Label position relative to switch */
  labelPosition?: 'left' | 'right';
  size?: SwitchSize;
  /** Border-radius preset for the track — default is full (pill) */
  rounded?: Rounded;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, labelPosition = 'right', size = 'md', rounded, checked = false, disabled, className, onChange, ...props }, ref) => {
    const labelEl = label && <span className="dsg-switch__label">{label}</span>;

    return (
      <label
        className={cn(
          'dsg-switch',
          `dsg-switch--${size}`,
          checked && 'dsg-switch--checked',
          disabled && 'dsg-switch--disabled',
          rounded && `dsg-switch--rounded-${rounded}`,
          className
        )}
      >
        {labelPosition === 'left' && labelEl}
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className="dsg-switch__input"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          aria-checked={checked}
          {...props}
        />
        <span className="dsg-switch__track" aria-hidden="true">
          <span className="dsg-switch__thumb" />
        </span>
        {labelPosition === 'right' && labelEl}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
