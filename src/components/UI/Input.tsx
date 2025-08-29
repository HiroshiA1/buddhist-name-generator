import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showRequired?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      showRequired,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helpId = `${inputId}-help`

    const inputStyles = cn(
      'w-full min-h-[44px]',
      'px-4 py-2.5',
      'bg-[var(--panel)] text-[var(--text)]',
      'border border-[var(--border)] rounded-lg',
      'font-[var(--font-sans)] text-base',
      'placeholder:text-[var(--muted)]',
      'transition-all duration-200 ease-out',
      'hover:border-[var(--brand)] hover:border-opacity-50',
      'focus:border-[var(--brand)] focus:shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg)]',
      error && 'border-[var(--danger)] focus:border-[var(--danger)] focus-visible:ring-[var(--danger)]',
      leftIcon && 'pl-11',
      rightIcon && 'pr-11',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-[var(--text)]"
          >
            {label}
            {showRequired && (
              <span className="ml-1 text-[var(--danger)]" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error && errorId, helpText && helpId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={helpId} className="mt-2 text-sm text-[var(--muted)]">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input