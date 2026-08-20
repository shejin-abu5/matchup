import { SignupForm } from './SignupForm'

export function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create your MatchUp account</h1>
      <SignupForm />
    </div>
  )
}
