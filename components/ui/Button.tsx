'use client'

import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

// ボタンの種類
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

// ボタンのサイズ
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    children: ReactNode
    isLoading?: boolean
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyle =
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

    const variantStyle: Record<Variant, string> = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
        outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-300',
        ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }

    const sizeStyle: Record<Size, string> = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
    }

    return (
        <button
            className={cn(baseStyle, variantStyle[variant], sizeStyle[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 animate-spin text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    処理中...
                </span>
            ) : (
                children
            )}
        </button>
    )
}
