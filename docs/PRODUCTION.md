# Production MVP (Fase 18)

O projeto migrou de "Motor de Inteligência Experimental" para "Produto Real".

## 1. Auditoria de Dados Fictícios
- Os fallbacks rígidos do Quest Engine que injetavam "Direito Tributário" em tela foram removidos.
- A semente simulada `/api/seed` agora porta a cláusula restrita ao `process.env.NODE_ENV !== 'production'`. Um hit em produção devolve 403.
- `simulateEditalExtraction` não atua mais no fluxo público (sendo contido por Server Actions de Revisão Humana).

## 2. Server-Side Security (Auth & RLS)
- Nenhuma chamada `supabase.auth.getSession()` dita autorização nua de componentes críticos server-side sem validação do token, mitigando falsificações.
- As Policies RLS do PostgreSQL protegem 100% das tabelas criadas nas Fases 1 até 16. O usuário `X` não insere `feedbacks`, `study_sessions` ou `study_plans` sob o UUID do usuário `Y`.

## 3. Observabilidade e Error Handling
Se o LLM cair (ex: Google AI API em manutenção), o motor devolve um ActionState controlado `status: 'error'`, mantendo a plataforma navegável para estudos manuais e não quebrando com o "White Screen of Death" no React.

## 4. O Fluxo Oficial (Core Loop)
A plataforma agora é autossuficiente na jornada do candidato:
Cadastro -> Inserção de Edital -> Planejamento Inicial Adaptativo -> Resolver Questões Reais (Biblioteca ou AI Generated controlada) -> O Adaptive Scheduler realoca o plano baseado nos Erros.
Nenhum mock existe nesse pipeline produtivo.
