import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const hours_per_week = Number(formData.get('hours_per_week')) || 10
    const available_days = formData.getAll('available_days') as string[]

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url), 303)
    }

    // 1. Atualizar ou inserir perfil
    await supabase.from('users').upsert({
      id: user.id,
      hours_per_week,
      available_days,
      updated_at: new Date().toISOString()
    })

    // 2. Garantir que o usuário possui pelo menos 1 concurso inicial vinculado
    const { data: userExams } = await supabase
      .from('user_exams')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (!userExams || userExams.length === 0) {
      let { data: defaultExam } = await supabase
        .from('exams')
        .select('id')
        .limit(1)
        .single()

      if (!defaultExam) {
        const { data: newExam } = await supabase.from('exams').insert({
          title: 'Concurso Geral / Teste Inicial',
          institution: 'ConcursoOS',
          board: 'Banca Geral',
          status: 'OPEN'
        }).select('id').single()
        defaultExam = newExam
      }

      if (defaultExam) {
        await supabase.from('user_exams').insert({
          user_id: user.id,
          exam_id: defaultExam.id,
          priority: 1
        })
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url), 303)
  } catch (err: any) {
    console.error('Error updating profile:', err)
    return NextResponse.redirect(new URL('/onboarding?error=Erro ao salvar perfil', request.url), 303)
  }
}
