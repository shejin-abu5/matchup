import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

// Tailwind's rounded-lg = 8px, rounded-xl = 12px — matches the design
// brief's "8px buttons/inputs, 12px cards" exactly, so no custom radius
// tokens needed for this component.
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

// No forwardRef here: this component doesn't need to expose the underlying
// <button> DOM node to a parent, so there's nothing to forward. (FormField,
// next to this file, is the case where a ref DOES need to pass through —
// see the comment there for why.)
export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  )
}
