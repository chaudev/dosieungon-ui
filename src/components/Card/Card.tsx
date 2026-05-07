import React, { HTMLAttributes, ReactNode } from 'react';
import '../../styles/variables.css';
import './Card.css';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Content for the card header */
  header?: ReactNode;
  /** Content for the card footer */
  footer?: ReactNode;
  /** Add hover lift effect */
  hoverable?: boolean;
  /** Make the card interactive (clickable) */
  clickable?: boolean;
  /** Add a shadow instead of a border */
  shadow?: boolean;
  /** Class applied to the body section */
  bodyClassName?: string;
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  hoverable = false,
  clickable = false,
  shadow = false,
  bodyClassName,
  children,
  className,
  onClick,
  ...props
}) => {
  const Tag = clickable ? 'button' : 'div';

  return (
    <Tag
      className={cn(
        'dsg-card',
        hoverable && 'dsg-card--hoverable',
        clickable && 'dsg-card--clickable',
        shadow && 'dsg-card--shadow',
        className
      )}
      onClick={onClick}
      type={clickable ? 'button' : undefined}
      {...(props as any)}
    >
      {header && <div className="dsg-card__header">{header}</div>}
      <div className={cn('dsg-card__body', bodyClassName)}>{children}</div>
      {footer && <div className="dsg-card__footer">{footer}</div>}
    </Tag>
  );
};
