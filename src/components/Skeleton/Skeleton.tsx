import React, { HTMLAttributes, ReactNode } from 'react';
import '../../styles/variables.css';
import './Skeleton.css';
import { cn } from '../../utils/cn';

// ── Types ────────────────────────────────────────────────────────────────────

export type SkeletonSize = 'sm' | 'md' | 'lg';
export type SkeletonAvatarShape = 'circle' | 'square';

export interface SkeletonAvatarConfig {
  size?: SkeletonSize;
  shape?: SkeletonAvatarShape;
}

export interface SkeletonTitleConfig {
  width?: string | number;
}

export interface SkeletonParagraphConfig {
  rows?: number;
  width?: string | number | Array<string | number>;
}

export interface SkeletonProps {
  /** When false, renders children instead of the skeleton */
  loading?: boolean;
  /** Show the moving shimmer animation */
  active?: boolean;
  /** Show an avatar placeholder on the left */
  avatar?: boolean | SkeletonAvatarConfig;
  /** Show a title line */
  title?: boolean | SkeletonTitleConfig;
  /** Show paragraph lines */
  paragraph?: boolean | SkeletonParagraphConfig;
  /** Use rounded (pill) corners on all elements */
  round?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface SkeletonButtonProps extends HTMLAttributes<HTMLDivElement> {
  size?: SkeletonSize;
  active?: boolean;
  round?: boolean;
  block?: boolean;
}

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: SkeletonSize;
  shape?: SkeletonAvatarShape;
  active?: boolean;
}

export interface SkeletonInputProps extends HTMLAttributes<HTMLDivElement> {
  size?: SkeletonSize;
  active?: boolean;
  block?: boolean;
}

export interface SkeletonImageProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normWidth(w: string | number): string {
  return typeof w === 'number' ? `${w}px` : w;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = 'md',
  active,
  round,
  block,
  className,
  ...props
}) => (
  <div
    className={cn(
      'dsg-skeleton-btn',
      size !== 'md' && `dsg-skeleton-btn--${size}`,
      round && 'dsg-skeleton-btn--round',
      block && 'dsg-skeleton-btn--block',
      active && 'dsg-skeleton-btn--active',
      className
    )}
    {...props}
  />
);
SkeletonButton.displayName = 'Skeleton.Button';

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  shape = 'circle',
  active,
  className,
  ...props
}) => (
  <div
    className={cn(
      'dsg-skeleton-avatar',
      size !== 'md' && `dsg-skeleton-avatar--${size}`,
      shape === 'square' && 'dsg-skeleton-avatar--square',
      active && 'dsg-skeleton-avatar--active',
      className
    )}
    {...props}
  />
);
SkeletonAvatar.displayName = 'Skeleton.Avatar';

const SkeletonInput: React.FC<SkeletonInputProps> = ({
  size = 'md',
  active,
  block,
  className,
  ...props
}) => (
  <div
    className={cn(
      'dsg-skeleton-input',
      size !== 'md' && `dsg-skeleton-input--${size}`,
      block && 'dsg-skeleton-input--block',
      active && 'dsg-skeleton-input--active',
      className
    )}
    {...props}
  />
);
SkeletonInput.displayName = 'Skeleton.Input';

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  active,
  className,
  ...props
}) => (
  <div
    className={cn(
      'dsg-skeleton-image',
      active && 'dsg-skeleton-image--active',
      className
    )}
    {...props}
  >
    <svg
      className="dsg-skeleton-image__icon"
      viewBox="0 0 96 96"
      width="40"
      height="40"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M82 12H14a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h68a4 4 0 0 0 4-4V16a4 4 0 0 0-4-4zM14 80V16h68v64H14z" />
      <circle cx="32" cy="34" r="8" />
      <path d="M10 70l22-20 14 16 10-8 30 28H10z" />
    </svg>
  </div>
);
SkeletonImage.displayName = 'Skeleton.Image';

// ── Main Skeleton component ───────────────────────────────────────────────────

type SkeletonComponent = React.FC<SkeletonProps> & {
  Button: typeof SkeletonButton;
  Avatar: typeof SkeletonAvatar;
  Input: typeof SkeletonInput;
  Image: typeof SkeletonImage;
};

const SkeletonBase: React.FC<SkeletonProps> = ({
  loading = true,
  active = false,
  avatar = false,
  title = true,
  paragraph = true,
  round = false,
  children,
  className,
}) => {
  if (!loading) return <>{children}</>;

  const avatarCfg: SkeletonAvatarConfig = avatar === true ? {} : (avatar || {});
  const showAvatar = !!avatar;

  const titleCfg: SkeletonTitleConfig = title === true ? {} : (title || {});
  const showTitle = title !== false;

  const paragraphCfg: SkeletonParagraphConfig =
    paragraph === true ? { rows: 3 } : (paragraph || {});
  const showParagraph = paragraph !== false;
  const rows = paragraphCfg.rows ?? 3;

  const rowWidths: Array<string | number | undefined> = Array.isArray(paragraphCfg.width)
    ? paragraphCfg.width
    : paragraphCfg.width !== undefined
      ? Array(rows).fill(paragraphCfg.width)
      : [];

  return (
    <div className={cn('dsg-skeleton', active && 'dsg-skeleton--active', className)}>
      {showAvatar && (
        <div className="dsg-skeleton__avatar-wrap">
          <div
            className={cn(
              'dsg-skeleton__element',
              'dsg-skeleton__avatar',
              avatarCfg.size && avatarCfg.size !== 'md' && `dsg-skeleton__avatar--${avatarCfg.size}`,
              avatarCfg.shape === 'square' && 'dsg-skeleton__avatar--square'
            )}
          />
        </div>
      )}
      {(showTitle || showParagraph) && (
        <div className="dsg-skeleton__content">
          {showTitle && (
            <div
              className={cn(
                'dsg-skeleton__element',
                'dsg-skeleton__title',
                round && 'dsg-skeleton__title--round'
              )}
              style={titleCfg.width !== undefined ? { width: normWidth(titleCfg.width) } : undefined}
            />
          )}
          {showParagraph && (
            <ul className={cn('dsg-skeleton__paragraph', round && 'dsg-skeleton__paragraph--round')}>
              {Array.from({ length: rows }, (_, i) => (
                <li
                  key={i}
                  className="dsg-skeleton__element"
                  style={rowWidths[i] !== undefined ? { width: normWidth(rowWidths[i] as string | number) } : undefined}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
SkeletonBase.displayName = 'Skeleton';

export const Skeleton = SkeletonBase as SkeletonComponent;
Skeleton.Button = SkeletonButton;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Input = SkeletonInput;
Skeleton.Image = SkeletonImage;
