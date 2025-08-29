import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      header,
      footer,
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'bg-[var(--panel)] rounded-lg',
      'transition-all duration-200 ease-out'
    )

    const variants = {
      default: 'border border-[var(--border)] shadow-sm',
      bordered: 'border-2 border-[var(--border)]',
      elevated: 'shadow-md border border-[var(--border)]'
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    const hoverStyles = hoverable
      ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
      : ''

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          padding === 'none' ? '' : '',
          className
        )}
        {...props}
      >
        {header && (
          <div
            className={cn(
              'border-b border-[var(--border)]',
              padding !== 'none' && paddings[padding]
            )}
          >
            {header}
          </div>
        )}
        <div className={cn(padding !== 'none' && paddings[padding])}>{children}</div>
        {footer && (
          <div
            className={cn(
              'border-t border-[var(--border)]',
              padding !== 'none' && paddings[padding]
            )}
          >
            {footer}
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card