# Quest Engine (Fase 11)

O Quest Engine isola as **questões** como recursos imutáveis do sistema e as **tentativas** (`user_attempts`) como rastros comportamentais do candidato. 

## Modelagem de Dados

### `questions`
Representa o conteúdo bruto.
- **id**: Identificador único.
- **exam_id, subject_id, topic_id**: Classificação rigorosa (importante: toda questão obrigatoriamente se amarra a um assunto, que por sua vez alimenta o SPI).
- **options & correct_option**: Armazena o JSON de alternativas.
- **source_type**: `OFFICIAL` (cadastradas), `AI_GENERATED` (se formos gerar), `USER_CREATED`.

### `user_attempts`
Representa a interação histórica.
- Substitui logicamente o uso simplista do `user_answers` nas agregações do Study Intelligence, adicionando profundidade (`duration_seconds`, `selected_option`, etc.).
- **Regra de Ouro**: *Nenhuma tentativa sobrescreve outra.* Se o candidato responder a Questão X três vezes (Errado -> Errado -> Certo), o agregador processará essa evolução de aprendizagem.

## Integração com AI Learning
As ações do "Modo Aprendizado" (como `explainError`) agora podem receber questões reais direto do banco de dados (enunciado completo, alternativa escolhida e gabarito), produzindo uma mentoria perfeitamente aderente. Adicionalmente, o painel de IA (que antes exigia SPI > 50) agora é acessível a qualquer momento, atendendo a "Ação manual" requisitada.

## Integração com Study Intelligence
O cadernos de erro e a evolução agora são tracionados pelas `user_attempts`. O `Data Intelligence` passa a contar cada tentativa real como um evento no cálculo de retenção.

## RLS e Segurança
- `questions`: Protegidas para não aceitar adulterações de conteúdo oficial via cliente, mas legíveis globalmente para fins de simulado.
- `user_attempts`: Isoladas via RLS, garantindo que o histórico do Usuário A seja invisível e inatingível pelo Usuário B.

## Próximos Passos
Esta infraestrutura sustenta o módulo de recomendação estrita `getRecommendedQuestions()`, garantindo que o candidato só veja as questões com maior rentabilidade de ROI para seu momento atual.
