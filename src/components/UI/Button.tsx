import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-lg
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      relative overflow-hidden
    `

    const variants = {
      primary: `
        bg-[var(--brand)] text-white border border-transparent
        hover:bg-[var(--brand-600)] hover:shadow-md hover:translate-y-[-1px]
        active:bg-[var(--brand-700)] active:translate-y-0
        focus-visible:ring-[var(--brand)]
      `,
      secondary: `
        bg-[var(--panel)] text-[var(--text)] border border-[var(--border)]
        hover:bg-[var(--bg)] hover:border-[var(--brand)] hover:shadow-md hover:translate-y-[-1px]
        active:bg-[var(--panel)] active:translate-y-0
        focus-visible:ring-[var(--brand)]
      `,
      ghost: `
        bg-transparent text-[var(--text)]
        hover:bg-[var(--border)] hover:bg-opacity-20
        active:bg-[var(--border)] active:bg-opacity-30
        focus-visible:ring-[var(--brand)]
      `,
      destructive: `
        bg-[var(--danger)] text-white border border-transparent
        hover:bg-red-600 hover:shadow-md hover:translate-y-[-1px]
        active:bg-red-700 active:translate-y-0
        focus-visible:ring-[var(--danger)]
      `
    }

    const sizes = {
      sm: 'min-h-[36px] px-3 py-1.5 text-sm',
      md: 'min-h-[44px] px-4 py-2.5 text-base',
      lg: 'min-h-[52px] px-6 py-3 text-lg'
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          widthClass,
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </span>
        )}
        <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button