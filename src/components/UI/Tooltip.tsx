'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export default function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const spacing = 8

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + spacing
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - spacing
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + spacing
        break
    }

    // Boundary checks
    const padding = 8
    if (left < padding) left = padding
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding
    }
    if (top < padding) top = padding
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding
    }

    setPosition({ top, left })
  }

  useEffect(() => {
    if (isVisible) {
      calculatePosition()
      window.addEventListener('scroll', calculatePosition, true)
      window.addEventListener('resize', calculatePosition)
      return () => {
        window.removeEventListener('scroll', calculatePosition, true)
        window.removeEventListener('resize', calculatePosition)
      }
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleFocus = () => {
    setIsVisible(true)
  }

  const handleBlur = () => {
    setIsVisible(false)
  }

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={cn(
        'fixed z-[var(--z-tooltip)] px-3 py-2',
        'bg-[var(--text)] text-[var(--bg)] text-sm',
        'rounded-lg shadow-lg',
        'pointer-events-none',
        'animate-in fade-in zoom-in-95 duration-150',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {content}
      <div
        className={cn(
          'absolute w-2 h-2 bg-[var(--text)] rotate-45',
          placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
          placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
          placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
          placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
        )}
      />
    </div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>
      {typeof window !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  )
}