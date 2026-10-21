# Auditoria e Preparação para Produção (Fase 9)

## 1. Security Audit & Autorização (RLS)
- **Autenticação Server-Side:** Todas as Server Actions já utilizam `supabase.auth.getUser()`, garantindo que o `user_id` nunca seja forjado pelo cliente.
- **Service Role:** Não há vazamento da chave `SUPABASE_SERVICE_ROLE_KEY` para o frontend.
- **RLS em Eventos:** `user_answers`, `study_sessions`, `exam_documents` e `exam_document_drafts` possuem RLS estrito `(auth.uid() = user_id)`.
- **Modelagem de Concursos:** `exams`, `subjects` e `topics` não possuem `user_id` atrelado diretamente por design (arquitetura preparada para reuso/compartilhamento de edital público). O isolamento dos dados do usuário ocorre nas tabelas de eventos.

## 2. Data Integrity e Atomicidade
- **Problema Encontrado:** A função `finishStudySession` (Fase 8) executa dois comandos Supabase JS distintos (um `insert` em sessions e um `insert` em answers). Se o segundo falhar, o sistema ficará inconsistente.
- **Solução:** Vamos criar uma Stored Procedure (RPC) no PostgreSQL que cria ambos de forma atômica em uma única transação, realizando `ROLLBACK` se algo falhar.
- **Duplo Envio:** Os formulários utilizam `useActionState` do React 19, desabilitando o submit via `isPending`, mas adicionaremos validações matemáticas contra `NaN` e limites impossíveis (ex: questões < 0).

## 3. Timezone Strategy
- **Armazenamento:** PostgreSQL utiliza `timestamp with time zone` guardando UTC puro.
- **Janelas de Agregação:** As janelas do `performanceService` e `aggregator` baseiam-se em dias corridos `(now() - interval 'X days')`.
- **Decisão:** A métrica é globalizada em UTC no banco, e no lado do cliente a visualização de data/hora (quando implementada) converterá para o local time do browser.

## 4. Validação de Questões
- Casos absurdos como 10 questões e 11 acertos precisam de validação server-side com early return (400 Bad Request conceitual).

## 5. Study Intelligence e Allocator Edge Cases
- **Comportamento Extremado:** Se um usuário botar 40 horas semanais e houver apenas 1 assunto, o limite de 40% (Capping) resultará em 16 horas e 24h perdidas? 
- **Decisão:** Revisaremos o `Allocator` para que, se houver excesso de horas e as matérias atingirem o Cap, as horas não alocadas não sejam simplesmente descartadas, devendo preencher de volta proporcionalmente ou explicitamente gerar um aviso "Horas excedem o edital atual".

## 6. UI, UX e Mobile
- Precisamos auditar a acessibilidade básica e garantir a responsividade (espaçamentos menores em mobile) no Dashboard e `/study`.
