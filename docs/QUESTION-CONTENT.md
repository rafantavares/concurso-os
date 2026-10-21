# Question & Content Intelligence (Fase 13)

A Fase 13 eleva o Quest Engine para uma plataforma real de conteúdo. Com a introdução da biblioteca de questões, o ConcursoOS agora gerencia dezenas de milhares de questões e não depende mais de mocks cravados no código.

## 1. Fonte Oficial e Modos de Proveniência
- **`questions`:** Banco imutável onde reside o conteúdo das questões.
- **Proveniência (`source_type`):** O sistema agora discrimina `OFFICIAL` (questões canônicas), `USER_CREATED` (cadastradas manualmente na UI), `AI_GENERATED` (preparando o terreno arquitetural para a futura esteira de geração) e `IMPORTED` (vias de Seed/CSV/JSON).

## 2. A Biblioteca (`/questions`)
Criamos a rota de Acervo Total (`/questions`), que permite:
- **Visualização Server-Side:** Paginação de 20 em 20 e search fields, evitando baixar a base inteira para o browser.
- **Validação Estrita:** Antes de uma questão entrar no banco via `actions/questions-library.ts`, ela é interceptada pelo Zod (`QuestionImportSchema`). Se `correct_option` não for exatamente igual a uma das `options`, o payload é violentamente rejeitado, salvando o sistema de bugs lógicos.

## 3. Seed de Desenvolvimento
- Desenvolvemos o endpoint `/api/seed` bloqueado estritamente para `NODE_ENV === 'development'`. Ao ser chamado, ele lê os tópicos do primeiro edital do usuário e derrama 100 questões distribuídas aleatoriamente entre `HARD`, `MEDIUM` e `EASY` para popular o ambiente, permitindo um QA E2E perfeito.
- Este seeder elimina a necessidade do fallback invisível que antes poluía a lógica de produção com uma questão de "Tributário".

## 4. O Fim do `user_answers`
A promessa da Fase 12 foi concluída na Fase 13. A transição foi cimentada através de scripts paralelos (`20261005210000_offline_batch.sql` e `20261005220000_update_rpc_attempts.sql`):
- O batch offline de antigamente ("Lançar 10 acertos na unha") agora escreve em `user_attempts` usando `question_id = NULL`.
- A RPC da tabela atômica de Estudo também foi redirecionada.
- O cadernos de erro continuam puxando fielmente de `user_attempts.is_correct = false`.

## 5. Seleção e Recomendação
As requisições dinâmicas continuam partindo da prioridade mapeada pelo Study Intelligence, garantindo que o acervo de questões não vire uma navegação sem rumo, e sim um arsenal servindo ao propósito da aprovação.
