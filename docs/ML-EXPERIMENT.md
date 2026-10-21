# Laboratório de Machine Learning Experimental (Fase 17)

## O Problema a ser Predito
Não estamos prevendo qual a "chance de passar", e sim algo puramente tático:
**"Dada a condição atual do aluno, qual a probabilidade de uma intervenção (ex: Flashcards) resultar em um delta positivo no próximo teste?"**

## O Dataset e o Label
A unidade primária observacional (1 linha) é **1 Intervenção**.
- Se o aluno usou o Adaptive Learning no tópico "Crédito Tributário" em 01/10.
- **Label:** `improved = true` (se `performance_after - performance_before > 0`).

## Vazamento de Dados (Data Leakage)
A principal regra deste modelo: As *features* só podem conter métricas congeladas no segundo em que a intervenção foi chamada. Incluir o tempo de estudo do dia 03/10 para prever a intervenção do dia 01/10 envenenaria o modelo.
O script de extração recorta as agregadas (`spi_at_time`, `performance_before`) rigidamente pela data-hora da `learning_interventions`.

## Separação Treino/Teste
O framework usa a divisão via scikit-learn. O ideal é o *GroupShuffleSplit* (dividindo por `user_id` para impedir que o mesmo candidato seja visto no Treino e Teste simultaneamente, superestimando o modelo).

## Baseline e Modelos Testados
A *Baseline* assume a recomendação determinística do Adaptive Learning Engine do ConcursoOS. 
Os modelos configurados para teste são Random Forest e Logistic Regression, valorizando alta interpretabilidade e baixo custo computacional. Nenhuma Deep Learning foi injetada para este problema.

## 🛑 CONCLUSÃO DO EXPERIMENTO (VEREDITO)
**Resultado: ML NOT READY — DATA INSUFFICIENT.**

Como o MVP acaba de implantar a coleta de intervenções em seu DB (`learning_interventions` criado nas fases anteriores), a extração local bateu a marca de 0 registros reais elegíveis populados.

**O que precisamos coletar para que ML seja viável futuramente?**
- Mínimo de 500 a 1000 intervenções completas (`performance_before` e `performance_after` populados).
- Amostragem plural de estratégias (`QUESTIONS`, `GUIDED_REVIEW`, `FLASHCARDS`).
- Garantir que as Questões Oficiais dominem o label, minimizando a inferência com ruído de `AI_GENERATED`.

Até lá, a camada Adaptativa Determinística do sistema continuará perfeitamente operante.
