// Input component types
import { InputHTMLAttributes, ReactNode } from 'react';

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
}
