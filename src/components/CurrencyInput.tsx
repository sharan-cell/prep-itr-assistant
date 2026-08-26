import React from 'react';
import { parseNumericInput } from '../utils/formatters';

interface CurrencyInputProps {
  id: string;
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  small?: boolean;
}

/**
 * CurrencyInputProps — A properly spaced currency input with ₹ prefix.
 * 
 * Uses the .ux4g-input-group pattern from index.css to ensure the ₹ symbol
 * (rendered in a bordered left-column) never overlaps the typed value.
 * The input itself uses .ux4g-input-has-prefix which adds padding-left: 44px.
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  small = false,
}) => {
  const displayValue = value ? value.toLocaleString('en-IN') : '';

  return (
    <div className="ux4g-input-group">
      <span className="ux4g-input-prefix" aria-hidden="true">₹</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => onChange(parseNumericInput(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        className={`ux4g-input ux4g-input-has-prefix font-semibold ${small ? 'text-xs py-1.5' : ''} ${className}`}
      />
    </div>
  );
};
