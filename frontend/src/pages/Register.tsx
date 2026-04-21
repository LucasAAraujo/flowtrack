import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterForm } from '@/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { extractApiError } from '@/lib/format'

export function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authApi.register(data)
      const tokens = await authApi.login({ email: data.email, password: data.password })
      await login(tokens.access_token, tokens.refresh_token)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (err) {
      toast.error(extractApiError(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Flowtrack" className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-text-base">Criar conta</h2>
          <p className="text-text-muted text-sm mt-1">Comece a rastrear seu tempo agora</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome" {...register('name')} error={errors.name?.message} />
          <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
          <Input
            label="Senha"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  )
}
