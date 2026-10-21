# Arquitetura do ConcursoOS

Este documento descreve a arquitetura técnica, as escolhas de design e a modelagem de dados para o ConcursoOS.

## 1. Princípio Arquitetural Central

**O ConcursoOS não é apenas um gerenciador de cronogramas. É um sistema adaptativo de preparação.**
A arquitetura reflete o princípio de que o cronograma não dita o estudo; o desempenho e a realidade do candidato é que ditam o cronograma. A distribuição do tempo de estudo futuro é uma consequência matemática da análise do comportamento passado e presente do usuário.

## 2. Stack Tecnológico

A stack escolhida visa produtividade, escalabilidade e excelente UX, alinhando-se com requisitos de um SaaS moderno:

*   **Frontend:** Next.js (App Router), React, TypeScript.
*   **Estilização:** Tailwind CSS (foco em visual limpo e profissional).
*   **Backend & DB:** Supabase (PostgreSQL, Autenticação, Row Level Security).
*   **Infraestrutura:** Vercel (Next.js) e Supabase cloud.

## 3. Separação de Responsabilidades (Domain-Driven)

Adotamos a seguinte organização para manter a lógica do motor adaptativo isolada, pura e testável:

*   **UI Components (`/src/components`)**: Apenas renderizam dados, recebem interações e exibem as justificativas estruturadas (sem ditar regras).
*   **Application Services / Repositories (`/src/services`)**: Executam as consultas limpas ao Supabase e passam os resultados para a camada agregadora.
*   **Data Aggregator (`/src/services/data-intelligence`)**: Transforma listas de eventos brutos (sessões, respostas) em métricas sumarizadas usando janelas temporais de 7 e 14 dias (sem vazar regra de prioridade).
*   **Domain Layer (`/src/domain/study-intelligence`)**: Funções TypeScript puras, totalmente testáveis. Recebe as métricas prontas do agregador e retorna a **Alocação de Tempo** e os **Motivos Estruturados**. Zero dependência de Supabase ou LLMs.

## 4. Modelagem de Dados Relacional (PostgreSQL)

O banco deve suportar análise de tendências temporais (evolução) e distinguir clearly "Cobertura" de "Domínio".

### Entidades Estruturais (O Edital)
*   **`exams`**: Concursos (Órgão, Banca, Data Prevista).
*   **`subjects`**: Disciplinas (com peso no concurso).
*   **`topics`**: Assuntos granulares da disciplina.

### Entidades do Usuário e Eventos (A base da adaptabilidade)
*   **`users`**: Perfil (horas disponíveis por semana, restrições).
*   **`study_sessions`**: Registro imutável de tempo estudado (data, duração, `topic_id`, tipo [teoria, revisão]).
*   **`user_answers`**: Cada tentativa em uma questão gera um registro (data, `topic_id`, acertou/errou, tempo gasto). Fundamental para analisar **reincidência de erros** no mesmo assunto em um curto espaço de tempo.

### Agregações e Evolução Temporal (On-the-fly MVP)
Para não gerar complexidade prematura de infraestrutura com Materialized Views ou Cron Jobs, o MVP utilizará agregações em memória (na camada Data Intelligence) para montar o *TopicPerformanceData*, dividindo os eventos de forma determinística em janelas de 7 e 14 dias para gerar Tendência. Snapshots de banco serão introduzidos posteriormente por necessidade de escala.

## 5. Estratégia de Processamento de Editais (PDF)

A plataforma suportará ingestão de editais via extração de PDFs com obrigatoriedade de **Revisão Humana** antes da efetivação no banco, garantindo que o motor de inteligência receba dados estruturais perfeitamente categorizados.

## 6. Segurança
Uso extensivo de Supabase RLS (Row Level Security) para garantir total privacidade dos dados de desempenho e cronogramas de cada candidato.

## 7. Cadeia de Inteligência de Estudo (Fluxo de Execução)

A plataforma obedece rigorosamente a seguinte cadeia causal de tomada de decisão:

1. **Study Intelligence:** Analisa os dados históricos brutos (Agregador) e determina *O QUE estudar* baseando-se no SPI (Spike Priority Index).
2. **Adaptive Learning Engine:** Recebe o problema (ex: SPI Crítico) e determina *COMO estudar* (Intervenção recomendada: GUIDED_REVIEW, QUESTIONS, etc.), baseado no que funcionou melhor nas tentativas anteriores do usuário.
3. **Adaptive Scheduler:** Recebe o "O que" e o "Como" e responde *QUANDO estudar*, distribuindo o tempo disponível em um cronograma persistente, versionado e tolerante a falhas (capaz de se reorganizar diante de itens não realizados).
4. **Execution / AI Learning:** É a ponta final, entregando o conteúdo em si (ensino gerado por IA, biblioteca de questões). Não dita o plano, apenas obedece as diretrizes e coleta novos eventos.

## 8. Relatórios e Interpretação (Candidate Analytics)

Após a cadeia de estudo fechar seu ciclo mecânico-adaptativo, entra a camada de Análise (`Candidate Analytics`):
- **Onde atua:** Ela repousa sobre a agregação de dados primários e os avalia historicamente (ex: tendências de 30 dias). 
- **O que produz:** Insights puramente determinísticos e estado global. Ela expõe o cruzamento de Cobertura x Aderência x Desempenho. 
- **Importância:** Mantém a interface do usuário legível (`/analytics`), evitando afogar o estudante numa torrente de percentuais paralelos e priorizando apontar explicitamente Onde está o gargalo (ex: `MAIN_BOTTLENECK`).

## 9. Produção e Escala (O Beta Real)

A arquitetura transcendeu os testes e foi estabilizada. 
- Mocks, Fallbacks soltos e Endpoints de semeadura (`/api/seed`) foram isolados sob rigorosa validação `NODE_ENV`.
- Um sistema de `feedback` intra-aplicação foi estabelecido para capturar o real engajamento UX do MVP.
- O tratamento de Erro Server-Side (Next.js Actions) foi envelopado, assegurando que Providers fora do ar (ex: APIs LLM) sofram graceful degradation sem derrubar a tela do estudante.
O produto já pode ser acessado, avaliado, e submetido às agruras do fluxo diário sem colapsar a base.
