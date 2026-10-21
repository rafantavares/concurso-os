# Adaptive Learning Engine (Fase 12)

O **Adaptive Learning Engine** é a camada responsável por decidir **COMO** o candidato deve estudar um determinado assunto (a Intervenção), complementando o **Study Intelligence** (que decide **O QUE** e **QUANDO** estudar).

## 1. Arquitetura
A arquitetura baseia-se em evidências observadas. O motor não faz adivinhações por Inteligência Artificial Generativa. Ele busca as intervenções anteriores registradas na tabela `learning_interventions` e observa o `performance_after - performance_before`.

### Fluxo de Responsabilidades
1. **Study Intelligence:** Observa que "Crédito Tributário" tem SPI crítico (90).
2. **Adaptive Learning:** Busca o histórico do candidato em "Crédito Tributário". Descobre que nas últimas duas sessões de `THEORY`, o desempenho não mudou. Recomenda mudar para `GUIDED_REVIEW`.
3. **AI Learning:** Se o candidato solicitar a revisão guiada, o AI Provider gera o conteúdo estruturado dinamicamente para aplicar a intervenção recomendada.

## 2. Tipos de Intervenção
- `THEORY`: Consumo tradicional de material (pdf, vídeo).
- `QUESTIONS`: Resolução de baterias focadas em encontrar lacunas.
- `MIXED_QUESTIONS`: Revisão espaçada sem concentração em um único assunto.
- `GUIDED_REVIEW`: Pílula de revisão criada pela IA com teste embutido.
- `FLASHCARDS`: Geração de flashcards personalizados para memorização.
- `ERROR_ANALYSIS`: Resolução de questões seguida por dissecamento detalhado do erro.

## 3. Efetividade Observada e Confiança
A engine em `src/domain/adaptive-learning/engine.ts` constrói o objeto `InterventionRecommendation`:
- **INSUFFICIENT_EVIDENCE:** (0-1 observações) Heurísticas fallback.
- **EARLY_SIGNAL:** (2-3 observações) O sistema já começa a apontar padrões (ex: falhas consecutivas).
- **MODERATE_EVIDENCE:** (4-9 observações) A recomendação passa a ter forte base no usuário.
- **STRONG_EVIDENCE:** (10+ observações).

*Importante:* Não afirmamos **causalidade** ("O Flashcard te deu 15% a mais"). Afirmamos **evidência observacional** ("Após as últimas intervenções de Flashcard, observamos melhora de 15%").

## 4. Evolução para Machine Learning
Este banco de dados (`learning_interventions` correlacionado com `user_attempts`) será o *Dataset Dourado* no futuro. Uma vez acumuladas dezenas de milhares de sessões, a Fase ML poderá entrar em cena para descobrir padrões transversais entre usuários (ex: *Candidatos com o perfil XYZ geralmente respondem melhor a GUIDED_REVIEW após um período longo de latência*).

## 5. Auditoria de Dados Concluída
Durante a Fase 12, consolidamos a fonte de verdade.
- **Antes:** O `aggregator.ts` consumia de `user_answers` (que servia como batch simplista sem vínculo claro de contexto de enunciado).
- **Agora:** O `aggregator.ts` mudou o ponteiro para `user_attempts`. Ele agora reflete 100% da interação granulada do aluno perante a tabela `questions`. O `user_answers` se tornou *legacy*. 
- O seeder mockado foi isolado no bloco `if (process.env.NODE_ENV === 'development')`, protegendo a UI de produção contra ilusões de dados falsos.
