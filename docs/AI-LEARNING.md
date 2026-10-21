# AI Learning Layer (Fase 10 & 11)

O ConcursoOS implementa inteligência artificial generativa como **Educadora**, não como **Planejadora**. Toda a estratégia de o que estudar e quando continua 100% matemática (Study Intelligence). A LLM entra em cena apenas para potencializar o aprendizado no momento exato da dor.

## Princípios
- **Zero Alucinação Estratégica:** A IA não decide seu cronograma.
- **Context-Aware:** Nenhuma request viaja "nua". O `LearningContext` é montado no servidor contendo métricas reais de desempenho.
- **Quest Engine (Fase 11):** A análise de erros agora consome objetos reias da tabela `questions`. O contexto despachado para a LLM possui o enunciado original exato, a resposta correta e a resposta que o candidato escolheu no momento do `user_attempt`, gerando um laudo cirúrgico de "Por que errei essa questão específica?"
- **Estruturação Pura:** As LLMs (`GoogleAIProvider` baseada na env `GOOGLE_AI_MODEL`) retornam objetos estritos validados via esquema (Zod).

## Integrações
### 1. Análise Cirúrgica de Erro (`ErrorAnalysis`)
Na rota de resolução (`/questions`), o botão "Entender meu erro" puxa os metadados brutos da questão recém-perdida, garantindo que o AI Learning não precise alucinar o enunciado.
### 2. Resumo, Flashcards e Revisão
Acessíveis a qualquer momento (ignorando restrições antigas de SPI alto), essas funções extraem o que o aluno errou para priorizar a revisão, criando cartões que são salvos no `ai_flashcards`.
