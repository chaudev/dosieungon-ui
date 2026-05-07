import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  InputHTMLAttributes,
} from 'react';
import '../../styles/variables.css';
import './Radio.css';
import { cn } from '../../utils/cn';

type RadioSize = 'sm' | 'md' | 'lg';
type RadioDirection = 'horizontal' | 'vertical';

interface RadioGroupContextValue {
  value: string | number | undefined;
  onChange: (v: string | number) => void;
  name: string;
  disabled: boolean;
  size: RadioSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Controlled value */
  value?: string | number;
  /** Default value for uncontrolled */
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  name?: string;
  disabled?: boolean;
  direction?: RadioDirection;
  size?: RadioSize;
  className?: string;
  children?: ReactNode;
}

let _uid = 0;

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  name,
  disabled = false,
  direction = 'vertical',
  size = 'md',
  className,
  children,
}) => {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | number | undefined>(defaultValue);
  const groupName = name ?? `dsg-radio-group-${++_uid}`;

  const handleChange = (v: string | number) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <RadioGroupContext.Provider
      value={{
        value: isControlled ? valueProp : internal,
        onChange: handleChange,
        name: groupName,
        disabled,
        size,
      }}
    >
      <div
        className={cn(
          'dsg-radio-group',
          `dsg-radio-group--${direction}`,
          `dsg-radio-group--${size}`,
          className
        )}
        role="radiogroup"
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string | number;
  label?: ReactNode;
}

export const Radio: React.FC<RadioProps> & { Group: typeof RadioGroup } = ({
  value,
  label,
  disabled: disabledProp,
  className,
  ...props
}) => {
  const ctx = useContext(RadioGroupContext);
  const checked = ctx ? ctx.value === value : props.checked;
  const disabled = disabledProp || ctx?.disabled;

  return (
    <label
      className={cn(
        'dsg-radio',
        checked && 'dsg-radio--checked',
        disabled && 'dsg-radio--disabled',
        className
      )}
    >
      <input
        type="radio"
        className="dsg-radio__input"
        value={value}
        name={ctx?.name}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx?.onChange(value)}
        {...props}
      />
      <span className="dsg-radio__indicator" aria-hidden="true" />
      {label && <span className="dsg-radio__label">{label}</span>}
    </label>
  );
};

Radio.Group = RadioGroup;
Radio.displayName = 'Radio';
RadioGroup.displayName = 'Radio.Group';
