# Study Intelligence (Motor Adaptativo)

O coração do ConcursoOS é o motor matemático responsável por guiar as sessões de estudo.

## Spike Priority Index (SPI)
O algoritmo atribui notas de 0 a 100 para cada assunto. 
- Alto Desempenho / Acertos Recentes: Reduz o SPI.
- Reincidência de Erros / Falta de Estudo: Aumenta o SPI.

## Aggregation (O Efeito das Tentativas)
Com a chegada da **Fase 11 (Quest Engine)**, o diagnóstico abandonou as estatísticas brutas "offline" que exigiam pacotes grandes. O `Data Intelligence` (camada `aggregator.ts`) se prepara para varrer a tabela imutável `user_attempts`.
- Toda vez que o candidato clica em "Confirmar Resposta", um novo `user_attempt` nasce.
- Se o candidato responde a MESMA questão três vezes (`Errado -> Errado -> Certo`), **nenhum** dado antigo é deletado. 
- A janela de tempo (ex: `last 7 days`) no Agregador lê o acerto mais fresco mudando o status da métrica `recentAccuracy` progressivamente (tendência), alterando automaticamente o SPI em tempo real, sem cron-jobs engessados.

## Time Allocator
Após receber as prioridades, o sistema usa matemática de capping (limite máximo, default 40%) para distribuir a disponibilidade semanal reportada pelo usuário em blocos (default 30 min). Caso faltem matérias para cobrir a disponibilidade (usuários intensos com poucos tópicos cadastrados), o limite se estica de forma elástica, garantindo que o plano utilize 100% da carga exigida.
