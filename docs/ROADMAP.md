# Roadmap do Produto: ConcursoOS

Este roadmap define as etapas de construção do ConcursoOS, focando no diferencial competitivo: o estudo adaptativo baseado em dados.

## Fase 1: Fundação & Perfis (MVP - Parte 1)
**Objetivo:** Estruturar a base da aplicação, tipos, testes e entrada de dados iniciais.
*   [ ] Configuração Next.js, Tailwind, Supabase, Jest/Vitest.
*   [ ] Modelagem do Banco de Dados (Suporte a Cobertura vs Domínio e snapshots temporais).
*   [ ] Autenticação de usuários.
*   [ ] Cadastro manual do perfil de rotina (horas disponíveis).
*   [ ] CRUD básico de Concursos, Disciplinas e Assuntos (mock de edital para os testes iniciais).

## Fase 2: O Motor Abstrato (MVP - Parte 2)
**Objetivo:** Construir e testar agressivamente a camada puramente lógica do `Study Intelligence` antes de ligá-la à interface gráfica final.
*   [ ] Desenvolvimento das funções puras de cálculo de SPI (Study Priority Index).
*   [ ] Lógica de separação entre Cobertura (horas investidas) e Domínio (% de acerto e evolução temporal).
*   [ ] Algoritmo de Alocação de Tempo (Distribuição de horas com base na prioridade).
*   [ ] Motor de Justificativas Estruturadas (Geração de arrays de motivos matemáticos).
*   [ ] Bateria massiva de testes unitários validando cenários (Usuário com alto domínio e baixa cobertura, usuário estagnado, usuário esquecendo matéria, reincidência de erros).

## Fase 3: Ação e Feedback Visual (MVP - Parte 3)
**Objetivo:** O usuário interage com a plataforma e vê o ciclo adaptativo funcionar.
*   [ ] Módulo de registro de Sessões de Estudo.
*   [ ] Simulação/Registro de Questões respondidas (com captura de acerto/erro/tempo para alimentar a reincidência).
*   [ ] Geração de Snapshots de performance automáticos.
*   [ ] Dashboard Adaptativo consumindo o Motor de Inteligência (Exibindo "Você precisa estudar Contabilidade por 4h nesta semana, motivos: A, B, C").

> **Ponto de Validação do MVP:** Neste ponto, o usuário cadastra sua rotina, informa que errou X questões de um assunto, e a interface imediatamente redistribui seu tempo da semana com base nos pesos configurados, mostrando as justificativas detalhadas.

## Fase 4: Expansão Prática e Usabilidade
*   [ ] Upload de PDF de Editais e parser (com tela de revisão humana).
*   [ ] Caderno de Erros interativo.
*   [ ] Visões gráficas de tendência evolutiva.

## Fase 5: Integração Complementar de IA Generativa
*   [ ] Explicação gerativa para questões erradas (atuando como tutor, não como planejador).
*   [ ] Geração de Resumos baseados nas lacunas exatas de domínio.
