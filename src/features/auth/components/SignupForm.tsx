import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { FormField } from '../../../shared/components/FormField'
import { Button } from '../../../shared/components/Button'
import { useSignup } from '../api/useSignup'
import { signupSchema, type SignupFormValues } from '../schemas'

export function SignupForm() {
  /**
   * useForm is React Hook Form's "brain" for this form. Three things come out:
   *
   *   register     — connects an <input> to the form (see the spread below)
   *   handleSubmit — validates first, then calls YOUR function only if valid
   *   errors       — where validation messages end up
   *
   * `resolver` is the important bit: React Hook Form has never heard of Zod,
   * and Zod has never heard of React Hook Form. zodResolver (imported from a
   * THIRD package) is the translator between them. Setting it tells RHF:
   * "don't validate this yourself — hand the values to Zod instead."
   *
   * The <SignupFormValues> in angle brackets is the TYPE (from z.infer in
   * schemas.ts) — that's what makes `errors.confirmPassword` autocomplete
   * and catches typos while you write.
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  // The "vending machine" from useSignup.ts — nothing happens until .mutate()
  // is called. It also gives us .isPending (loading) and .error (server said no).
  const signup = useSignup()

  /**
   * This runs ONLY if Zod found zero problems. handleSubmit (wired to the
   * <form> below) validates first and simply never calls this function when
   * something's invalid — which is why `data` is safe to trust here.
   */
  const onSubmit = (data: SignupFormValues) => {
    signup.mutate(data)
  }

  return (
    /**
     * noValidate turns OFF the browser's own built-in validation popups, so
     * Zod is the single source of truth for what counts as valid. Without it
     * you'd get two competing sets of error messages.
     */
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-sm flex-col gap-4">
      {/* register('name') returns { name, onChange, onBlur, ref } — the {...}
          spread applies all four as props at once. That `ref` is how RHF reads
          the value straight off the real DOM input, which is why typing in
          this form doesn't re-render anything ("uncontrolled" form). */}
      <FormField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />

      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        // ?. means "if there's no error, don't crash — just give undefined"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {/* This field's OWN rule (in schemas.ts) is just "must be a string" —
          its real validation is the cross-field .refine() on the whole
          object, which Zod attaches to this field via `path: ['confirmPassword']`.
          That's why errors.confirmPassword can be populated even though
          nothing in the schema targets this field directly. */}
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {/* TWO KINDS OF ERROR, deliberately shown in different places:
          1. Zod errors (errors.name, errors.email...) — "what you typed is
             wrong". Shown under that specific input. Never hits the network.
          2. signup.error (here) — "the server said no", e.g. "Email already
             registered". Shown for the whole form, since it isn't about one
             field. See mocks/handlers.ts for where that message comes from. */}
      {signup.error && (
        <p role="alert" className="text-sm text-red-600">
          {signup.error.message}
        </p>
      )}

      <Button type="submit" isLoading={signup.isPending}>
        Sign up
      </Button>

      <p className="text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
