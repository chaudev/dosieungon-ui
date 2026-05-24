import React, { HTMLAttributes, MouseEvent, ReactNode, forwardRef } from 'react';
import '../../styles/variables.css';
import './Breadcrumb.css';
import { cn } from '../../utils/cn';

export type BreadcrumbSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbItem {
  /** Text or node to display */
  label: ReactNode;
  /** If provided, renders the item as an <a> tag */
  href?: string;
  /** If provided (and no href), renders the item as a <button> */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Array of breadcrumb items — the last item is treated as the current page */
  items: BreadcrumbItem[];
  /** Custom separator between items — defaults to "/" */
  separator?: ReactNode;
  size?: BreadcrumbSize;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', size = 'md', className, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Breadcrumb" {...props}>
        <ol
          className={cn(
            'dsg-breadcrumb',
            size !== 'md' && `dsg-breadcrumb--${size}`,
            className
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="dsg-breadcrumb__item">
                {index > 0 && (
                  <span className="dsg-breadcrumb__separator" aria-hidden="true">
                    {separator}
                  </span>
                )}

                {isLast ? (
                  <span className="dsg-breadcrumb__current" aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a href={item.href} className="dsg-breadcrumb__link">
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button
                    type="button"
                    className="dsg-breadcrumb__link"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="dsg-breadcrumb__link" style={{ cursor: 'default' }}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
