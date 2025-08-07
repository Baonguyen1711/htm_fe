// Button component
import React, { forwardRef } from 'react';
import { ButtonProps } from './Button.types';
import { getButtonClasses, loadingSpinnerClasses } from './Button.variants';

const LoadingSpinner = () => (
  <svg className={loadingSpinnerClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const buttonClasses = getButtonClasses(variant, size, fullWidth, isDisabled || isLoading, className);

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
