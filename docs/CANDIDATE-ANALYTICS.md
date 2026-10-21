# Candidate Analytics / Preparation Intelligence (Fase 16)

A camada de Candidate Analytics existe para transformar o conjunto brutal de dados operacionais (Eventos, SPI, Sessões, Planos) em um diagnóstico humano legível e sumarizado, sem substituir as decisões mecânicas do **Study Intelligence**.

## 1. Visão de Domínio
O pacote (`src/domain/candidate-analytics`) exporta o método `buildPreparationSummary` e define:
- `CandidatePreparationSummary`: Objeto primário que sumariza desempenho global, horas planejadas vs horas realizadas (aderência) e progresso por disciplina.
- **Insights (Insights Automáticos):** Inferências estruturadas como `LOW_PLAN_ADHERENCE`, `PERFORMANCE_IMPROVING`, `MAIN_BOTTLENECK` ou `HIGH_EFFORT_LOW_PROGRESS`.
- **Status da Preparação:** Baseado num mapa determinístico simples. Pode ser `CALIBRANDO`, `CONSTRUINDO_BASE`, `EVOLUINDO`, `CONSOLIDANDO` ou `ATENCAO`.

## 2. Abordagem Temporal
O serviço (`src/services/candidate-analytics/analyticsService.ts`) agrupa dados focando estritamente na janela temporal dos **últimos 30 dias** contra períodos imediatamente anteriores. Se o delta for irrelevante ou a amostra for minúscula, ele retorna explicitamente `INSUFFICIENT_DATA`.
**ATENÇÃO:** Diferente de especulações do passado, **não existe background cron job ou processamento pesado noturno nativo da aplicação base**. Todo o processo do Analytics e do SPI é engatilhado no momento em que a camada respectiva o requisita.

## 3. Mitigação do Ruído de IA (`AI_GENERATED`)
A base abriga questões geradas pelo *AI Content Engine*. A documentação mandou auditar e resolver uma questão crítica: Uma alucinação no gerador não pode distorcer a nota do candidato.
**Solução (Data Intelligence / Aggregator):** 
Durante a apuração de precisão (`recentAccuracy`), o código lê o metadado relacional `questions(source_type)`. 
As questões canônicas (`OFFICIAL` / `USER_CREATED` / `IMPORTED`) possuem peso 1. 
As questões `AI_GENERATED` possuem um **peso de evidência mitigado para 0.5**. Isso significa que se o candidato gabaritar (ou fracassar) na leva da IA, isso refletirá apenas com meia força perante a matemática final.

## 4. O Limite da Plataforma (Eficácia)
A área *Retorno Observado de Estratégias* correlaciona as métricas "Antes" e "Depois" captadas pelo `learning_interventions` do Adaptive Learning.
**Ela aponta associação e não causalidade**. Apenas evidencia: "Quando você faz Flashcards, sua média observada depois foi +X pontos". Esse é o terreno ideal para ser usado como base de Features (Data Prep) num hipotético e futuro treinamento de Machine Learning.
