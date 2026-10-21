# Edital Intelligence

## Visão Geral
O processo de "Edital Intelligence" visa transformar um PDF em uma estrutura programática inteligente de `Subjects` (Disciplinas) e `Topics` (Assuntos), preservando a autoridade humana (revisão) sobre as tabelas oficiais.

## 1. Arquitetura e Modelagem
A extração de edital **nunca** escreve diretamente nas tabelas operacionais do candidato (`subjects`, `topics`) para não poluir o banco com erros de OCR ou alucinações de IA.

Foram criadas duas tabelas de staging/estado:
*   `exam_documents`: Controla o arquivo físico (Storage), peso em bytes, status de processamento e rastreabilidade da origem.
    *   *Status:* `UPLOADED`, `PROCESSING`, `REVIEW_REQUIRED`, `CONFIRMED`, `FAILED`.
*   `exam_document_drafts`: Armazena o rascunho de extração estruturado em uma coluna JSONB (`content`).

## 2. O Fluxo Oficial (Pipeline)
1.  **Upload:** Usuário sobe o PDF. Ele é salvo no bucket `editais` (com RLS de proteção contra acesso indevido por outros usuários) e insere uma linha `UPLOADED` em `exam_documents`.
2.  **Processamento (Extração):** O sistema aciona o motor de parsing. Se o PDF contiver texto nativo, heurísticas baseadas em hierarquia montam o JSON. Se necessário, IA atua interpretando árvores complexas. O resultado vai para a tabela de rascunhos.
3.  **Human Review:** A UI renderiza o JSON extraído (`REVIEW_REQUIRED`). O usuário pode editar nomes, mesclar tópicos, excluir o que não cai, e validar as métricas acessórias (como Peso e Cobertura).
4.  **Confirmação:** Apenas quando o usuário clica em "Confirmar", a `Action` itera a árvore JSON final e realiza os `INSERTs` nas tabelas `subjects` e `topics`, ativando o documento para `CONFIRMED`.

## 3. Pesos e Relevância
A arquitetura prepara o terreno para métricas contínuas em vez de categorizações estáticas (ex: peso 1, 2, 3).
Se a IA ou o parsing detectar o peso (ex: Conhecimentos Específicos vale 2.5), essa métrica é extraída e o Study Intelligence a digere (fator `Relevance` do SPI).
Se a tabela não tem peso, assume-se "null / não informado" e utiliza-se `weight = 1` no agregador.

## 4. Estimativas de Cobertura (Hours to Cover)
Corrigindo o problema apontado na Fase 3, adicionamos duas colunas ao banco (tabela `topics`):
*   `estimated_hours_to_cover`: (Numeric) A quantidade de horas necessárias.
*   `estimated_hours_source`: (String) Rastreia de onde a estimativa veio (`AUTO` para calculada pelo sistema/IA baseada no tamanho do tópico; `MANUAL` alterada pelo usuário; `NONE` para desconhecida).

O Study Intelligence entende que, se `estimated_hours_to_cover` for nulo, a recomendação não deve inflar por métricas fictícias de cobertura, baseando-se apenas em Reincidência e Desempenho.

## 5. Integração com o Motor (Study Intelligence)
Tópicos recém importados possuem 0 histórico (`user_answers = 0`, `study_sessions = 0`). O SPI classifica esses tópicos com as prioridades normais de base, mas inclui flag de *Insufficient Data* e indica ao usuário a necessidade de começar a estudar (ou testar a base por simulado) para que a Inteligência Adaptativa comece a agir de fato sobre a Reincidência e Tendência.

## 6. Evolução Futura
O banco permite que vários documentos pertençam ao mesmo `exam_id` (ex: Retificações de Edital). A interface de human review poderá, no futuro, fundir (merge) rascunhos com a árvore já existente de `subjects`.
