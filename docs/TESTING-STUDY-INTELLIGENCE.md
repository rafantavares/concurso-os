# Study Intelligence: Estratégia de Testes (Fase 2)

O motor de `Study Intelligence` é a fundação do produto. Para garantir que ele decida corretamente o futuro de estudo do candidato, utilizamos uma suíte rigorosa de testes unitários em **Vitest**.

## 1. O Que É Testado?

O motor foi dividido em três partes testáveis, cobrindo 100% do código de domínio (`src/domain/study-intelligence/`):

### 1.1. Cálculo do SPI (`spi.test.ts`)
Validamos se o cálculo matemático isolado reage corretamente aos fatores do candidato:
*   **Performance:** Verifica o acréscimo de pontuação caso a precisão (`accuracy`) caia substancialmente abaixo da meta (85%). Garante que não haja penalização se o número de questões respondidas for baixo (sem validade estatística).
*   **Tendência (Trend):** Simula quedas abruptas (ex: 80% -> 60%) e valida a adição da explicação `NEGATIVE_TREND`.
*   **Recência (Decay):** Verifica o acréscimo linear no risco caso o assunto não seja estudado há vários dias.
*   **Reincidência:** Verifica a punição em caso de erros seguidos num curto espaço de tempo.
*   **Cobertura:** Valida se disciplinas longas, ainda não estudadas, ganham tração `LOW_COVERAGE`.

### 1.2. Alocação de Tempo (`allocator.test.ts`)
O alocador é um algoritmo que previne que uma disciplina monopolize o cronograma.
*   **Distribuição:** Garante que 10 horas disponíveis geram exatamente 10 horas alocadas (nenhuma a mais, nenhuma a menos).
*   **Limites de Teto:** Valida se a regra de `MAX_RATIO_PER_TOPIC` (máximo de 40% do tempo em um único assunto) está sendo respeitada, impedindo a fadiga do candidato.
*   **Casos Extremos:** Testa entradas como 0 horas disponíveis (graceful fail).

### 1.3. O "Core Loop" (`index.test.ts`)
Este é o teste mais importante do ConcursoOS. Ele simula o ciclo de vida:
1.  **Estado Inicial:** O candidato possui bons resultados e o cronograma é equilibrado.
2.  **O Desastre:** O candidato faz exercícios, erra muito e a precisão cai drasticamente, gerando a *reincidência de erros*.
3.  **A Reação:** O motor roda novamente e verifica se o sistema apontou prioridade `CRITICAL` para o assunto problemático e reajustou suas horas.
4.  **A Recuperação:** O candidato volta a estudar, a nota sobe, a tendência zera, e o sistema abaixa novamente a prioridade (SPI) para dar lugar a outras matérias.

## 2. Como Executar

```bash
npm run test
npx vitest run --coverage
```
Atualmente, o domínio possui 100% de cobertura de linhas (Statements) e 92% de cobertura de Branches, não dependendo de React ou banco de dados.
