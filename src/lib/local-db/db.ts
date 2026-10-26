import path from 'node:path';
import fs from 'node:fs';

// Dynamic loader to avoid Turbopack node:sqlite static bundling restriction
function getSqliteModule() {
  if (typeof (process as any).getBuiltinModule === 'function') {
    try {
      const mod = (process as any).getBuiltinModule('node:sqlite');
      if (mod) return mod;
    } catch (e) {
      console.error('[LocalDB] Erro no process.getBuiltinModule:', e);
    }
  }

  try {
    const { createRequire } = require('node:module');
    const req = createRequire(process.cwd() + '/');
    return req('node:sqlite');
  } catch (e) {
    console.error('[LocalDB] Erro no createRequire:', e);
  }

  return null;
}

export const ALL_SEED_QUESTIONS = [
  // Direito Constitucional - Art. 5º
  {
    id: 'q-const-01',
    topic_id: 'top-1',
    subject_id: 'subj-const',
    statement: 'Nos termos da Constituição Federal de 1988, a respeito dos direitos e garantias fundamentais previstos no Artigo 5º, assinale a alternativa juridicamente correta:',
    options: [
      'A prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão, nos termos da lei.',
      'A casa é asilo inviolável do indivíduo, não podendo nela penetrar ninguém durante a noite, mesmo em caso de flagrante delito.',
      'É livre a manifestação do pensamento, sendo expressamente admitido o anonimato nas denúncias de caráter apócrifo.',
      'Homens e mulheres são iguais em direitos e obrigações, salvo no tocante aos cargos de chefia do Poder Executivo.',
      'A lei poderá restringir a publicidade dos atos processuais apenas e tão somente no âmbito dos processos criminais.'
    ],
    correct_option: 'A prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão, nos termos da lei.',
    explanation: 'O Art. 5º, XLII, da CF/88 estabelece categoricamente: "a prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão, nos termos da lei". As demais assertivas violam expressamente a Carta Magna: o anonimato é vedado (inciso IV), o flagrante delito permite entrada noturna (inciso XI), e a igualdade de gênero é plena.',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-const-02',
    topic_id: 'top-1',
    subject_id: 'subj-const',
    statement: 'De acordo com a jurisprudência sumulada do Supremo Tribunal Federal (Súmula Vinculante 11), o uso de algemas é admitido:',
    options: [
      'A critério discricionário exclusivo do policial condutor, sem necessidade de justificação por escrito.',
      'Em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, justificada a excepcionalidade por escrito.',
      'Apenas e tão somente após o trânsito em julgado da sentença condenatória.',
      'Em qualquer prisão cautelar decorrente de mandado de prisão preventiva.',
      'Exclusivamente no interior do tribunal durante a sessão plenária de julgamento.'
    ],
    correct_option: 'Em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, justificada a excepcionalidade por escrito.',
    explanation: 'A Súmula Vinculante nº 11 do STF delimita que o uso de algemas só é lícito em caso de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, devendo a excepcionalidade ser justificada por escrito, sob pena de responsabilidade e nulidade da prisão.',
    difficulty: 'HARD',
  },
  {
    id: 'q-const-03',
    topic_id: 'top-1',
    subject_id: 'subj-const',
    statement: 'Em relação aos remédios constitucionais previstos no Artigo 5º da Constituição Federal de 1988, assinale a opção correta:',
    options: [
      'O mandado de segurança coletivo pode ser impetrado por partido político com representação no Congresso Nacional.',
      'O habeas corpus pode ser impetrado por pessoa jurídica em favor de sua própria liberdade de locomoção.',
      'O mandado de injunção destina-se a assegurar o conhecimento de informações relativas à pessoa do impetrante constantes de registros governamentais.',
      'A ação popular exige o pagamento prévio de custas judiciais e honorários de sucumbência em qualquer circunstância.',
      'O habeas data é remédio constitucional oneroso que depende do recolhimento de taxas judiciárias estaduais.'
    ],
    correct_option: 'O mandado de segurança coletivo pode ser impetrado por partido político com representação no Congresso Nacional.',
    explanation: 'Nos termos do Art. 5º, LXX, "a", da CF/88, o mandado de segurança coletivo pode ser impetrado por partido político com representação no Congresso Nacional. Pessoa jurídica não possui liberdade corporal de locomoção (HC inadmissível para PJ). Conhecimento de informações pessoais é tutelado por Habeas Data (inciso LXXII). Ação popular é gratuita salvo má-fé comprovada (inciso LXXIII).',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-const-04',
    topic_id: 'top-1',
    subject_id: 'subj-const',
    statement: 'A respeito do direito à inviolabilidade do domicílio, o Art. 5º, XI, da CF/88 preceitua que a casa é asilo inviolável do indivíduo. Assinale a hipótese em que é constitucionalmente legítimo o ingresso no domicílio durante a noite, sem o consentimento do morador:',
    options: [
      'Em caso de flagrante delito ou desastre, ou para prestar socorro.',
      'Para cumprimento de determinação judicial fundamentada exarada pelo magistrado plantonista.',
      'Para realização de busca e apreensão determinada pelo delegado de polícia condutor do inquérito.',
      'Por requisição motivada do Ministério Público para apuração de crime contra a administração pública.',
      'Em virtude de suspeita genérica ou denúncia anônima de contravenção penal.'
    ],
    correct_option: 'Em caso de flagrante delito ou desastre, ou para prestar socorro.',
    explanation: 'O Art. 5º, XI, CF/88 prevê expressamente que ninguém na casa poderá penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro (a qualquer hora do dia ou da noite); ou, durante o dia, por determinação judicial. Logo, à noite a determinação judicial não autoriza a entrada sem consentimento.',
    difficulty: 'EASY',
  },
  // Direito Constitucional - Organização do Estado e Poderes
  {
    id: 'q-const-05',
    topic_id: 'top-2',
    subject_id: 'subj-const',
    statement: 'No que concerne à repartição constitucional de competências na Federação Brasileira, compete privativamente à União legislar sobre:',
    options: [
      'Direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.',
      'Direito tributário, financeiro, penitenciário, econômico e urbanístico.',
      'Proteção e integração social das pessoas portadoras de deficiência e infância.',
      'Procedimentos em matéria processual e custas dos serviços forenses.',
      'Previdência social, proteção e defesa da saúde coletiva.'
    ],
    correct_option: 'Direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.',
    explanation: 'O Art. 22, I, da CF/88 estabelece a clássica competência privativa da União: direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho (mnemônico CAPACETE de PIMENTA). As demais matérias listadas são de competência legislativa concorrente entre União, Estados e DF (Art. 24).',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-const-06',
    topic_id: 'top-2',
    subject_id: 'subj-const',
    statement: 'De acordo com o texto expresso da Constituição da República de 1988, NÃO será objeto de deliberação a proposta de emenda tendente a abolir:',
    options: [
      'A forma federativa de Estado e a separação dos Poderes.',
      'O sistema presidencialista de governo republicano.',
      'O voto obrigatório para os cidadãos maiores de 18 anos.',
      'A estabilidade dos servidores públicos civis após o estágio probatório.',
      'O mandato com duração fixa de quatro anos para os Chefes do Poder Executivo.'
    ],
    correct_option: 'A forma federativa de Estado e a separação dos Poderes.',
    explanation: 'As cláusulas pétreas expressas do Art. 60, § 4º da CF/88 são: I - a forma federativa de Estado; II - o voto direto, secreto, universal e periódico (não a obrigatoriedade!); III - a separação dos Poderes; IV - os direitos e garantias individuais. Presidencialismo e estabilidade não são cláusulas pétreas.',
    difficulty: 'MEDIUM',
  },
  // Direito Administrativo - Princípios
  {
    id: 'q-admin-01',
    topic_id: 'top-3',
    subject_id: 'subj-admin',
    statement: 'O princípio da Administração Pública que veda a promoção pessoal de agentes públicos em obras, publicidades ou serviços públicos, com fulcro no Art. 37, §1º, da CF/88, denomina-se:',
    options: [
      'Princípio da Impessoalidade.',
      'Princípio da Autotutela.',
      'Princípio da Continuidade do Serviço Público.',
      'Princípio da Subsidiariedade.',
      'Princípio da Razoabilidade.'
    ],
    correct_option: 'Princípio da Impessoalidade.',
    explanation: 'O Princípio da Impessoalidade (Art. 37, caput e §1º, CF/88) proíbe que nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades ou servidores constem de publicidade de atos, programas, obras, serviços e campanhas dos órgãos públicos.',
    difficulty: 'EASY',
  },
  {
    id: 'q-admin-03',
    topic_id: 'top-3',
    subject_id: 'subj-admin',
    statement: 'Sobre o princípio da autotutela administrativa e a jurisprudência dominante consolidada na Súmula 473 do STF, assinale a afirmativa correta:',
    options: [
      'A Administração pode anular seus próprios atos quando eivados de vícios que os tornam ilegais, e revogá-los por motivo de conveniência ou oportunidade.',
      'A revogação de um ato administrativo produz efeitos retroativos (ex tunc), desfazendo as situações pretéritas consolidadas.',
      'A anulação de atos administrativos eivados de ilegalidade só produz efeitos prospectivos (ex nunc), mantendo os efeitos ilícitos passados.',
      'A revogação de atos administrativos só pode ser validamente determinada pelo Poder Judiciário mediante ação popular.',
      'O Poder Judiciário tem competência para revogar atos discricionários do Poder Executivo por considerar o mérito inconveniente.'
    ],
    correct_option: 'A Administração pode anular seus próprios atos quando eivados de vícios que os tornam ilegais, e revogá-los por motivo de conveniência ou oportunidade.',
    explanation: 'Súmula 473/STF: "A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial". Anulação opera ex tunc; revogação opera ex nunc.',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-admin-04',
    topic_id: 'top-3',
    subject_id: 'subj-admin',
    statement: 'A Súmula Vinculante nº 13 do Supremo Tribunal Federal estabelece diretrizes rigorosas contra o nepotismo no serviço público. A respeito do tema, assinale a opção correta:',
    options: [
      'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, para cargo em comissão viola a Constituição Federal.',
      'A proibição do nepotismo não veda a nomeação recíproca de parentes entre poderes distintos (nepotismo cruzado).',
      'O nepotismo é vedado unicamente para parentes consanguíneos de primeiro grau, permitindo-se livremente os graus subsequentes.',
      'A proibição sumulada pelo STF aplica-se indistintamente a cargos de natureza estritamente política como Ministros de Estado.',
      'A prática do nepotismo não configura ato atentatório aos princípios administrativos, configurando mera irregularidade leve.'
    ],
    correct_option: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, para cargo em comissão viola a Constituição Federal.',
    explanation: 'A Súmula Vinculante 13 do STF estabelece que a nomeação de cônjuge, companheiro ou parente até o terceiro grau da autoridade nomeante para cargo em comissão, função gratificada ou cargo de direção viola expressamente a CF/88, inclusive na modalidade de designações recíprocas (nepotismo cruzado).',
    difficulty: 'MEDIUM',
  },
  // Direito Administrativo - Atos Administrativos
  {
    id: 'q-admin-02',
    topic_id: 'top-4',
    subject_id: 'subj-admin',
    statement: 'Em matéria de Atos Administrativos, assinale a opção que indica corretamente o atributo segundo o qual o ato administrativo se presume editado em conformidade com o ordenamento jurídico até prova em contrário:',
    options: [
      'Presunção de Legitimidade e Veracidade.',
      'Autoexecutoriedade.',
      'Tipicidade.',
      'Imperatividade.',
      'Exigibilidade.'
    ],
    correct_option: 'Presunção de Legitimidade e Veracidade.',
    explanation: 'A presunção de legitimidade e veracidade é atributo inerente aos atos administrativos, operando de forma relativa (juris tantum), invertendo o ônus da prova para quem alega a ilegalidade do ato estatal.',
    difficulty: 'EASY',
  },
  {
    id: 'q-admin-05',
    topic_id: 'top-4',
    subject_id: 'subj-admin',
    statement: 'No que concerne aos elementos (requisitos) de validade do ato administrativo, assinale a opção que indica o elemento que NÃO admite convalidação diante de vício insanável de legalidade:',
    options: [
      'Motivo e Finalidade.',
      'Competência quando não exclusiva.',
      'Forma quando não essencial à validade do ato.',
      'Procedimento formal preliminar dispensável.',
      'Órgão emissor em razão do tempo.'
    ],
    correct_option: 'Motivo e Finalidade.',
    explanation: 'Na teoria das nulidades dos atos administrativos (Competência, Finalidade, Forma, Motivo e Objeto), admitem convalidação unicamente os vícios sanáveis de Competência (desde que não exclusiva) e de Forma (desde que não exigida expressamente em lei como requisito essencial ad solemnitatem). Motivo inexistente ou falso e Desvio de Finalidade são vícios insanáveis.',
    difficulty: 'HARD',
  },
  {
    id: 'q-admin-06',
    topic_id: 'top-4',
    subject_id: 'subj-admin',
    statement: 'O atributo do ato administrativo pelo qual a Administração Pública pode compelir materialmente o administrado ao cumprimento da obrigação sem necessidade de autorização prévia judicial denomina-se:',
    options: [
      'Autoexecutoriedade.',
      'Tipicidade vinculada.',
      'Imperatividade passiva.',
      'Presunção de Veracidade absoluta.',
      'Irrevogabilidade fática.'
    ],
    correct_option: 'Autoexecutoriedade.',
    explanation: 'A autoexecutoriedade é o atributo pelo qual o poder público pode executar imediatamente suas decisões administrativas, inclusive com emprego direto da força pública legalmente autorizada, sem precisar demandar judicialmente para fazê-lo valer (ex: interdição de fábrica clandestina).',
    difficulty: 'EASY',
  },
  {
    id: 'q-admin-07',
    topic_id: 'top-4',
    subject_id: 'subj-admin',
    statement: 'A respeito do Poder de Polícia administrativa, assinale a alternativa juridicamente correta:',
    options: [
      'Incide precipuamente sobre bens, direitos e atividades, visando ao bem-estar e à ordem da coletividade.',
      'Tem caráter exclusivamente punitivo-repressivo e atua sobre pessoas que cometeram crimes penais.',
      'É privativo de corporações militares de segurança pública estadual.',
      'Não admite qualquer delegação a entidades da administração indireta, mesmo com capital 100% público.',
      'Impede a aplicação de multas pecuniárias pela via administrativa direta.'
    ],
    correct_option: 'Incide precipuamente sobre bens, direitos e atividades, visando ao bem-estar e à ordem da coletividade.',
    explanation: 'A polícia administrativa atua sobre bens, direitos e atividades de particulares em prol do interesse público geral (fiscalizações tributárias, sanitárias, ambientais e de trânsito). O STF (Tema 532) autorizou a delegação das fases de fiscalização e consentimento para empresas estatais prestadoras de serviços públicos não concorrenciais.',
    difficulty: 'MEDIUM',
  },
  // Língua Portuguesa - Interpretação e Compreensão
  {
    id: 'q-port-02',
    topic_id: 'top-5',
    subject_id: 'subj-port',
    statement: 'No fragmento: "O advento de sistemas inteligentes não extingue a necessidade da capacidade analítica humana; ao contrário, eleva o discernimento crítico à condição de prerrogativa indispensável", a expressão sublinhada "ao contrário" estabelece uma relação discursiva de:',
    options: [
      'Oposição enfática e retificação argumentativa.',
      'Conclusão lógica decorrente da assertiva inicial.',
      'Condição causal imperativa.',
      'Concessão mitigadora do posicionamento do autor.',
      'Explicação puramente descritiva e cronológica.'
    ],
    correct_option: 'Oposição enfática e retificação argumentativa.',
    explanation: 'O articulador textual "ao contrário" (ou "pelo contrário") funciona como operador argumentativo adversativo de contraposição direta e retificação, reforçando a tese oposta àquela que acabou de ser negada pelo termo "não extingue".',
    difficulty: 'EASY',
  },
  {
    id: 'q-port-03',
    topic_id: 'top-5',
    subject_id: 'subj-port',
    statement: 'Em relação aos mecanismos de coesão referencial no texto, assinale a opção em que o termo em destaque opera como anáfora textual legítima:',
    options: [
      'Os concurseiros dedicam horas aos simulados. Esses estudantes sabem que a prática leva à excelência.',
      'Aprovamos os seguintes tópicos: ética pública, redação oficial e noções de informática.',
      'Só desejo isto com urgência: a publicação da nomeação no Diário Oficial da União.',
      'Eram estes os motivos expostos: falta de tempo livre, cansaço e acúmulo de tarefas.',
      'Antes de qualquer inferência, é primordial considerar a seguinte premissa básica.'
    ],
    correct_option: 'Os concurseiros dedicam horas aos simulados. Esses estudantes sabem que a prática leva à excelência.',
    explanation: 'A anáfora consiste no mecanismo coesivo em que um pronome ou expressão recupera um termo mencionado anteriormente no texto. "Esses estudantes" retoma anafóricamente "Os concurseiros". Nas outras opções (isto, estes, seguintes), há catáfora, pois apontam para elementos que ainda serão revelados adiante.',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-port-04',
    topic_id: 'top-5',
    subject_id: 'subj-port',
    statement: 'Texto que tem como objetivo primordial defender um ponto de vista por meio de argumentos sólidos, dados objetivos e encadeamento lógico visando persuadir o interlocutor classifica-se predominantemente como:',
    options: [
      'Dissertativo-argumentativo.',
      'Narrativo ficcional.',
      'Injuntivo instrucional.',
      'Descritivo estático.',
      'Lírico confessional.'
    ],
    correct_option: 'Dissertativo-argumentativo.',
    explanation: 'O texto dissertativo-argumentativo caracteriza-se pela apresentação de uma tese central defendida por meio de argumentos, fatos, raciocínios e dados comprobatórios, objetivando convencer ou persuadir o leitor acerca da validade daquele posicionamento.',
    difficulty: 'EASY',
  },
  // Língua Portuguesa - Concordância, Regência e Pontuação
  {
    id: 'q-port-01',
    topic_id: 'top-6',
    subject_id: 'subj-port',
    statement: 'Assinale a alternativa que apresenta a oração em estrita conformidade com a norma-padrão de concordância verbal:',
    options: [
      'Fazem dez anos que os novos métodos de auditoria foram implementados na repartição.',
      'Haviam muitos candidatos inscritos no processo seletivo deste certame.',
      'Houve bastantes dúvidas durante a aplicação da prova discursiva.',
      'Precisam-se de novos servidores capacitados em análise de dados públicos.',
      'Mais de um concurseiro cumprimentaram-se cordialmente antes do início da prova.'
    ],
    correct_option: 'Houve bastantes dúvidas durante a aplicação da prova discursiva.',
    explanation: 'O verbo "haver" no sentido de existir ou ocorrer é impessoal e deve ficar na 3ª pessoa do singular ("Houve dúvidas"). "Bastantes" funciona como pronome adjetivo (= muitas) e concorda com "dúvidas". Nas outras opções: "Faz dez anos" (tempo decorrido é impessoal), "Havia muitos" (impessoal), "Precisa-se de novos servidores" (voz passiva com índice de indeterminação não flexiona).',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-port-05',
    topic_id: 'top-6',
    subject_id: 'subj-port',
    statement: 'Assinale a alternativa em que o uso do acento grave indicativo de crase está empregado em inteira obediência à norma-padrão da Língua Portuguesa:',
    options: [
      'O candidato dedicou o final de semana à revisão dos conteúdos mais difíceis.',
      'Estava disposto à estudar até altas horas da madrugada para garantir a aprovação.',
      'Os concursados foram chamados um à um para a formalização do termo de posse.',
      'Ele se referiu à ela com elevado respeito e cordialidade institucional.',
      'O relatório técnico foi entregue à prazo pré-estabelecido pela comissão julgadora.'
    ],
    correct_option: 'O candidato dedicou o final de semana à revisão dos conteúdos mais difíceis.',
    explanation: 'O verbo "dedicar" rege a preposição "a" (dedicar algo a...), e o substantivo feminino "revisão" admite o artigo definido "a" (a + a = à). Nas demais opções o uso é incorreto: antes de verbo ("à estudar"), em locuções de palavras repetidas ("um à um"), antes de pronome pessoal ("à ela") e antes de palavra masculina ("à prazo").',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-port-06',
    topic_id: 'top-6',
    subject_id: 'subj-port',
    statement: 'No que concerne à regência verbal, assinale a frase que se encontra em perfeita consonância com a norma culta:',
    options: [
      'O servidor recém-empossado aspira a um cargo de chefia na repartição.',
      'O candidato aspirava o ar puro e por isso aspirava o cargo de diretor público.',
      'Custou para o concursando compreender a complexa regra de transição previdenciária.',
      'O auditor assistiu o julgamento no tribunal com a função de testemunha ocular.',
      'A população obedeceu o decreto municipal sem apresentar qualquer manifestação.'
    ],
    correct_option: 'O servidor recém-empossado aspira a um cargo de chefia na repartição.',
    explanation: 'O verbo "aspirar" no sentido de almejar/pretender é transitivo indireto e exige a preposição "a" ("aspira a um cargo"). "Obedecer" exige preposição "a" ("obedeceu ao decreto"). A construção "custou para o concursando" é inadequada ao padrão culto, devendo ser "custou ao concursando compreender".',
    difficulty: 'HARD',
  },
  {
    id: 'q-port-07',
    topic_id: 'top-6',
    subject_id: 'subj-port',
    statement: 'Em relação às regras canônicas de pontuação, assinale a opção em que a pontuação foi empregada de forma estritamente correta:',
    options: [
      'O resultado definitivo do certame, que era aguardado com grande expectativa por todos, foi publicado hoje.',
      'O diretor da comissão organizadora, homologou as inscrições deferidas no prazo legal.',
      'Todos os candidatos classificados, compareceram com pontualidade à prova de títulos.',
      'Naquela manhã ensolarada os alunos, estudavam com dedicação e disciplina exemplar.',
      'Após o encerramento do horário de prova, fiscais e candidatos, saíram em silêncio.'
    ],
    correct_option: 'O resultado definitivo do certame, que era aguardado com grande expectativa por todos, foi publicado hoje.',
    explanation: 'A oração adjetiva explicativa "que era aguardado com grande expectativa por todos" deve vir isolada por vírgulas. Nas outras alternativas cometeu-se o erro de separar com vírgula o sujeito de seu respectivo predicado ("O diretor... homologou", "Todos os candidatos... compareceram").',
    difficulty: 'EASY',
  },
  // RLM - Proposições, Conectivos e Tabelas-Verdade
  {
    id: 'q-rlm-02',
    topic_id: 'top-7',
    subject_id: 'subj-rlm',
    statement: 'Dadas as proposições simples P: "O candidato resolve questões diariamente" e Q: "O candidato obtém a aprovação", a proposição condicional composta "P -> Q" será logicamente FALSA se, e somente se:',
    options: [
      'P for verdadeira e Q for falsa.',
      'P for falsa e Q for verdadeira.',
      'P for falsa e Q for falsa.',
      'P for verdadeira e Q for verdadeira.',
      'Tanto P quanto Q assumirem valor lógico indeterminado.'
    ],
    correct_option: 'P for verdadeira e Q for falsa.',
    explanation: 'Pela tabela-verdade fundamental da condicional lógica (P -> Q), a proposição só é FALSA no caso em que a premissa/antecedente é Verdadeira e o consequente é Falso (caso clássico conhecido como "Vera Fischer é Falsa"). Em todos os demais casos (V->V, F->V, F->F), a condicional é Verdadeira.',
    difficulty: 'EASY',
  },
  {
    id: 'q-rlm-03',
    topic_id: 'top-7',
    subject_id: 'subj-rlm',
    statement: 'Considere a afirmação categórica: "Todo fiscal de tributos domina a legislação contábil". A negação lógica correta dessa sentença é:',
    options: [
      'Existe pelo menos um fiscal de tributos que não domina a legislação contábil.',
      'Nenhum fiscal de tributos domina a legislação contábil.',
      'Todos os fiscais de tributos não dominam a legislação contábil.',
      'Todo aquele que domina a legislação contábil é fiscal de tributos.',
      'Ninguém domina a legislação contábil no órgão fiscal.'
    ],
    correct_option: 'Existe pelo menos um fiscal de tributos que não domina a legislação contábil.',
    explanation: 'Para negar o quantificador universal afirmativo "Todo A é B", deve-se utilizar o quantificador existencial com negação do predicado: "Algum A não é B", "Existe pelo menos um A que não é B" ou "Pelo menos um A não é B". Nunca se nega "Todo" com "Nenhum".',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-rlm-04',
    topic_id: 'top-7',
    subject_id: 'subj-rlm',
    statement: 'Na lógica matemática proposicional, uma proposição composta cuja tabela-verdade resulta invariavelmente em valor lógico VERDADEIRO para quaisquer combinações dos valores das proposições simples componentes é chamada de:',
    options: [
      'Tautologia.',
      'Contradição.',
      'Contingência.',
      'Equivocidade.',
      'Silogismo nulo.'
    ],
    correct_option: 'Tautologia.',
    explanation: 'Tautologia é a proposição composta que é sempre verdadeira, independentemente dos valores lógicos das proposições simples que a compõem (ex: P ou ~P). Se for sempre falsa, é uma contradição. Se puder ser verdadeira ou falsa dependendo dos valores simples, é uma contingência.',
    difficulty: 'EASY',
  },
  // RLM - Equivalências e Negação
  {
    id: 'q-rlm-01',
    topic_id: 'top-8',
    subject_id: 'subj-rlm',
    statement: 'Considere a proposição lógica condicional: "Se o candidato estuda com constância, então ele é aprovado no concurso". A negação lógica rigorosa dessa proposição é expressa por:',
    options: [
      'O candidato estuda com constância e não é aprovado no concurso.',
      'Se o candidato não estuda com constância, então ele não é aprovado.',
      'O candidato não estuda com constância ou é aprovado no concurso.',
      'O candidato não é aprovado no concurso e não estuda com constância.',
      'Se o candidato for aprovado no concurso, então ele estudou com constância.'
    ],
    correct_option: 'O candidato estuda com constância e não é aprovado no concurso.',
    explanation: 'Pela regra de equivalência e negação da condicional ~(p -> q) <-> p ^ ~q (conhecida mnemônica "MANÉ": Mantém a primeira E Nega a segunda). Portanto: "O candidato estuda com constância E não é aprovado no concurso".',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-rlm-05',
    topic_id: 'top-8',
    subject_id: 'subj-rlm',
    statement: 'Assinale a alternativa que apresenta uma proposição logicamente equivalente à condicional: "Se o servidor atua com zelo, então a sociedade é beneficiada":',
    options: [
      'Se a sociedade não é beneficiada, então o servidor não atua com zelo.',
      'Se a sociedade é beneficiada, então o servidor atua com zelo.',
      'Se o servidor não atua com zelo, então a sociedade não é beneficiada.',
      'O servidor atua com zelo e a sociedade não é beneficiada.',
      'O servidor não atua com zelo e a sociedade é beneficiada.'
    ],
    correct_option: 'Se a sociedade não é beneficiada, então o servidor não atua com zelo.',
    explanation: 'A equivalência lógica contrapositiva da condicional (P -> Q) estabelece que (P -> Q) <-> (~Q -> ~P) [inverte e nega ambas]. Portanto: "Se a sociedade não é beneficiada (~Q), então o servidor não atua com zelo (~P)".',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q-rlm-06',
    topic_id: 'top-8',
    subject_id: 'subj-rlm',
    statement: 'Segundo as Leis de Morgan, a negação lógica rigorosa da proposição conjuntiva "O candidato estuda Direito E pratica exercícios físicos" é:',
    options: [
      'O candidato não estuda Direito OU não pratica exercícios físicos.',
      'O candidato não estuda Direito E não pratica exercícios físicos.',
      'Se o candidato não estuda Direito, então não pratica exercícios físicos.',
      'O candidato estuda Direito OU pratica exercícios físicos.',
      'O candidato não estuda Direito mas pratica exercícios físicos.'
    ],
    correct_option: 'O candidato não estuda Direito OU não pratica exercícios físicos.',
    explanation: 'Pela 1ª Lei de De Morgan, a negação de uma conjunção ~(P ^ Q) equivale logicamente à disjunção das negações (~P v ~Q). Logo: "O candidato não estuda Direito OU não pratica exercícios físicos".',
    difficulty: 'EASY',
  }
];

