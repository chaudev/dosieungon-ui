import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import "../../styles/variables.css";
import "./Button.css";
import { cn } from "../../utils/cn";
import type { Rounded } from "../../utils/types";
import { renderButtonIcon, type ButtonIconName } from "./ButtonIcons";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Square button for icons only — hides children text */
  iconOnly?: boolean;
  /** Icon rendered before the label — ReactNode or icon name: "plus" | "download" | "upload" | "import" | "export" | "close" | "save" | "delete" | "arrow-right" | "arrow-left" | "arrow-top" | "arrow-down" */
  leftIcon?: ButtonIconName | ReactNode;
  /** Icon rendered after the label — ReactNode or icon name: "plus" | "download" | "upload" | "import" | "export" | "close" | "save" | "delete" | "arrow-right" | "arrow-left" | "arrow-top" | "arrow-down" */
  rightIcon?: ButtonIconName | ReactNode;
  /** Apply outline style — transparent background with colored border */
  outline?: boolean;
  /** For outline buttons — color variant (danger | warning | secondary) */
  color?: "danger" | "warning" | "secondary";
  /** Border-radius preset — overrides size default */
  rounded?: Rounded;
}

function resolveIcon(icon: ButtonIconName | ReactNode): ReactNode {
  if (typeof icon === "string") {
    const svg = renderButtonIcon(icon);
    if (svg !== null) return svg;
  }
  return icon as ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      iconOnly = false,
      outline = false,
      leftIcon,
      rightIcon,
      color,
      rounded,
      children,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "dsg-btn",
          `dsg-btn--${variant}`,
          `dsg-btn--${size}`,
          outline && "dsg-btn--outline",
          color && `dsg-btn--${color}`,
          iconOnly && "dsg-btn--icon-only",
          loading && "dsg-btn--loading",
          rounded && `dsg-btn--rounded-${rounded}`,
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
          <span className="dsg-btn__icon" aria-hidden="true">
            {resolveIcon(leftIcon)}
          </span>
        ) : null}

        {!iconOnly && children}

        {!loading && rightIcon && (
          <span className="dsg-btn__icon" aria-hidden="true">
            {resolveIcon(rightIcon)}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
