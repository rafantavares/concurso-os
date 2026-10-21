# Ambientes (Environments)

A arquitetura do ConcursoOS divide estritamente o ecossistema em três etapas para preservar a integridade do Core Loop de Produção.

## 1. Development (`NODE_ENV=development`)
Ambiente voltado à construção de features.
- Único ambiente com permissão para acionar endpoints restritos como `/api/seed` (Fase 13).
- Logs abertos.
- `NEXT_PUBLIC_APP_URL` configurado para `localhost`.

## 2. Test
Utilizado por runners E2E e unitários. 
- Supabase emulado ou instâncias temporárias branchadas.

## 3. Production (`NODE_ENV=production`)
A ponta final utilizada pelo candidato.
- **RESTRIÇÃO:** Proibida a exibição de seeds, mocks hardcoded ("Tributário Teste"), ou botões de debug.
- Trata erros de forma isolada, não vazando `stack trace` ou exceptions do Supabase no Frontend. Retorna sempre `Falha ao registrar sessão, tente novamente`.
- Depende de um pool de conexão saudável com o Postgres via Vercel.

O arquivo de espelho e chaves exigidas para a infraestrutura operar encontra-se mapeado em `.env.example`.