let dbInstance: any = null;

export function getLocalDatabase(): any {
  if (dbInstance) return dbInstance;

  const sqlite = getSqliteModule();
  if (!sqlite || !sqlite.DatabaseSync) {
    throw new Error('Módulo node:sqlite não encontrado neste ambiente Node.js.');
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'concurso.db');
  const db = new sqlite.DatabaseSync(dbPath);

  // Enable WAL mode for high performance
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      hours_per_week REAL,
      available_days TEXT,
      session_duration_preference REAL,
      routine_restrictions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      institution TEXT,
      board TEXT,
      status TEXT DEFAULT 'OPEN',
      exam_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_exams (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      priority REAL DEFAULT 1,
      target_score REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      name TEXT NOT NULL,
      weight REAL DEFAULT 1.0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      subject_id TEXT,
      topic_id TEXT NOT NULL,
      statement TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'MEDIUM',
      source_type TEXT DEFAULT 'OFFICIAL',
      year INTEGER DEFAULT 2026,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      available_minutes REAL,
      weekly_target_hours REAL,
      version REAL DEFAULT 1,
      reason_for_change TEXT,
      status TEXT DEFAULT 'ACTIVE',
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS study_plan_items (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      user_id TEXT,
      topic_id TEXT NOT NULL,
      planned_date TEXT,
      duration_minutes REAL,
      intervention_type TEXT,
      priority_level TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      duration_minutes REAL,
      planned_duration_minutes REAL,
      questions_attempted REAL DEFAULT 0,
      questions_correct REAL DEFAULT 0,
      session_type TEXT DEFAULT 'PRACTICE',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT,
      topic_id TEXT NOT NULL,
      selected_option TEXT,
      is_correct INTEGER NOT NULL,
      time_spent_seconds REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_answers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exam_documents (
      id TEXT PRIMARY KEY,
      title TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'UPLOADED',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exam_document_drafts (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      rating REAL,
      category TEXT,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_interventions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      intervention_type TEXT,
      performance_before TEXT,
      performance_after TEXT,
      feeling TEXT,
      reason TEXT,
      confidence TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ai_flashcards (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      why_important TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS simulados (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      title TEXT NOT NULL,
      mode TEXT DEFAULT 'GENERAL',
      subject_filter TEXT,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER DEFAULT 0,
      wrong_answers INTEGER DEFAULT 0,
      unanswered INTEGER DEFAULT 0,
      time_limit_minutes INTEGER,
      time_spent_seconds INTEGER DEFAULT 0,
      score_percentage REAL DEFAULT 0,
      status TEXT DEFAULT 'IN_PROGRESS',
      question_ids TEXT NOT NULL,
      answers_payload TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      category TEXT DEFAULT 'GERAL',
      repetition_count INTEGER DEFAULT 0,
      interval_days INTEGER DEFAULT 0,
      ease_factor REAL DEFAULT 2.5,
      due_date TEXT DEFAULT (date('now')),
      status TEXT DEFAULT 'NEW',
      last_reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Auto-seed if exams table is empty
  seedLocalDatabaseIfEmpty(db);

  // Ensure latest questions are present
  ensureQuestionsSeeded(db);

  // Ensure latest flashcards are present
  ensureFlashcardsSeeded(db);

  dbInstance = db;
  return db;
}

function seedLocalDatabaseIfEmpty(db: any) {
  const checkExams = db.prepare('SELECT count(*) as count FROM exams').get() as { count: number };
  if (checkExams && checkExams.count > 0) {
    return;
  }

  console.log('[LocalDB] Inicializando banco de dados local com edital e questões...');

  const userId = 'local-user-id';
  const examId = 'exam-local-cnu';

  // 1. Insert default user
  db.prepare(`
    INSERT INTO users (id, name, hours_per_week, available_days, session_duration_preference, routine_restrictions)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'Estudante Concurseiro (Modo Local)',
    15,
    JSON.stringify(['seg', 'ter', 'qua', 'qui', 'sex', 'sab']),
    60,
    'Sem restrições declaradas'
  );

  // 2. Insert default exam
  db.prepare(`
    INSERT INTO exams (id, title, institution, board, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    examId,
    'Concurso Nacional Unificado - Edital Geral',
    'Governo Federal / MGI',
    'Cesgranrio / Cebraspe',
    'OPEN'
  );

  // 3. Insert user_exam
  db.prepare(`
    INSERT INTO user_exams (id, user_id, exam_id, priority)
    VALUES (?, ?, ?, ?)
  `).run('ue-1', userId, examId, 1);

  // 4. Subjects
  const subjects = [
    { id: 'subj-const', name: 'Direito Constitucional', weight: 1.5 },
    { id: 'subj-admin', name: 'Direito Administrativo', weight: 1.5 },
    { id: 'subj-port', name: 'Língua Portuguesa', weight: 2.0 },
    { id: 'subj-rlm', name: 'Raciocínio Lógico & Quantitativo', weight: 1.0 },
  ];

  for (const s of subjects) {
    db.prepare('INSERT INTO subjects (id, exam_id, name, weight) VALUES (?, ?, ?, ?)').run(
      s.id,
      examId,
      s.name,
      s.weight
    );
  }

  // 5. Topics
  const topics = [
    { id: 'top-1', subject_id: 'subj-const', name: 'Direitos e Deveres Individuais e Coletivos (Art. 5º CF)' },
    { id: 'top-2', subject_id: 'subj-const', name: 'Organização Político-Administrativa e Poderes' },
    { id: 'top-3', subject_id: 'subj-admin', name: 'Princípios Expressos e Implícitos da Administração' },
    { id: 'top-4', subject_id: 'subj-admin', name: 'Atos Administrativos: Elementos, Atributos e Extinção' },
    { id: 'top-5', subject_id: 'subj-port', name: 'Interpretação e Compreensão Textual' },
    { id: 'top-6', subject_id: 'subj-port', name: 'Concordância Verbal e Nominal' },
    { id: 'top-7', subject_id: 'subj-rlm', name: 'Lógica Proposicional, Conectivos e Tabelas-Verdade' },
    { id: 'top-8', subject_id: 'subj-rlm', name: 'Equivalências Lógicas e Negação de Proposições' },
  ];

  for (const t of topics) {
    db.prepare('INSERT INTO topics (id, subject_id, name) VALUES (?, ?, ?)').run(
      t.id,
      t.subject_id,
      t.name
    );
  }

  // 6. High Quality Realistic Questions
  const insertQ = db.prepare(`
    INSERT INTO questions (id, exam_id, subject_id, topic_id, statement, options, correct_option, explanation, difficulty, source_type, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of ALL_SEED_QUESTIONS) {
    insertQ.run(
      q.id,
      examId,
      q.subject_id,
      q.topic_id,
      q.statement,
      JSON.stringify(q.options),
      q.correct_option,
      q.explanation,
      q.difficulty,
      'OFFICIAL',
      2026
    );
  }

  // 7. Initial Study Plan
  const planId = 'plan-initial-1';
  db.prepare(`
    INSERT INTO study_plans (id, user_id, exam_id, available_minutes, weekly_target_hours, version, reason_for_change, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    planId,
    userId,
    examId,
    900,
    15,
    1,
    'Plano Inicial Automatizado (Modo Local)',
    'ACTIVE'
  );

  // 8. Plan items
  const planItems = [
    { id: 'pi-1', topic_id: 'top-1', duration: 120, priority: 'HIGH', intervention: 'PRACTICE' },
    { id: 'pi-2', topic_id: 'top-3', duration: 90, priority: 'HIGH', intervention: 'CONCEPT_MAP' },
    { id: 'pi-3', topic_id: 'top-5', duration: 120, priority: 'MEDIUM', intervention: 'PRACTICE' },
    { id: 'pi-4', topic_id: 'top-7', duration: 90, priority: 'NORMAL', intervention: 'PRACTICE' },
  ];

  const insertItem = db.prepare(`
    INSERT INTO study_plan_items (id, plan_id, user_id, topic_id, planned_date, duration_minutes, priority_level, intervention_type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const todayStr = new Date().toISOString().split('T')[0];
  for (const it of planItems) {
    insertItem.run(it.id, planId, userId, it.topic_id, todayStr, it.duration, it.priority, it.intervention, 'PENDING');
  }

  // 9. Initial historical sessions and attempts for analytics
  db.prepare(`
    INSERT INTO study_sessions (id, user_id, exam_id, topic_id, duration_minutes, questions_attempted, questions_correct, session_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('sess-1', userId, examId, 'top-1', 60, 10, 8, 'PRACTICE');

  db.prepare(`
    INSERT INTO study_sessions (id, user_id, exam_id, topic_id, duration_minutes, questions_attempted, questions_correct, session_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('sess-2', userId, examId, 'top-3', 45, 6, 5, 'THEORY');

  db.prepare(`
    INSERT INTO user_attempts (id, user_id, question_id, topic_id, selected_option, is_correct, time_spent_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('att-1', userId, 'q-const-01', 'top-1', ALL_SEED_QUESTIONS[0].correct_option, 1, 45);

  db.prepare(`
    INSERT INTO user_attempts (id, user_id, question_id, topic_id, selected_option, is_correct, time_spent_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('att-2', userId, 'q-admin-01', 'top-3', ALL_SEED_QUESTIONS[2].correct_option, 1, 35);

  console.log('[LocalDB] Banco de dados local inicializado com sucesso.');
}

function ensureQuestionsSeeded(db: any, examId: string = 'exam-local-cnu') {
  try {
    const existing = db.prepare('SELECT id FROM questions').all() as { id: string }[];
    const existingSet = new Set(existing.map((r: any) => r.id));

    const insertQ = db.prepare(`
      INSERT INTO questions (id, exam_id, subject_id, topic_id, statement, options, correct_option, explanation, difficulty, source_type, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let addedCount = 0;
    for (const q of ALL_SEED_QUESTIONS) {
      if (!existingSet.has(q.id)) {
        insertQ.run(
          q.id,
          examId,
          q.subject_id,
          q.topic_id,
          q.statement,
          JSON.stringify(q.options),
          q.correct_option,
          q.explanation,
          q.difficulty,
          'OFFICIAL',
          2026
        );
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(`[LocalDB] ${addedCount} novas questões inseridas com sucesso no banco local.`);
    }
  } catch (err) {
    console.error('[LocalDB] Erro ao sincronizar questões no banco local:', err);
  }
}

export const ALL_SEED_FLASHCARDS = [
  // Direito Constitucional (top-1 e top-2)
  {
    id: 'fc-const-01',
    topic_id: 'top-1',
    front: 'Quais são os únicos 2 crimes expressamente INAFIANÇÁVEIS e IMPRESCRITÍVEIS segundo a CF/88 (Art. 5º)?',
    back: 'Mnemônico RA-ÇÃO:\n• RA: Racismo (Art. 5º, XLII - sujeito a reclusão)\n• ÇÃO: Ação de grupos armados, civis ou militares, contra a ordem constitucional e o Estado Democrático (Art. 5º, XLIV).',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-const-02',
    topic_id: 'top-1',
    front: 'Quais são os crimes inafiançáveis e INSUSCETÍVEIS de graça ou anistia (Art. 5º, XLIII)?',
    back: 'Mnemônico 3T + H:\n• Tortura\n• Tráfico ilícito de entorpecentes\n• Terrorismo\n• Hediondos\n\n⚠️ Atenção: Eles prescrevem! Os únicos imprescritíveis são Racismo e Ação de grupos armados.',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-const-03',
    topic_id: 'top-1',
    front: 'Quais remédios constitucionais são gratuitos por expressa determinação constitucional (Art. 5º)?',
    back: '1. Habeas Corpus (gratuito sempre)\n2. Habeas Data (gratuito sempre)\n3. Ação Popular (gratuita, salvo comprovada má-fé do autor).',
    category: 'LEI_SECA'
  },
  {
    id: 'fc-const-04',
    topic_id: 'top-1',
    front: 'Quando é constitucionalmente lícito penetrar no domicílio alheio SEM consentimento à NOITE?',
    back: 'Somente em 3 hipóteses (Art. 5º, XI):\n1. Flagrante delito;\n2. Desastre;\n3. Para prestar socorro.\n\n⚠️ CUIDADO: Por determinação judicial só é permitido durante o DIA!',
    category: 'LEI_SECA'
  },
  {
    id: 'fc-const-05',
    topic_id: 'top-2',
    front: 'Quais são as 4 Cláusulas Pétreas expressas no Art. 60, § 4º da CF/88?',
    back: 'Mnemônico FO-VO-SE-DI:\n• FO: Forma federativa de Estado\n• VO: Voto direto, secreto, universal e periódico (não a obrigatoriedade!)\n• SE: Separação dos Poderes\n• DI: Direitos e garantias individuais',
    category: 'MNEMONICO'
  },

  // Direito Administrativo (top-3 e top-4)
  {
    id: 'fc-admin-01',
    topic_id: 'top-3',
    front: 'Quais são os 5 Princípios Constitucionais Expressos da Administração Pública (Art. 37, caput)?',
    back: 'Mnemônico L.I.M.P.E.:\n• L: Legalidade\n• I: Impessoalidade\n• M: Moralidade\n• P: Publicidade\n• E: Eficiência (acrescentado pela EC 19/98)',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-admin-02',
    topic_id: 'top-3',
    front: 'Qual a diferença entre ANULAÇÃO e REVOGAÇÃO de um ato administrativo (Súmula 473 STF)?',
    back: '• Anulação: incide sobre atos ILEGAIS. Efeito retroativo (ex tunc). Feita pela Administração ou Judiciário.\n• Revogação: incide sobre atos legais por motivo de CONVENIÊNCIA e OPORTUNIDADE. Efeito prospectivo (ex nunc). Feita exclusivamente pela Administração.',
    category: 'JURISPRUDENCIA'
  },
  {
    id: 'fc-admin-03',
    topic_id: 'top-3',
    front: 'Até qual grau de parentesco incide a vedação ao nepotismo fixada pela Súmula Vinculante 13 do STF?',
    back: 'Até o 3º grau (em linha reta, colateral ou por afinidade):\n• 1º grau: pais e filhos\n• 2º grau: avós, netos e irmãos\n• 3º grau: tios e sobrinhos\n(Inclui cônjuge, companheiro e nepotismo cruzado).',
    category: 'JURISPRUDENCIA'
  },
  {
    id: 'fc-admin-04',
    topic_id: 'top-4',
    front: 'Quais são os 5 elementos de validade do ato administrativo e quais admitem convalidação?',
    back: 'Mnemônico CO-FI-FO-MO-OB:\n• Competência\n• Finalidade\n• Forma\n• Motivo\n• Objeto\n\nConvalidação permitida: somente em vícios sanáveis de Competência (não exclusiva) e Forma (não essencial à validade).',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-admin-05',
    topic_id: 'top-4',
    front: 'Quais são os principais atributos do ato administrativo?',
    back: 'Mnemônico P.A.T.I.:\n• P: Presunção de legitimidade e veracidade (todos os atos possuem)\n• A: Autoexecutoriedade (execução direta sem necessidade prévia do Judiciário)\n• T: Tipicidade (deve corresponder a figura legal prévia)\n• I: Imperatividade (impõe obrigações a terceiros)',
    category: 'DOUTRINA'
  },

  // Língua Portuguesa (top-5 e top-6)
  {
    id: 'fc-port-01',
    topic_id: 'top-6',
    front: 'Como se conjuga o verbo HAVER quando empregado com sentido de existir, ocorrer ou tempo decorrido?',
    back: 'O verbo "haver" é impessoal! Não possui sujeito e permanece SEMPRE na 3ª pessoa do singular.\nEx: "Houve muitas dúvidas" (e NUNCA "houveram muitas dúvidas"); "Há três anos" (e não "fazem três anos").',
    category: 'LEI_SECA'
  },
  {
    id: 'fc-port-02',
    topic_id: 'top-6',
    front: 'Cite os 4 casos mais comuns em que o uso da crase é TERMINANTEMENTE PROIBIDO em provas:',
    back: '1. Antes de palavras masculinas (ex: a pé, a cavalo, a prazo)\n2. Antes de verbos (ex: a partir de, disposto a estudar)\n3. Entre palavras repetidas (ex: cara a cara, dia a dia)\n4. Antes de pronomes pessoais e de tratamento (ex: a ela, a você, a Vossa Senhoria)',
    category: 'LEI_SECA'
  },
  {
    id: 'fc-port-03',
    topic_id: 'top-6',
    front: 'Qual a regência do verbo ASPIRAR nos seus dois sentidos fundamentais?',
    back: '1. Sentido de inalar/respirar: VTD (sem preposição). Ex: Aspirou o ar puro da manhã.\n2. Sentido de almejar/pretender: VTI (exige preposição "a"). Ex: O concurseiro aspira ao cargo público.',
    category: 'LEI_SECA'
  },
  {
    id: 'fc-port-04',
    topic_id: 'top-6',
    front: 'Qual é a regra de ouro de pontuação que NUNCA pode ser violada em uma oração padrão?',
    back: 'NUNCA se separa com vírgula o Sujeito de seu respectivo Predicado, nem o Verbo de seus respectivos Complementos (objeto direto ou indireto).',
    category: 'LEI_SECA'
  },

  // Raciocínio Lógico (top-7 e top-8)
  {
    id: 'fc-rlm-01',
    topic_id: 'top-8',
    front: 'Como se nega rigorosamente uma proposição condicional "Se P, então Q" (P -> Q)?',
    back: 'Mnemônico MANÉ:\n• MA: Mantém a primeira parte (P)\n• NÉ: Nega a segunda parte (~Q)\nFórmula: ~(P -> Q) ≡ P ∧ ~Q\nExemplo: "Se estudo, passo" ➡️ "Estudo E não passo".',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-rlm-02',
    topic_id: 'top-8',
    front: 'Qual é a principal equivalência lógica da condicional "Se P, então Q" (P -> Q)?',
    back: 'A Contrapositiva (Inverte e Nega tudo):\n(P -> Q) ≡ (~Q -> ~P)\n\nExemplo: "Se bebo, não dirijo" ≡ "Se dirijo, não bebo".',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-rlm-03',
    topic_id: 'top-8',
    front: 'Qual é a negação da proposição conjuntiva "P e Q" (P ∧ Q) segundo as Leis de De Morgan?',
    back: 'Nega a primeira, troca o E pelo OU, e nega a segunda:\n~(P ∧ Q) ≡ ~P ∨ ~Q\n\nExemplo: "Estudo e trabalho" ➡️ "Não estudo OU não trabalho".',
    category: 'MNEMONICO'
  },
  {
    id: 'fc-rlm-04',
    topic_id: 'top-7',
    front: 'Como se nega logicamente a afirmação universal "Todo concurseiro é dedicado"?',
    back: 'Mnemônico PEA + NÃO:\n• P: Pelo menos um\n• E: Existe um\n• A: Algum\n+ NÃO é dedicado!\n\n⚠️ CUIDADO: NUNCA se nega "Todo" com "Nenhum"!',
    category: 'MNEMONICO'
  }
];

function ensureFlashcardsSeeded(db: any, examId: string = 'exam-local-cnu', userId: string = 'local-user-id') {
  try {
    const existing = db.prepare('SELECT id FROM flashcards').all() as { id: string }[];
    const existingSet = new Set(existing.map((r: any) => r.id));

    const insertFc = db.prepare(`
      INSERT INTO flashcards (id, user_id, exam_id, topic_id, front, back, category, repetition_count, interval_days, ease_factor, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?)
    `);

    let addedCount = 0;
    for (const fc of ALL_SEED_FLASHCARDS) {
      if (!existingSet.has(fc.id)) {
        insertFc.run(
          fc.id,
          userId,
          examId,
          fc.topic_id,
          fc.front,
          fc.back,
          fc.category,
          0,
          0,
          2.5,
          'NEW'
        );
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(`[LocalDB] ${addedCount} novos flashcards inseridos com sucesso no banco local.`);
    }
  } catch (err) {
    console.error('[LocalDB] Erro ao sincronizar flashcards no banco local:', err);
  }
}
