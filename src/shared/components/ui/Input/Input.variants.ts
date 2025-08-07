// Input variant styles using Tailwind CSS
import { InputVariant, InputSize } from './Input.types';

export const inputVariants: Record<InputVariant, string> = {
  default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
};

export const inputSizes: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const baseInputClasses = 'block w-full rounded-md border shadow-sm focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200';

export const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

export const errorClasses = 'mt-1 text-sm text-red-600';

export const helperTextClasses = 'mt-1 text-sm text-gray-500';

export const getInputClasses = (
  variant: InputVariant,
  size: InputSize,
  hasLeftIcon: boolean,
  hasRightIcon: boolean,
  className?: string
): string => {
  const classes = [
    baseInputClasses,
    inputVariants[variant],
    inputSizes[size],
    hasLeftIcon ? 'pl-10' : '',
    hasRightIcon ? 'pr-10' : '',
    className || '',
  ];

  return classes.filter(Boolean).join(' ');
};
