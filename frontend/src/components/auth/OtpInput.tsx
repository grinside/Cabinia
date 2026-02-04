import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  error,
  autoFocus = true,
}: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Focus the appropriate input when value changes
  useEffect(() => {
    const nextIndex = Math.min(value.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  }, [value, length]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow single digit
      const digit = inputValue.replace(/\D/g, '').slice(-1);

      if (digit) {
        // Insert digit at position
        const newValue = value.slice(0, index) + digit + value.slice(index + 1);
        onChange(newValue.slice(0, length));

        // Move to next input
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
          setFocusedIndex(index + 1);
        }
      }
    },
    [value, length, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();

        if (value[index]) {
          // Clear current digit
          const newValue = value.slice(0, index) + value.slice(index + 1);
          onChange(newValue);
        } else if (index > 0) {
          // Move to previous input and clear
          const newValue = value.slice(0, index - 1) + value.slice(index);
          onChange(newValue);
          inputRefs.current[index - 1]?.focus();
          setFocusedIndex(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    },
    [value, length, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (pastedData) {
        onChange(pastedData);
        const lastIndex = Math.min(pastedData.length - 1, length - 1);
        inputRefs.current[lastIndex]?.focus();
        setFocusedIndex(lastIndex);
      }
    },
    [length, onChange]
  );

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select the input content
    inputRefs.current[index]?.select();
  };

  return (
    <div>
      <div className="flex justify-center gap-3">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              'w-12 h-14 text-center text-2xl font-semibold rounded-xl bg-dark-800 border-2 transition-all outline-none',
              error
                ? 'border-red-500'
                : focusedIndex === index
                ? 'border-primary-500'
                : value[index]
                ? 'border-green-500'
                : 'border-dark-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
