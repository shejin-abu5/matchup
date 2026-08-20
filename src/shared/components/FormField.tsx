import type { InputHTMLAttributes, Ref } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  // React Hook Form's register('fieldName') returns { name, onChange, onBlur, ref }
  // meant to land on the REAL <input> DOM node — RHF reads .value off that
  // node directly instead of tracking it in React state (that's what
  // "uncontrolled form" means, and why typing doesn't re-render anything).
  // Spreading register()'s output onto <FormField {...register('email')} />
  // means `ref` arrives here as a normal prop — which React 19 allows
  // without forwardRef, as long as we declare it and pass it through
  // to the actual <input> below.
  ref?: Ref<HTMLInputElement>
}

export function FormField({ label, error, id, ref, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
