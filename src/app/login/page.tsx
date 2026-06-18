import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <LoginForm next={sp.next ?? '/'} initialError={sp.error} />
    </div>
  )
}
