# Beta Real (Feedback Loop)

Lançar a aplicação para o primeiro cohort de usuários beta requer escuta ativa, mas sem infraestruturas de terceiros complexas.

## O Canal de Aderência
Foi implantada a tela `/feedback` e a tabela `feedbacks`. O candidato pode mapear livremente (Categorias: `BUG`, `SUGGESTION`, `DIFFICULTY`, `OTHER`) sem sair da sessão, injetando na matriz de desenvolvimento o que quebra.

## Avaliação PWA
A plataforma (Next.js App Router) tem o layout base (`meta name="viewport"`) configurado mobile-first. O CSS (Tailwind) flexível permite resolução e toque fáceis na tela primária `/study` (Estudar Agora) e no player do Quest Engine, tornando viável a instalação do atalho PWA nativo do Safari/Chrome no iOS e Android, sem depender das lojas de App em estágio incipiente.

## Backups e Resiliência
- **Banco de Dados:** O Supabase executa snapshots PITR (Point-in-Time Recovery) configurados via painel Cloud na conta de host.
- **Storage:** Os PDFs estão em Buckets privados e autenticados, onde RLS `SELECT` garante que apenas o Owner os enxergue, preenchendo as restrições LGPD e impedindo vazamento de curadoria do candidato.
