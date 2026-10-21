import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=Preencha todos os campos.', request.url), 303)
    }

    const supabase = await createClient()

    // 1. Tentar Login
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 2. Se falhar por credenciais inválidas ou usuário não existente, tentar cadastrar automaticamente
    if (error && (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.message.toLowerCase().includes('user not found')
    )) {
      const signUpRes = await supabase.auth.signUp({
        email,
        password,
      })

      if (!signUpRes.error && signUpRes.data.user) {
        // Criar perfil em public.users
        await supabase.from('users').upsert({ id: signUpRes.data.user.id })
        return NextResponse.redirect(new URL('/onboarding', request.url), 303)
      }

      if (signUpRes.error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(signUpRes.error.message)}`, request.url), 303)
      }
    }

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url), 303)
    }

    if (data?.user) {
      await supabase.from('users').upsert({ id: data.user.id })
    }

    return NextResponse.redirect(new URL('/dashboard', request.url), 303)
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message || 'Erro inesperado')}`, request.url), 303)
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/login', request.url), 303)
}
