import React, {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import '../../styles/variables.css';
import './Input.css';
import { cn } from '../../utils/cn';

type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
}

export interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  multiline: true;
  rows?: number;
}

export type InputAllProps = InputProps | TextareaProps;

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputAllProps
>((props, ref) => {
  const {
    label,
    required = false,
    error,
    hint,
    size = 'md',
    leftIcon,
    rightIcon,
    className,
    wrapperClassName,
    disabled,
    ...rest
  } = props;

  const isMultiline = (props as TextareaProps).multiline === true;

  return (
    <div
      className={cn(
        'dsg-input-root',
        `dsg-input-root--${size}`,
        error && 'dsg-input-root--error',
        disabled && 'dsg-input-root--disabled',
        className
      )}
    >
      {label && (
        <label
          className={cn(
            'dsg-input__label',
            required && 'dsg-input__label--required'
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          'dsg-input-wrapper',
          leftIcon && 'dsg-input-wrapper--has-prefix',
          rightIcon && 'dsg-input-wrapper--has-suffix',
          wrapperClassName
        )}
      >
        {leftIcon && (
          <span className="dsg-input__addon dsg-input__addon--prefix" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {isMultiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className="dsg-input__field dsg-input__field--textarea"
            disabled={disabled}
            aria-invalid={!!error}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className="dsg-input__field"
            disabled={disabled}
            aria-invalid={!!error}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {rightIcon && (
          <span className="dsg-input__addon dsg-input__addon--suffix" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {error && <span className="dsg-input__error-msg" role="alert">{error}</span>}
      {!error && hint && <span className="dsg-input__hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
