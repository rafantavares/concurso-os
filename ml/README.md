# ML Experimentation Workspace

Este diretório contém os scripts do laboratório experimental de Machine Learning do ConcursoOS.
Como o ML **não controla o produto**, este pipeline roda de forma isolada (Python, Pandas, Scikit-Learn) apenas para provar conceitos.

## Etapas do Experimento
1. **Extração:** Extrair os dados estritamente limitados (sem Data Leakage) através de `npx tsx extract_dataset.ts`.
2. **Avaliação Inicial:** O script checa e emite `ML NOT READY` caso a amostra atual (MVP recém-lançado) ainda não preencha o tamanho mínimo recomendável (500-1000 intervenções).
3. **Treinamento:** Rode `python experiment.py` para comparar os modelos.

## Status Atual
O sistema possui regras matemáticas/determinísticas altamente eficientes e seguras. 
No momento inicial do projeto, como o tráfego não acumulou base longa, concluímos a Fase 17 atestando a insuficiência de dados reais em massa (`ML NOT READY`).
