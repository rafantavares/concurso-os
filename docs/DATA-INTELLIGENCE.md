# Data Intelligence: O Pipeline de Dados

Este documento descreve como os eventos imutáveis registrados pelo candidato são extraídos do banco de dados (Supabase) e transformados em métricas consumíveis pelo motor de **Study Intelligence**, mantendo a rígida separação arquitetural proposta.

## 1. Fluxo de Dados (Pipeline)

A responsabilidade de agrupar e calcular intervalos de tempo *não* fica no motor matemático. O fluxo ocorre em 3 camadas:
1.  **Repositório (`performanceService.ts`):** Busca bruta via `@supabase/supabase-js` dos eventos (`user_answers`, `study_sessions`) relativos ao usuário e concurso.
2.  **Agregador (`aggregator.ts`):** Processa os arrays de eventos em memória, determinando quem entra em qual janela de tempo e gerando o `TopicPerformanceData`.
3.  **Study Intelligence:** Recebe a interface pronta e executa a matemática do SPI e a alocação de tempo.

## 2. Janelas Temporais

Para calcular tendências sem sobreposições e sem consultas pesadas diárias, adotamos as seguintes janelas fixas relativas ao `now()`:
*   **Período Recente (Recent):** Últimos 7 dias. (Ex: 28/09 a 05/10). Usado para `recentAccuracy`.
*   **Período Anterior (Previous):** De 14 dias atrás até 7 dias atrás. (Ex: 21/09 a 28/09). Usado para `previousAccuracy`.
*   *Tendência (Trend):* É simplesmente `recentAccuracy - previousAccuracy`.

## 3. Estratégias de Agregação

### Dados Insuficientes
Para evitar falsos positivos (ex: o usuário acerta 1 questão e o sistema acusa 100% de precisão):
*   O agregador conta quantas questões caem na janela recente. Se for zero, `recentAccuracy` é retornado como `null`.
*   O motor SPI exige **mínimo de 5 questões respondidas** (variável `questionsAnsweredRecent`) para aplicar os cálculos de performance e tendência.

### Cobertura vs. Domínio
*   **Domínio:** Calculado exclusivamente com base no acerto em exercícios (tabela `user_answers`).
*   **Cobertura:** Calculada com base na soma do `duration_minutes` da tabela `study_sessions`.
*   **Estimativa Ausente:** Se o sistema não possui a previsão de horas do edital (`estimatedHoursToCover = null`), o agregador propaga o `null`. O SPI está preparado para **ignorar o peso de cobertura** e focar nos demais riscos nesses cenários, não inventando falsas porcentagens.

### Reincidência
O agregador não soma todos os erros da vida do candidato. Ele recorta as **últimas 10 tentativas** (dentro do período recente) e conta a densidade de erros (`recentErrorsCount`). Isso permite identificar padrões onde o aluno piorou de repente no mesmo assunto, gerando picos de atenção.

## 4. Otimização e Performance
Nesta fase (MVP), optamos por agregações "on-the-fly" em memória porque os arrays de eventos por usuário por concurso não ultrapassarão o limite de performance do V8 facilmente em curto prazo. Quando o volume crescer (ex: milhares de respostas por matéria), a camada `aggregator.ts` será substituída/apoiada por *Materialized Views* ou *Cron Jobs* que gerarão *Snapshots* (`topic_performance_log`) diretamente no banco. A interface para o Domínio permanecerá idêntica, blindando o sistema.
