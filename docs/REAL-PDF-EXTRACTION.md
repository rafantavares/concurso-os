# Extração Real de PDF (Fase 7)

## O Pipeline
O módulo de extração inteligente do ConcursoOS divide o processamento em duas camadas distintas, separando o parser bruto (Node.js/Buffer) da interpretação contextual, evitando assim alucinações diretas.

### 1. Extrator Bruto (`pdfExtractor.ts`)
*   Responsável estritamente por consumir o `Buffer` do arquivo via `pdf-parse`.
*   Extrai o conteúdo dividindo-o logicamente em páginas (`PageContent`), permitindo rastreabilidade futura.
*   **Classificação Heurística:** Compara a quantidade de caracteres detectados com o número de páginas.
    *   Se a densidade textual for muito baixa, sinaliza como `SCANNED_PDF` ou `MIXED_PDF`.
    *   No estado atual, PDFs escaneados ativam um fluxo de fallback (`warning` no draft) pedindo input manual, sem forçar OCR pesado no servidor (evitando bloqueios de memória).

### 2. Estruturador de Conteúdo (`contentStructurer.ts`)
*   Responsável por ler os arrays de páginas e tentar encontrar a estrutura `Cargo -> Disciplina -> Assunto`.
*   **Não altera o banco operacional.** Gera um JSON estrito para a tabela `exam_document_drafts`.
*   Para o MVP (vertical slice) sem uma chave segura de LLM garantida no ambiente local, implementamos uma heurística determinística (`Regex`) que foca no formato textual esperado (quebra de linha e bullets). 
*   A arquitetura está perfeitamente selada para que a injeção do LLM (`gemini` ou `openai`) aconteça exclusivamente nesta função. Se o LLM alucinar, o dano morre no draft.

## Segurança e Tratamento de Arquivos Grandes
*   O arquivo é verificado em peso (máximo 10MB) e mimetype (`application/pdf`) diretamente na Server Action.
*   Ao ser enviado para o Storage (`editais`), seu Path ganha um sufixo unívoco vinculado ao usuário, protegendo a privacidade dos editais carregados.
*   Em caso de falha de parsing, o registro em `exam_documents` assume `FAILED` (e o PDF persiste na nuvem), permitindo análise da equipe de engenharia para criar parsers mais adaptados à banca organizadora, sem prejudicar o usuário.

## Múltiplos Cargos
A estrutura final JSON do draft suporta array de `roles` (Cargos). O edital pode referenciar dezenas de cargos. O revisor humano poderá escolher importar apenas as disciplinas relevantes para a sua área, consolidando o escopo antes de sujar sua jornada de estudos.
