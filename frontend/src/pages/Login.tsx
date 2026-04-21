import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginForm } from '@/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { extractApiError } from '@/lib/format'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = new URLSearchParams(location.search).get('from') || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      const tokens = await authApi.login(data)
      await login(tokens.access_token, tokens.refresh_token)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(extractApiError(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Flowtrack" className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-text-base">Entrar</h2>
          <p className="text-text-muted text-sm mt-1">Acesse sua conta Flowtrack</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Senha" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  )
}
