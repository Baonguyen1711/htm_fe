// Button variant styles using Tailwind CSS
import { ButtonVariant, ButtonSize } from './Button.types';

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white border-transparent',
  secondary: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-900 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border-transparent',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent',
  warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500 text-gray-700 border-transparent',
  outline: 'bg-transparent hover:bg-gray-50 focus:ring-blue-500 text-blue-600 border-blue-600',
};

export const buttonSizes: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const baseButtonClasses = 'inline-flex items-center justify-center font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

export const loadingSpinnerClasses = 'animate-spin -ml-1 mr-2 h-4 w-4';

export const getButtonClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  isDisabled: boolean,
  className?: string
): string => {
  const classes = [
    baseButtonClasses,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    className || '',
  ];

  return classes.filter(Boolean).join(' ');
};
