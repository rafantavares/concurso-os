# AI Content Engine (Fase 15)

O **AI Content Engine** é ativado unicamente quando o ecossistema demanda (ex: falta de questões para um assunto, ou solicitação manual de reforço). Não atua como um gerador automático massivo.

## 1. Blueprint e Geração
O gatilho inicial requer um `QuestionBlueprint`, estrutura que consolida:
- Assunto (Topic)
- Objetivo pedagógico (Ex: "Diferenciar imposto de taxa")
- Motivo da geração (Ex: `HIGH_ERROR_REINCIDENCE`)
- Dificuldade.

A IA recebe esse Blueprint e retorna o JSON das questões (`GeneratedBatchSchema`).

## 2. Barreira Determinística (Zod)
Não há confiança cega na IA:
- O retorno JSON passa obrigatoriamente pela segunda validação do **Quest Engine** (`QuestionImportSchema`).
- Se a IA gerar 5 questões e 1 possuir o gabarito diferente do array de opções, essa questão isolada falha no Parse e é automaticamente "dropada", persistindo apenas as 4 válidas.
- A coluna `source_type` é chumbada via código (Server-Side) como `AI_GENERATED`. O usuário não consegue falsificar a autoria no Client.

## 3. Impacto no Diagnóstico (Study Intelligence)
Questões `AI_GENERATED` podem alimentar as sessões e o Caderno de Erros através da mesma estrutura base (`user_attempts`). No entanto, o `Aggregator` (`performanceService.ts`) permite, por design, isolar tentativas via filtro cruzado com a tabela `questions`, viabilizando no futuro atribuir **pesos menores de confiança** para o `SPI` quando a tentativa tiver origem em questão gerada por IA.
Isso impede que uma alucinação derrube injustamente o diagnóstico do candidato.

## 4. Evolução (Pós-MVP)
A atual infraestrutura estabelece a via de mão dupla com segurança. O próximo passo lógico da plataforma envolve a adoção de um *pipeline de Crítica* (agente AI_VALIDATOR rodando de forma assíncrona para analisar semântica antes de publicar), mas a base da Fase 15 protege estritamente a taxonomia e o modelo de negócios da ferramenta.
