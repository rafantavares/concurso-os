'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { status: 'error', message: 'Usuário não autenticado.' };

    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const context = formData.get('context') as string;

    if (!type || !description) {
      return { status: 'error', message: 'Preencha todos os campos obrigatórios.' };
    }

    const { error } = await supabase.from('feedbacks').insert({
      user_id: user.id,
      type,
      description,
      context
    });

    if (error) throw error;

    return { status: 'success', message: 'Feedback enviado com sucesso! Muito obrigado.' };
  } catch (err: any) {
    console.error('Feedback error:', err);
    return { status: 'error', message: 'Falha ao enviar feedback.' };
  }
}
