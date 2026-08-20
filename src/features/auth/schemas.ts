import { z } from 'zod'

/**
 * VALIDATION RULES — the "bouncer's clipboard" for our auth forms.
 *
 * A Zod schema describes what VALID data looks like. You write the rules once
 * here, and they get used in two completely different ways:
 *
 *   1. At RUNTIME  — zodResolver() runs these rules when the user clicks submit.
 *   2. At COMPILE TIME — z.infer<> (bottom of this file) turns the same schema
 *      into a TypeScript type, so your editor autocompletes field names.
 *
 * Writing it once is the whole point. If you declared the rules and the type
 * separately, one day you'd change one and forget the other.
 */

export const loginSchema = z.object({
  // Read this as a chain of stamps: "must be text" (.string()),
  // "...and shaped like an email" (.email()).
  // The string argument is the message the user sees when it fails.
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// z.infer reads the schema above and produces: { email: string; password: string }
// This type only exists while you're writing code — it disappears when the app runs.
export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),

    // Notice: no rules of its own beyond "must be text". Its real rule isn't
    // about ITSELF — it's about matching `password`, handled by .refine() below.
    confirmPassword: z.string(),
  })
  /**
   * .refine() is for checks that span MULTIPLE fields.
   *
   * Why it's needed: a rule attached to one field (like the .min() calls above)
   * can only see that field's own value. It has no idea what's in `password`.
   * .refine() runs on the WHOLE object, after every individual field rule has
   * already passed, so it can compare two fields against each other.
   *
   * `path` tells React Hook Form WHICH input this error belongs to, so the
   * message renders under the Confirm password box. Change it to
   * path: ['password'] and the red text jumps to the other input.
   */
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignupFormValues = z.infer<typeof signupSchema>
