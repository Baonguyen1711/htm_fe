// Input component
import React, { forwardRef } from 'react';
import { InputProps } from './Input.types';
import { getInputClasses, labelClasses, errorClasses, helperTextClasses } from './Input.variants';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      isRequired = false,
      isDisabled = false,
      fullWidth = true,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;
    
    const inputClasses = getInputClasses(
      finalVariant,
      size,
      !!leftIcon,
      !!rightIcon,
      className
    );

    const containerClasses = [
      fullWidth ? 'w-full' : '',
      containerClassName || '',
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={isDisabled}
            required={isRequired}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className={errorClasses} role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className={helperTextClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
