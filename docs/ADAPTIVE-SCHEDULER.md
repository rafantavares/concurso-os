# Adaptive Scheduler 2.0 (Fase 14)

O **Adaptive Scheduler 2.0** substitui o planejamento estático/efêmero ("O que estudar no momento") por um Plano de Estudos Persistente e Versionado. Ele reponde à pergunta: **QUANDO** estudar, e **O que fazer quando a rotina falha?**.

## 1. Nova Estrutura de Dados (Database)
- **`study_plans`:** Tabela que guarda o cabeçalho do plano. Possui o período (`start_date`, `end_date`), a versão e a justificativa do recálculo (`reason_for_change`).
- **`study_plan_items`:** Tarefas alocadas em dias específicos (`planned_date`). Se conectam à estratégia recomendada pelo Adaptive Learning Engine (`intervention_type`).

## 2. Status de Execução
Em vez de ignorar as tarefas não feitas, os itens de plano ganharam status reais (`PLANNED`, `COMPLETED`, `MISSED`, `SKIPPED`, `POSTPONED`). Se o usuário não executar uma tarefa do plano original v1, ela recebe `MISSED`.

## 3. Dinâmica de Replanejamento (`replanSchedule`)
Ao executar o recálculo, o sistema:
1. Marca o plano `ACTIVE` atual como `SUPERSEDED` (preservando o histórico para auditoria).
2. Analisa o `Study Intelligence` (prioridades / SPI).
3. Analisa o `Adaptive Learning` (qual estratégia usar).
4. Verifica os limites de `available_minutes` da semana.
5. Gera um novo lote de `study_plan_items` para os próximos 7 dias.

O plano redistribui a carga dinamicamente, garantindo que o usuário nunca seja "punido" (excesso de compressão num dia só), apenas reorganizado.

## 4. Estudo Livre vs Estudo Planejado
- **Estudo Livre:** O usuário abre o Quest Engine e resolve questões soltas. Isso alimenta o `user_attempts`, e na próxima madrugada ou evento de gatilho, o plano é recalculado refletindo a melhoria de SPI que o Estudo Livre gerou.
- **Estudo Planejado:** O usuário clica em "Estudar" no item do plano diário, engatando o contexto direto no AI Learning ou Quest Engine.

## 5. Próximos Passos (Evolução)
- Ligar *Jobs* assíncronos (ou Server Actions sob demanda no fluxo de UI) para engatilhar `replanSchedule` toda vez que um dia virar (Cron) ou um bloco enorme for `MISSED`.
- Expandir a visualização de calendário no dashboard.
