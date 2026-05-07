import React, { HTMLAttributes, ReactNode, MouseEvent } from 'react';
import '../../styles/variables.css';
import './Chip.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

export type ChipVariant = 'filled' | 'outlined';
export type ChipColor = 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  /** Show a close/remove button */
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Make the chip interactive */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  /** Border-radius preset — default is full (pill) */
  rounded?: Rounded;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'filled',
  color = 'primary',
  size = 'md',
  onClose,
  onClick,
  rounded,
  children,
  className,
  ...props
}) => {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={cn(
        'dsg-chip',
        `dsg-chip--${variant}`,
        `dsg-chip--${color}`,
        `dsg-chip--${size}`,
        onClick && 'dsg-chip--clickable',
        rounded && `dsg-chip--rounded-${rounded}`,
        className
      )}
      onClick={onClick as any}
      {...(props as any)}
    >
      {children}
      {onClose && (
        <button
          type="button"
          className="dsg-chip__close"
          onClick={(e) => { e.stopPropagation(); onClose(e); }}
          aria-label="Remove"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </Tag>
  );
};
