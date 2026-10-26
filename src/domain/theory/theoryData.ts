export interface LeiSecaItem {
  id: string;
  artigo: string;
  diploma: string;
  texto: string;
  grifos: string[];
  pegadinhas: string[];
  relevancia: 'ALTA' | 'MUITO_ALTA' | 'EXTREMA';
}

export interface SchematicItem {
  id: string;
  titulo: string;
  tipo: 'MNEMONICO' | 'FLUXOGRAMA' | 'PASSO_A_PASSO' | 'MAPA';
  mnemonicoBadge?: string;
  descricao: string;
  itens: {
    chave: string;
    significado: string;
    destaque?: string;
  }[];
  dicaBanca?: string;
}

export interface ComparisonItem {
  id: string;
  titulo: string;
  descricao: string;
  colunas: [string, string, string];
  linhas: {
    criterio: string;
    itemA: string;
    itemB: string;
  }[];
}

export interface JurisprudenciaItem {
  id: string;
  tribunal: 'STF' | 'STJ' | 'TST';
  tipo: 'SUMULA_VINCULANTE' | 'SUMULA' | 'TEMA_RG' | 'INFORMATIVO';
  numero: string;
  enunciado: string;
  comentario: string;
  impacto: string;
}

export interface TopicTheory {
  topicId: string;
  topicName: string;
  subjectName: string;
  resumoGeral: string;
  palavrasChave: string[];
  leiSeca: LeiSecaItem[];
  esquemas: SchematicItem[];
  comparacoes: ComparisonItem[];
  jurisprudencia: JurisprudenciaItem[];
  flashcardTemplates: {
    front: string;
    back: string;
    category: string;
  }[];
}

export const TOPIC_THEORY_DATABASE: Record<string, TopicTheory> = {
  // ==========================================
  // TOPIC 1: DIREITO CONSTITUCIONAL - ART. 5º
  // ==========================================
  'top-1': {
    topicId: 'top-1',
    topicName: 'Direitos e Deveres Individuais e Coletivos (Art. 5º CF)',
    subjectName: 'Direito Constitucional',
    resumoGeral: 'O Artigo 5º da CF/88 consagra os Direitos Fundamentais de primeira dimensão (liberdades individuais e negativas), com eficácia plena ou contida em sua maioria. São cláusulas pétreas (Art. 60, §4º, IV). É o tema com maior taxa de incidência histórica em concursos públicos.',
    palavrasChave: ['Inviolabilidade Domiciliar', 'Crimes Inafiançáveis', 'Remédios Constitucionais', 'Tribunal do Júri', 'LXXVIII Incisos'],
    leiSeca: [
      {
        id: 'ls-top1-1',
        artigo: 'Art. 5º, XI',
        diploma: 'CF/88',
        texto: 'A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.',
        grifos: ['salvo flagrante delito', 'desastre', 'prestar socorro', 'durante o dia por determinação judicial'],
        pegadinhas: [
          'A determinação judicial NUNCA autoriza entrada noturna, mesmo que o mandado expressamente autorize.',
          'À noite, somente 3 hipóteses: Flagrante delito, Desastre ou Socorro.',
          'Conceito de "casa" pelo STF é amplo: inclui quarto de hotel ocupado, trailers, consultórios médicos e escritórios de advocacia.'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top1-2',
        artigo: 'Art. 5º, XLII, XLIII e XLIV',
        diploma: 'CF/88',
        texto: 'XLII - a prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão, nos termos da lei;\nXLIII - a lei considerará crimes inafiançáveis e insuscetíveis de graça ou anistia a prática da tortura, o tráfico ilícito de entorpecentes e drogas afins, o terrorismo e os definidos como crimes hediondos (...);\nXLIV - constitui crime inafiançável e imprescritível a ação de grupos armados, civis ou militares, contra a ordem constitucional e o Estado Democrático.',
        grifos: ['Racismo: inafiançável e imprescritível (reclusão)', '3TH: inafiançáveis e insuscetíveis de graça ou anistia', 'Grupos Armados: inafiançável e imprescritível'],
        pegadinhas: [
          '3TH (Tortura, Tráfico, Terrorismo, Hediondos) PRESCREVEM! Apenas não admitem fiança, graça ou anistia.',
          'Os únicos IMPRESCRITÍVEIS são Racismo (com injúria racial equiparada pelo STF) e Ação de Grupos Armados.',
          'O racismo é punido com reclusão, nunca com detenção.'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top1-3',
        artigo: 'Art. 5º, LXVIII, LXIX, LXX, LXXI, LXXII, LXXIII',
        diploma: 'CF/88',
        texto: 'Remédios Constitucionais fundamentais: Habeas Corpus, Mandado de Segurança (individual e coletivo), Mandado de Injunção, Habeas Data e Ação Popular.',
        grifos: ['HC e HD são gratuitos', 'Ação Popular: isenta salvo má-fé', 'HD protege informação relativa à pessoa do impetrante'],
        pegadinhas: [
          'Habeas Data exige prévia recusa da via administrativa (Súmula 2 STJ). Não cabe para certidões de terceiros.',
          'Mandado de Injunção visa suprir falta de norma regulamentadora que torne inviável o exercício de direito constitucional.',
          'Ação Popular só pode ser proposta por CIDADÃO (eleitor com título regular). Pessoa jurídica NÃO tem legitimidade.'
        ],
        relevancia: 'MUITO_ALTA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top1-1',
        titulo: 'Regra de Ouro dos Crimes Constitucionais',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'RA-ÇÃO & 3T+H',
        descricao: 'Quais crimes são imprescritíveis vs insuscetíveis de graça/anistia?',
        itens: [
          { chave: 'RA-ÇÃO', significado: 'Racismo + Ação de Grupos Armados', destaque: 'INAFIANÇÁVEIS E IMPRESCRITÍVEIS' },
          { chave: '3T + H', significado: 'Tortura, Tráfico, Terrorismo e Hediondos', destaque: 'INAFIANÇÁVEIS E INSUSCETÍVEIS DE GRAÇA/ANISTIA (Prescrevem!)' }
        ],
        dicaBanca: 'Se a banca afirmar que crime hediondo é imprescritível, MARQUE ERRADO!'
      },
      {
        id: 'esq-top1-2',
        titulo: 'Inviolabilidade Domiciliar - Matriz de Horários',
        tipo: 'FLUXOGRAMA',
        descricao: 'Quando é lícito ingressar no domicílio?',
        itens: [
          { chave: 'Consentimento', significado: 'A qualquer momento (dia ou noite)' },
          { chave: 'Flagrante Delito', significado: 'A qualquer momento (dia ou noite)' },
          { chave: 'Desastre ou Socorro', significado: 'A qualquer momento (dia ou noite)' },
          { chave: 'Determinação Judicial', significado: 'SOMENTE DURANTE O DIA (critério solar ou 6h às 18h)' }
        ],
        dicaBanca: 'A banca costuma trocar "dia" por "a qualquer hora se houver ordem de juiz". Falso!'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top1-1',
        titulo: 'Remédios Constitucionais em Tabela Comparativa',
        descricao: 'Diferenças fundamentais de objeto, gratuidade e legitimidade.',
        colunas: ['Critério', 'Habeas Corpus / Habeas Data', 'Mandado de Segurança / Ação Popular'],
        linhas: [
          { criterio: 'Gratuidade Constitucional', itemA: 'Sempre GRATUITOS (ações gratuitas por texto expresso)', itemB: 'MS paga custas; AP é isenta SALVO comprovada má-fé' },
          { criterio: 'Exigência de Advogado', itemA: 'HC não exige capacidade postulatória (qualquer pessoa); HD exige advogado', itemB: 'Ambos exigem advogado regularmente inscrito na OAB' },
          { criterio: 'Objeto de Proteção', itemA: 'HC: Liberdade de locomoção; HD: Acesso/retificação de dados pessoais', itemB: 'MS: Direito líquido e certo; AP: Patrimônio público, moralidade e meio ambiente' }
        ]
      }
    ],
    jurisprudencia: [
      {
        id: 'jur-top1-1',
        tribunal: 'STF',
        tipo: 'SUMULA_VINCULANTE',
        numero: 'Súmula Vinculante 11',
        enunciado: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito.',
        comentario: 'O uso injustificado gera nulidade da prisão ou do ato processual, além de responsabilidade disciplinar, civil e penal da autoridade.',
        impacto: 'Cobrado em praticamente todos os certames de carreiras policiais, administrativas e jurídicas.'
      },
      {
        id: 'jur-top1-2',
        tribunal: 'STF',
        tipo: 'SUMULA_VINCULANTE',
        numero: 'Súmula Vinculante 25',
        enunciado: 'É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade do depósito.',
        comentario: 'Apenas a dívida de pensão alimentícia admite prisão civil no ordenamento brasileiro atual (Pacto de San José da Costa Rica com status supralegal).',
        impacto: 'Elimina de vez qualquer menção a prisão por depósito infiel.'
      }
    ],
    flashcardTemplates: [
      {
        front: 'Quais remédios constitucionais são gratuitos para qualquer cidadão segundo a CF/88?',
        back: '1. Habeas Corpus (HC)\n2. Habeas Data (HD)\n3. Ação Popular (gratuita, salvo comprovada má-fé).',
        category: 'LEI_SECA'
      },
      {
        front: 'Qual o mnemônico para os crimes inafiançáveis e imprescritíveis da CF/88?',
        back: 'RA-ÇÃO:\n• RA: Racismo\n• ÇÃO: Ação de grupos armados contra o Estado Democrático.',
        category: 'MNEMONICO'
      }
    ]
  },

  // ==========================================
  // TOPIC 2: DIREITO CONSTITUCIONAL - PODERES E FEDERAÇÃO
  // ==========================================
  'top-2': {
    topicId: 'top-2',
    topicName: 'Organização Político-Administrativa e Poderes',
    subjectName: 'Direito Constitucional',
    resumoGeral: 'Aborda a forma federativa (União, Estados, DF e Municípios autônomos, sem direito de secessão), a repartição constitucional de competências (Arts. 21 a 24) e as regras fundamentais dos Poderes Executivo, Legislativo e Judiciário, além das Cláusulas Pétreas (Art. 60, §4º).',
    palavrasChave: ['Federalismo', 'Competência Privativa x Concorrente', 'Cláusulas Pétreas', 'Separação dos Poderes', 'Art. 22 e 24'],
    leiSeca: [
      {
        id: 'ls-top2-1',
        artigo: 'Art. 22, I e Parágrafo Único',
        diploma: 'CF/88',
        texto: 'Compete privativamente à União legislar sobre: I - direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.\nParágrafo único. Lei complementar poderá autorizar os Estados a legislar sobre questões específicas das matérias relacionadas neste artigo.',
        grifos: ['privativamente à União', 'direitos substantivos', 'Lei Complementar autoriza Estados sobre questões específicas'],
        pegadinhas: [
          'Os Estados só podem legislar sobre matérias do Art. 22 se houver LEI COMPLEMENTAR federal autorizativa, e apenas para questões específicas (não genéricas).',
          'Não confunda competência privativa (delegável por LC) com competência exclusiva (Art. 21, indelegável).'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top2-2',
        artigo: 'Art. 24, I e §§ 1º a 4º',
        diploma: 'CF/88',
        texto: 'Compete à União, aos Estados e ao DF legislar concorrentemente sobre: I - direito tributário, financeiro, penitenciário, econômico e urbanístico.\n§ 1º No âmbito da legislação concorrente, a competência da União limitar-se-á a estabelecer normas gerais.\n§ 4º A superveniência de lei federal sobre normas gerais suspende a eficácia da lei estadual, no que lhe for contrário.',
        grifos: ['Tributário, financeiro, penitenciário, econômico e urbanístico', 'União: normas gerais', 'superveniência suspende a eficácia (não revoga)'],
        pegadinhas: [
          'A superveniência de lei federal geral SUSPENDE A EFICÁCIA da lei estadual contrária; NÃO a revoga!',
          'Municípios NÃO participam da competência concorrente do Art. 24 (apenas União, Estados e DF).'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top2-3',
        artigo: 'Art. 60, § 4º',
        diploma: 'CF/88',
        texto: 'Não será objeto de deliberação a proposta de emenda tendente a abolir: I - a forma federativa de Estado; II - o voto direto, secreto, universal e periódico; III - a separação dos Poderes; IV - os direitos e garantias individuais.',
        grifos: ['Forma federativa', 'Voto direto, secreto, universal e periódico', 'Separação dos Poderes', 'Direitos e garantias individuais'],
        pegadinhas: [
          'O voto OBRIGATÓRIO não é cláusula pétrea! Pode ser tornado facultativo por Emenda Constitucional.',
          'O sistema Presidencialista e a República NÃO são cláusulas pétreas expressas.'
        ],
        relevancia: 'MUITO_ALTA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top2-1',
        titulo: 'Competência Privativa da União vs Concorrente',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'CAPACETE de PIMENTA vs PUTO-FE',
        descricao: 'Como memorizar os ramos do Direito nas competências?',
        itens: [
          { chave: 'CAPACETE de PIMENTA', significado: 'Civil, Agrário, Penal, Aeronáutico, Comercial, Eleitoral, Trabalho, Espacial, Processual, Marítimo', destaque: 'Art. 22 - PRIVATIVA DA UNIÃO' },
          { chave: 'PUTO-FE', significado: 'Penitenciário, Urbanístico, Tributário, Orçamentário, Financeiro, Econômico', destaque: 'Art. 24 - CONCORRENTE (União + Estados + DF)' }
        ],
        dicaBanca: 'Processual é PRIVATIVO da União (Art. 22). Procedimento em matéria processual é CONCORRENTE (Art. 24).'
      },
      {
        id: 'esq-top2-2',
        titulo: 'Cláusulas Pétreas Expressas',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'FO-VO-SE-DI',
        descricao: 'Art. 60, § 4º da CF/88',
        itens: [
          { chave: 'FO', significado: 'Forma Federativa de Estado' },
          { chave: 'VO', significado: 'Voto direto, secreto, universal e periódico' },
          { chave: 'SE', significado: 'Separação dos Poderes' },
          { chave: 'DI', significado: 'Direitos e garantias individuais' }
        ],
        dicaBanca: 'Pegadinha certeira: a banca insere "voto obrigatório" ou "república" na lista.'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top2-1',
        titulo: 'Matriz de Competências Legislativas',
        descricao: 'Diferenças práticas entre o Art. 22 e o Art. 24 da Carta Magna.',
        colunas: ['Aspecto', 'Privativa da União (Art. 22)', 'Concorrente (Art. 24)'],
        linhas: [
          { criterio: 'Papel da União', itemA: 'Legisla com exclusividade inicial em todo o território', itemB: 'Limita-se a editar NORMAS GERAIS' },
          { criterio: 'Papel dos Estados', itemA: 'Só legislam se autorizados por Lei Complementar federal', itemB: 'Competência suplementar (ou plena se União omissa)' },
          { criterio: 'Participação de Municípios', itemA: 'Não participam', itemB: 'Não participam do caput (suplementam no que couber pelo Art. 30)' },
          { criterio: 'Conflito de Normas', itemA: 'Lei estadual não autorizada é formalmente inconstitucional', itemB: 'Superveniência da lei federal apenas suspende a eficácia da lei estadual' }
        ]
      }
    ],
    jurisprudencia: [
      {
        id: 'jur-top2-1',
        tribunal: 'STF',
        tipo: 'TEMA_RG',
        numero: 'Tema 1083 / ADI 6341',
        enunciado: 'Competência concorrente e suplementar de Estados e Municípios em matéria de saúde pública.',
        comentario: 'O STF pacificou que Estados e Municípios possuem competência para estabelecer restrições sanitárias no âmbito local.',
        impacto: 'Frequente em questões contemporâneas sobre competência e federalismo cooperativo.'
      }
    ],
    flashcardTemplates: [
      {
        front: 'Qual o mnemônico para as Cláusulas Pétreas do Art. 60, § 4º da CF/88?',
        back: 'FO-VO-SE-DI:\n• FO: Forma federativa\n• VO: Voto direto, secreto, universal e periódico\n• SE: Separação dos Poderes\n• DI: Direitos e garantias individuais.',
        category: 'MNEMONICO'
      },
      {
        front: 'O que ocorre com uma lei estadual quando surge uma lei federal posterior de normas gerais contrária?',
        back: 'A eficácia da lei estadual é SUSPENSA no que lhe for contrário (Art. 24, § 4º). Ela NÃO é revogada!',
        category: 'LEI_SECA'
      }
    ]
  },

  // ==========================================
  // TOPIC 3: DIREITO ADMINISTRATIVO - PRINCÍPIOS
  // ==========================================
  'top-3': {
    topicId: 'top-3',
    topicName: 'Princípios Expressos e Implícitos da Administração',
    subjectName: 'Direito Administrativo',
    resumoGeral: 'Aborda o regime jurídico-administrativo, centrado na Supremacia do Interesse Público e na Indisponibilidade do Interesse Público. Analisa os princípios expressos no Art. 37 da CF/88 (LIMPE) e os implícitos como Autotutela, Razoabilidade, Proporcionalidade, Continuidade e Segurança Jurídica.',
    palavrasChave: ['L.I.M.P.E.', 'Autotutela (Súmula 473)', 'Nepotismo (SV 13)', 'Impessoalidade', 'Moralidade Administrativa'],
    leiSeca: [
      {
        id: 'ls-top3-1',
        artigo: 'Art. 37, caput e § 1º',
        diploma: 'CF/88',
        texto: 'A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência e, também, ao seguinte: (...)\n§ 1º A publicidade dos atos, programas, obras, serviços e campanhas dos órgãos públicos deverá ter caráter educativo, informativo ou de orientação social, dela não podendo constar nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades ou servidores públicos.',
        grifos: ['Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência', 'Vedada promoção pessoal de autoridades'],
        pegadinhas: [
          'O princípio da EFICIÊNCIA foi incluído pela EC nº 19/1998 (Reforma Administrativa), não constava da redação original de 1988.',
          'A vedação à promoção pessoal decorre expressamente do Princípio da Impessoalidade.'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top3-2',
        artigo: 'Art. 2º e Art. 53',
        diploma: 'Lei 9.784/1999',
        texto: 'Art. 53. A Administração deve anular seus próprios atos, quando eivados de vício de legalidade, e pode revogá-los por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos.',
        grifos: ['Deve anular se ilegais', 'Pode revogar por conveniência ou oportunidade'],
        pegadinhas: [
          'Anulação é DEVER da Administração diante da ilegalidade (vinculado). Revogação é FACULDADE (discricionário).',
          'O direito de anular decai em 5 anos para atos com efeitos favoráveis aos destinatários, salvo comprovada má-fé (Art. 54).'
        ],
        relevancia: 'MUITO_ALTA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top3-1',
        titulo: 'Princípios Expressos da Administração',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'L.I.M.P.E.',
        descricao: 'Art. 37, caput da Constituição Federal',
        itens: [
          { chave: 'L', significado: 'Legalidade (Admin só faz o que a lei expressamente autoriza)' },
          { chave: 'I', significado: 'Impessoalidade (Finalidade pública e vedação à promoção pessoal)' },
          { chave: 'M', significado: 'Moralidade (Probidade, boa-fé e ética administrativa)' },
          { chave: 'P', significado: 'Publicidade (Transparência obrigatória, sigilo é exceção)' },
          { chave: 'E', significado: 'Eficiência (Produtividade, rendimento e otimização de recursos)' }
        ],
        dicaBanca: 'Supremacia e Indisponibilidade do interesse público são as "pedras de toque", mas são princípios IMPLÍCITOS!'
      },
      {
        id: 'esq-top3-2',
        titulo: 'Autotutela Administrativa',
        tipo: 'MAPA',
        descricao: 'Súmula 473 do STF e Art. 53 da Lei 9.784/99',
        itens: [
          { chave: 'Ato ILEGAL', significado: 'ANULAÇÃO', destaque: 'Efeito Ex Tunc (retroage) | Adm ou Judiciário' },
          { chave: 'Ato INOPORTUNO/INCONVENIENTE', significado: 'REVOGAÇÃO', destaque: 'Efeito Ex Nunc (não retroage) | Exclusivo da Administração' }
        ],
        dicaBanca: 'O Poder Judiciário NUNCA pode revogar ato discricionário da Administração por mérito!'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top3-1',
        titulo: 'Anulação versus Revogação',
        descricao: 'O confronto mais cobrado em provas de Direito Administrativo.',
        colunas: ['Critério', 'Anulação', 'Revogação'],
        linhas: [
          { criterio: 'Motivo', itemA: 'Ilegalidade / Ilegitimidade do ato', itemB: 'Mérito (Conveniência e Oportunidade)' },
          { criterio: 'Efeitos Temporais', itemA: 'Ex Tunc (retroage à origem do ato)', itemB: 'Ex Nunc (prospectivo, respeita efeitos passados)' },
          { criterio: 'Quem pode praticar', itemA: 'Administração Pública OU Poder Judiciário', itemB: 'EXCLUSIVAMENTE a Administração Pública emitente' },
          { criterio: 'Prazo Decadencial', itemA: '5 anos para atos favoráveis (salvo má-fé)', itemB: 'Não há prazo decadencial enquanto o ato subsistir' }
        ]
      }
    ],
    jurisprudencia: [
      {
        id: 'jur-top3-1',
        tribunal: 'STF',
        tipo: 'SUMULA_VINCULANTE',
        numero: 'Súmula Vinculante 13 (Antinepotismo)',
        enunciado: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, para cargo em comissão ou função de confiança viola a Constituição Federal.',
        comentario: 'Exceção pacificada pelo STF: Cargos de natureza POLÍTICA (ex: Ministros de Estado e Secretários Estaduais/Municipais) NÃO se submetem à SV 13, salvo nepotismo cruzado ou flagrante ausência de qualificação técnica.',
        impacto: 'Tema favoritíssimo da FGV e Cebraspe.'
      },
      {
        id: 'jur-top3-2',
        tribunal: 'STF',
        tipo: 'SUMULA',
        numero: 'Súmula 473',
        enunciado: 'A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade...',
        comentario: 'Consagra o princípio fundamental da autotutela administrativa.',
        impacto: 'A súmula de direito público mais citada em bancas examinadoras.'
      }
    ],
    flashcardTemplates: [
      {
        front: 'Qual a diferença de efeitos temporais entre anulação e revogação de ato administrativo?',
        back: '• Anulação: Ex Tunc (retroage à origem).\n• Revogação: Ex Nunc (não retroage, vigora para o futuro).',
        category: 'JURISPRUDENCIA'
      },
      {
        front: 'A Súmula Vinculante 13 (nepotismo) se aplica irrestritamente a cargos políticos como Ministros e Secretários?',
        back: 'NÃO! O STF fixou que a SV 13 não alcança cargos de natureza eminentemente política, salvo fraude comprovada ou ausência absoluta de qualificação.',
        category: 'JURISPRUDENCIA'
      }
    ]
  },

  // ==========================================
  // TOPIC 4: DIREITO ADMINISTRATIVO - ATOS ADMINISTRATIVOS
  // ==========================================
  'top-4': {
    topicId: 'top-4',
    topicName: 'Atos Administrativos: Elementos, Atributos e Extinção',
    subjectName: 'Direito Administrativo',
    resumoGeral: 'Estudo dogmático dos atos administrativos: conceito, requisitos de validade (elementos), atributos (presunção, imperatividade, autoexecutoriedade, tipicidade), classificação, espécies e formas de desfazimento/convalidação.',
    palavrasChave: ['CO-FI-FO-MO-OB', 'P.A.T.I.', 'Convalidação', 'Desvio de Finalidade', 'Motivação'],
    leiSeca: [
      {
        id: 'ls-top4-1',
        artigo: 'Art. 2º',
        diploma: 'Lei 4.717/1965 (Ação Popular)',
        texto: 'São nulos os atos lesivos ao patrimônio das entidades mencionadas no artigo anterior, nos casos de: a) incompetência; b) vício de forma; c) ilegalidade do objeto; d) inexistência dos motivos; e) desvio de finalidade.',
        grifos: ['incompetência', 'vício de forma', 'ilegalidade do objeto', 'inexistência dos motivos', 'desvio de finalidade'],
        pegadinhas: [
          'Os 5 requisitos de validade do ato decorrem desta lei: Competência, Finalidade, Forma, Motivo e Objeto.',
          'Desvio de finalidade ocorre quando o agente pratica o ato visando a fim diverso daquele previsto na lei.'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top4-2',
        artigo: 'Art. 55',
        diploma: 'Lei 9.784/1999',
        texto: 'Em decisão na qual se evidencie não acarretarem lesão ao interesse público nem prejuízo a terceiros, os atos que apresentarem defeitos sanáveis poderão ser convalidados pela própria Administração.',
        grifos: ['defeitos sanáveis', 'sem lesão ao interesse público', 'sem prejuízo a terceiros', 'efeito ex tunc'],
        pegadinhas: [
          'Apenas DOIS elementos admitem convalidação: COMPETÊNCIA (se não for privativa/exclusiva) e FORMA (se não for essencial à validade).',
          'Finalidade, Motivo e Objeto NUNCA admitem convalidação!'
        ],
        relevancia: 'EXTREMA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top4-1',
        titulo: 'Requisitos / Elementos de Validade do Ato',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'CO - FI - FO - MO - OB',
        descricao: 'Os 5 elementos indispensáveis para a existência do ato administrativo',
        itens: [
          { chave: 'CO', significado: 'Competência (Sujeito dotado de poder legal para o ato)', destaque: 'Convalidável (se não exclusiva)' },
          { chave: 'FI', significado: 'Finalidade (Interesse público específico)', destaque: 'NUNCA Convalidável' },
          { chave: 'FO', significado: 'Forma (Modo de exteriorização do ato)', destaque: 'Convalidável (se não essencial)' },
          { chave: 'MO', significado: 'Motivo (Pressupostos de fato e de direito)', destaque: 'NUNCA Convalidável' },
          { chave: 'OB', significado: 'Objeto (Conteúdo do ato, efeito jurídico imediato)', destaque: 'NUNCA Convalidável' }
        ],
        dicaBanca: 'Quais admitem convalidação? Apenas FO-CO (Forma e Competência)!'
      },
      {
        id: 'esq-top4-2',
        titulo: 'Atributos do Ato Administrativo',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'P. A. T. I.',
        descricao: 'Características que distinguem o ato administrativo dos atos de direito privado',
        itens: [
          { chave: 'P', significado: 'Presunção de Legitimidade e Veracidade (Presente em TODOS os atos)' },
          { chave: 'A', significado: 'Autoexecutoriedade (Execução direta sem prévia autorização judicial)' },
          { chave: 'T', significado: 'Tipicidade (Previsão legal prévia da figura jurídica)' },
          { chave: 'I', significado: 'Imperatividade (Imposição unilateral obrigatória a terceiros)' }
        ],
        dicaBanca: 'Nem todos os atos têm Autoexecutoriedade ou Imperatividade (ex: atos negociais como licença e certidão não têm).'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top4-1',
        titulo: 'Formas de Extinção do Ato Administrativo',
        descricao: 'Diferenças essenciais entre anulação, revogação, cassação e caducidade.',
        colunas: ['Modalidade', 'Causa da Extinção', 'Momento do Vício / Fato'],
        linhas: [
          { criterio: 'Anulação', itemA: 'Ilegalidade originária do ato', itemB: 'Originário (já nasce nulo ou anulável)' },
          { criterio: 'Revogação', itemA: 'Inconveniência ou inoportunidade (mérito)', itemB: 'Superveniente (a Administração mudou de critério)' },
          { criterio: 'Cassação', itemA: 'Descumprimento de condições pelo particular beneficiário', itemB: 'Superveniente (ex: hotel que vira prostíbulo ilegal)' },
          { criterio: 'Caducidade', itemA: 'Advento de nova lei que torna o ato proibido', itemB: 'Superveniente (norma superveniente incompatível)' }
        ]
      }
    ],
    jurisprudencia: [
      {
        id: 'jur-top4-1',
        tribunal: 'STJ',
        tipo: 'SUMULA',
        numero: 'Teoria dos Motivos Determinantes',
        enunciado: 'A validade do ato vincula-se aos motivos indicados pela Administração como seu fundamento fático.',
        comentario: 'Se a autoridade exonera servidor alegando corte de verbas e no dia seguinte nomeia outro para a mesma vaga, o ato é nulo por vício de motivo.',
        impacto: 'Doutrina consolidada reiteradamente exigida pelas bancas.'
      }
    ],
    flashcardTemplates: [
      {
        front: 'Quais os 5 elementos do ato administrativo e quais admitem convalidação?',
        back: 'Elementos (CO-FI-FO-MO-OB):\n1. Competência (Convalidável se não exclusiva)\n2. Finalidade\n3. Forma (Convalidável se não essencial)\n4. Motivo\n5. Objeto\n\nMacete da Convalidação: Só FO-CO (Forma e Competência)!',
        category: 'MNEMONICO'
      },
      {
        front: 'Quais atributos estão presentes em TODOS os atos administrativos?',
        back: 'A Presunção de Legitimidade/Veracidade e a Tipicidade.\n\n⚠️ Atenção: A Imperatividade e a Autoexecutoriedade NÃO estão presentes em todos os atos (ex: certidões, pareceres e licenças não têm imperatividade).',
        category: 'DOUTRINA'
      }
    ]
  },

  // ==========================================
  // TOPIC 5: LÍNGUA PORTUGUESA - INTERPRETAÇÃO TEXTUAL
  // ==========================================
  'top-5': {
    topicId: 'top-5',
    topicName: 'Interpretação e Compreensão Textual',
    subjectName: 'Língua Portuguesa',
    resumoGeral: 'Trata da análise textual para concursos: distinção entre compreensão (conteúdo explícito no texto) e interpretação (inferência e pressuposição lógica), tipologia textual (narrativa, descritiva, dissertativa, injuntiva), coesão e coerência.',
    palavrasChave: ['Compreensão x Interpretação', 'Tipologia Textual', 'Inferência Lógica', 'Coesão Referencial', 'Extrapolação'],
    leiSeca: [
      {
        id: 'ls-top5-1',
        artigo: 'Regra de Ouro da Interpretação',
        diploma: 'Linguística Textual',
        texto: 'A interpretação de textos em concursos afere a capacidade de decodificar mensagens explícitas e implícitas sem cometer os 3 erros capitais: Extrapolação (ir além do texto), Redução (restringir o sentido geral a um detalhe) e Contradição (concluir o oposto do expresso).',
        grifos: ['Extrapolação', 'Redução', 'Contradição'],
        pegadinhas: [
          'Comandos do tipo "Segundo o texto" exigem estrita COMPREENSÃO (está escrito no texto).',
          'Comandos do tipo "Infere-se do texto" ou "Depreende-se" exigem INTERPRETAÇÃO (dedução válida autorizada pelo texto).'
        ],
        relevancia: 'EXTREMA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top5-1',
        titulo: 'Compreensão versus Interpretação',
        tipo: 'MAPA',
        descricao: 'Como interpretar o comando da questão para não errar a resposta',
        itens: [
          { chave: 'Comandos de COMPREENSÃO', significado: '"Segundo o texto...", "Conforme o autor afirma...", "De acordo com o 2º parágrafo..."', destaque: 'A resposta está ESCRITA e explícita no texto' },
          { chave: 'Comandos de INTERPRETAÇÃO', significado: '"Infere-se que...", "Depreende-se do texto que...", "O texto sugere que..."', destaque: 'A resposta é uma dedução lógica permitida pelo texto' }
        ],
        dicaBanca: 'Em questões de "Segundo o texto", se a alternativa trouxer uma reflexão filosófica brilhante mas que não está no texto, está ERRADA!'
      },
      {
        id: 'esq-top5-2',
        titulo: 'Tipologias Textuais Dominantes',
        tipo: 'PASSO_A_PASSO',
        descricao: 'Características essenciais cobradas nas provas',
        itens: [
          { chave: 'Dissertativo-Argumentativo', significado: 'Defesa de uma tese com argumentos convincentes, dados e conclusão.', destaque: 'Mais comum em vestibulares e concursos' },
          { chave: 'Narrativo', significado: 'Sucessão temporal de fatos, personagens, narrador, espaço e tempo linear.', destaque: 'Verbos no pretérito' },
          { chave: 'Injuntivo / Instrucional', significado: 'Instruções para realizar uma ação, receitas, manuais, leis.', destaque: 'Verbos no imperativo' }
        ]
      }
    ],
    comparacoes: [
      {
        id: 'comp-top5-1',
        titulo: 'Os 3 Erros Capitais de Leitura em Prova',
        descricao: 'Como as bancas montam alternativas falsas para induzir o candidato ao erro.',
        colunas: ['Tipo de Erro', 'Como a Banca Constrói', 'Como Neutralizar'],
        linhas: [
          { criterio: 'Extrapolação', itemA: 'Usa seu conhecimento prévio de mundo para colocar fatos verdadeiros que NÃO estão no texto', itemB: 'Apegue-se apenas às linhas do texto-base' },
          { criterio: 'Redução', itemA: 'Pega uma exceção ou exemplo minúsculo do texto e diz que é a ideia central', itemB: 'Localize a tese do autor no 1º parágrafo e na conclusão' },
          { criterio: 'Contradição', itemA: 'Inverte o sentido de uma oração usando palavras como "apenas", "sempre" ou "nunca"', itemB: 'Desconfie de termos generalizantes radicais' }
        ]
      }
    ],
    jurisprudencia: [],
    flashcardTemplates: [
      {
        front: 'Qual a diferença crucial entre "Compreensão" e "Interpretação" em provas de Língua Portuguesa?',
        back: '• Compreensão: Informação EXPLÍCITA no texto ("segundo o autor...", "o texto afirma...").\n• Interpretação: Dedução e inferência lógica IMPLÍCITA ("infere-se...", "conclui-se...", "depreende-se...").',
        category: 'TEORIA'
      }
    ]
  },

  // ==========================================
  // TOPIC 6: LÍNGUA PORTUGUESA - CONCORDÂNCIA
  // ==========================================
  'top-6': {
    topicId: 'top-6',
    topicName: 'Concordância Verbal e Nominal',
    subjectName: 'Língua Portuguesa',
    resumoGeral: 'Regras de flexão do verbo com o sujeito (concordância verbal) e dos adjetivos/artigos/pronomes com os substantivos (concordância nominal). Destaque obrigatório para os verbos impessoais (haver, fazer) e a partícula SE apassivadora vs índice.',
    palavrasChave: ['Verbo Haver Impessoal', 'Verbo Fazer', 'Partícula SE', 'É Proibido / É Proibida', 'Sujeito Composto'],
    leiSeca: [
      {
        id: 'ls-top6-1',
        artigo: 'Regra dos Verbos Impessoais',
        diploma: 'Gramática Normativa',
        texto: 'Os verbos HAVER (no sentido de existir, acontecer ou indicando tempo decorrido) e FAZER (indicando tempo decorrido ou fenômeno climático) são impessoais: NÃO possuem sujeito e devem permanecer OBRIGATORIAMENTE na 3ª pessoa do singular.',
        grifos: ['Haver com sentido de existir = singular', 'Fazer indicando tempo = singular', 'Transmitem impessoalidade ao verbo auxiliar'],
        pegadinhas: [
          'É ERRADO dizer: "Haviam muitas pessoas". O correto é: "HAVIA muitas pessoas".',
          'É ERRADO dizer: "Fazem três anos". O correto é: "FAZ três anos".',
          'Locuções verbais transmitem a impessoalidade: "DEVE HAVER soluções" (e não "devem haver").'
        ],
        relevancia: 'EXTREMA'
      },
      {
        id: 'ls-top6-2',
        artigo: 'A Partícula SE na Concordância',
        diploma: 'Gramática Normativa',
        texto: 'Com VTD ou VTDI: SE é Pronome Apassivador e o verbo concorda com o sujeito paciente (ex: "Vendem-se casas"). Com VTI, VI ou VL: SE é Índice de Indeterminação do Sujeito e o verbo fica fixo no singular (ex: "Precisa-se de operários").',
        grifos: ['VTD + SE = concorda com o sujeito', 'VTI + SE = verbo sempre no singular'],
        pegadinhas: [
          '"Alugam-se apartamentos" (Certo! Casas é sujeito paciente).\n"Precisa-se de funcionários" (Certo! Não vai para o plural porque é VTI com preposição).',
          'A presença de preposição logo após o verbo geralmente impede o plural.'
        ],
        relevancia: 'EXTREMA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top6-1',
        titulo: 'Matriz da Partícula SE',
        tipo: 'MAPA',
        mnemonicoBadge: 'VTD x VTI',
        descricao: 'Como definir se o verbo vai para o plural com SE',
        itens: [
          { chave: 'VTD + SE', significado: 'Pronome Apassivador: O substantivo é SUJEITO. Verbo concorda! Ex: "Compram-se carros".' },
          { chave: 'VTI + SE', significado: 'Índice de Indeterminação: Tem preposição! Verbo SEMPRE no singular! Ex: "Trata-se de assuntos urgentes".' },
          { chave: 'VI ou VL + SE', significado: 'Índice de Indeterminação: Verbo SEMPRE no singular! Ex: "Vive-se bem aqui".' }
        ],
        dicaBanca: 'Viu preposição "de", "em", "a" depois de verbo + SE? 99% de chance de o verbo ficar no singular!'
      },
      {
        id: 'esq-top6-2',
        titulo: 'Expressões: "É proibido" / "É bom" / "É necessário"',
        tipo: 'PASSO_A_PASSO',
        descricao: 'Regra prática para concordância nominal',
        itens: [
          { chave: 'Sem artigo / determinante', significado: 'Fica no MASCULINO singular: "É PROIBIDO entrada de estranhos".' },
          { chave: 'Com artigo / determinante', significado: 'FLEXIONA obrigatoriamente: "É PROIBIDA A entrada de estranhos".' }
        ]
      }
    ],
    comparacoes: [
      {
        id: 'comp-top6-1',
        titulo: 'Haver (Existir) versus Existir',
        descricao: 'O contraste sintático mais frequente em bancas.',
        colunas: ['Critério', 'Verbo HAVER (no sentido de existir)', 'Verbo EXISTIR'],
        linhas: [
          { criterio: 'Tipo de Sujeito', itemA: 'Oração SEM SUJEITO (verbo impessoal)', itemB: 'Possui SUJEITO NORMAL' },
          { criterio: 'Flexão com plural', itemA: 'Sempre no SINGULAR ("Havia problemas")', itemB: 'FLEXIONA normalmente ("Existiam problemas")' },
          { criterio: 'Função do substantivo', itemA: 'É Objeto Direto ("problemas" = OD)', itemB: 'É Sujeito ("problemas" = Sujeito)' },
          { criterio: 'Locuções Verbais', itemA: '"Pode haver dúvidas" (auxiliar no singular)', itemB: '"Podem existir dúvidas" (auxiliar no plural)' }
        ]
      }
    ],
    jurisprudencia: [],
    flashcardTemplates: [
      {
        front: 'Por que a frase "Fazem dois anos que não o vejo" está gramaticalmente incorreta?',
        back: 'Porque o verbo FAZER indicando tempo decorrido é IMPESSOAL. Não admite plural: o correto é "FAZ dois anos".',
        category: 'GRAMATICA'
      },
      {
        front: 'Qual a concordância correta com a partícula SE: "Aluga-se salas" ou "Alugam-se salas"? Por quê?',
        back: 'O correto é "ALUGAM-SE salas".\nComo "alugar" é Verbo Transitivo Direto (VTD), o "se" atua como Pronome Apassivador e "salas" é o sujeito paciente plural.',
        category: 'GRAMATICA'
      }
    ]
  },

  // ==========================================
  // TOPIC 7: RACIOCÍNIO LÓGICO - CONECTIVOS E TABELAS
  // ==========================================
  'top-7': {
    topicId: 'top-7',
    topicName: 'Lógica Proposicional, Conectivos e Tabelas-Verdade',
    subjectName: 'Raciocínio Lógico & Quantitativo',
    resumoGeral: 'Aborda proposições lógicas simples e compostas, operadores booleanos (E, OU, OU... OU, SE... ENTÃO, SE E SOMENTE SE), regras de valoração da tabela-verdade, tautologia, contradição e contingência.',
    palavrasChave: ['Tabela-Verdade', 'Vera Fischer', 'Conectivos Lógicos', 'Tautologia', 'Proposição Composta'],
    leiSeca: [
      {
        id: 'ls-top7-1',
        artigo: 'Regras de Valoração dos 5 Conectivos',
        diploma: 'Lógica Matemática',
        texto: '• Conjunção (p ∧ q): É verdadeira SOMENTE se ambas forem verdadeiras.\n• Disjunção (p ∨ q): É falsa SOMENTE se ambas forem falsas.\n• Disjunção Exclusiva (p ⊻ q): É verdadeira quando tiverem valores lógicos DIFERENTES.\n• Condicional (p → q): É falsa SOMENTE quando a primeira for V e a segunda for F (Vera Fischer).\n• Bicondicional (p ↔ q): É verdadeira quando tiverem valores lógicos IGUAIS.',
        grifos: ['Condicional falsa: V → F', 'Bicondicional: valores iguais', 'Conjunção: ambas V'],
        pegadinhas: [
          'Na condicional (p → q), se o antecedente p for FALSO, a proposição inteira é SEMPRE VERDADEIRA!',
          'Se... então NÃO exige relação de causa e efeito temporal na lógica formal.'
        ],
        relevancia: 'EXTREMA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top7-1',
        titulo: 'A Tabela-Verdade Resumida dos Conectivos',
        tipo: 'MAPA',
        mnemonicoBadge: 'VERA FISCHER',
        descricao: 'Como acertar qualquer questão de valoração em segundos',
        itens: [
          { chave: 'E (∧)', significado: 'Exigente: Só dá V quando tudo for V.' },
          { chave: 'OU (∨)', significado: 'Generoso: Basta um V para dar V. Só dá F se tudo for F.' },
          { chave: 'OU... OU (⊻)', significado: 'Incompatível: Dá V se forem DIFERENTES (V e F, ou F e V).' },
          { chave: 'SE... ENTÃO (→)', significado: 'VERA FISCHER: Dá FALSIDADE somente no caso V → F = F. O resto é tudo V!' },
          { chave: 'SE E SOMENTE SE (↔)', significado: 'Gêmeos: Dá V se forem IGUAIS (V e V, ou F e F).' }
        ],
        dicaBanca: 'Memorize apenas os casos excepcionais de cada conectivo!'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top7-1',
        titulo: 'Classificação das Proposições Compostas',
        descricao: 'Diferença entre tautologia, contradição e contingência.',
        colunas: ['Conceito', 'Definição', 'Exemplo Clássico'],
        linhas: [
          { criterio: 'Tautologia', itemA: 'Tabela-verdade SEMPRE VERDADEIRA em todas as hipóteses', itemB: 'p ∨ ¬p ("Está chovendo ou não está chovendo")' },
          { criterio: 'Contradição', itemA: 'Tabela-verdade SEMPRE FALSA em todas as hipóteses', itemB: 'p ∧ ¬p ("Sou brasileiro e não sou brasileiro")' },
          { criterio: 'Contingência', itemA: 'Pode ser verdadeira ou falsa a depender das premissas', itemB: 'p → q' }
        ]
      }
    ],
    jurisprudencia: [],
    flashcardTemplates: [
      {
        front: 'Em qual única hipótese uma proposição condicional "Se P, então Q" (P → Q) é FALSA?',
        back: 'Apenas no caso "VERA FISCHER":\nQuando o antecedente P é VERDADEIRO e o consequente Q é FALSO (V → F = F). Em todas as demais combinações, ela é VERDADEIRA!',
        category: 'LOGICA'
      }
    ]
  },

  // ==========================================
  // TOPIC 8: RACIOCÍNIO LÓGICO - EQUIVALÊNCIAS E NEGAÇÕES
  // ==========================================
  'top-8': {
    topicId: 'top-8',
    topicName: 'Equivalências Lógicas e Negação de Proposições',
    subjectName: 'Raciocínio Lógico & Quantitativo',
    resumoGeral: 'Técnicas de transformação de proposições compostas mantendo o valor lógico (equivalências) e inversão exata de valor lógico (negações). Foco em Leis de De Morgan, Negação do Se... Então (MANÉ), Contrapositiva e Negação de Quantificadores (Todo, Nenhum, Algum).',
    palavrasChave: ['Regra do MANÉ', 'De Morgan', 'Contrapositiva', 'Regra do NEYMAR', 'Quantificadores Todo/Algum'],
    leiSeca: [
      {
        id: 'ls-top8-1',
        artigo: 'Leis Fundamentais de Equivalência e Negação',
        diploma: 'Álgebra de Boole',
        texto: '• Contrapositiva: (p → q) ≡ (¬q → ¬p) [Inverte e nega ambas].\n• Equivalência Se/Ou (NEYMAR): (p → q) ≡ (¬p ∨ q) [Nega a 1ª OU Mantém a 2ª].\n• Negação do Se... Então (MANÉ): ¬(p → q) ≡ (p ∧ ¬q) [Mantém a 1ª E Nega a 2ª].\n• Leis de De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q e ¬(p ∨ q) ≡ ¬p ∧ ¬q.\n• Negação do TODO: Algum / Pelo menos um / Existe um + NÃO.',
        grifos: ['Negação do Se Então: MANÉ vira E', 'Contrapositiva: inverte e nega', 'Negação de Todo nunca é Nenhum'],
        pegadinhas: [
          'A negação de "Se chover, fico em casa" NUNCA começa com "Se"! O "Se... então" morre na negação e vira conjunção "E".',
          'NUNCA se nega "Todo homem é mortal" com "Nenhum homem é mortal". O correto é "Pelo menos um homem NÃO é mortal".'
        ],
        relevancia: 'EXTREMA'
      }
    ],
    esquemas: [
      {
        id: 'esq-top8-1',
        titulo: 'A Regra do MANÉ (Negação da Condicional)',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'MA - NÉ',
        descricao: 'Como negar com 100% de precisão "Se p, então q"',
        itens: [
          { chave: 'MA', significado: 'MANTÉM a primeira proposição idêntica (p)' },
          { chave: '∧', significado: 'Troca o "Se... então" pela conjunção "E"' },
          { chave: 'NÉ', significado: 'NEGA a segunda proposição (¬q)' }
        ],
        dicaBanca: 'Exemplo clássico: "Se estudo, passo". Negação: "Estudo E não passo".'
      },
      {
        id: 'esq-top8-2',
        titulo: 'Equivalências do Se... Então',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'CONTRAPOSITIVA & NEYMAR',
        descricao: 'As duas formas aceitas de reescrever uma condicional',
        itens: [
          { chave: 'Contrapositiva', significado: 'Inverte tudo e nega tudo: (p → q) vira (¬q → ¬p)' },
          { chave: 'NEYMAR', significado: 'NEga a primeira OU MÁntém a segunda: (¬p ∨ q)' }
        ],
        dicaBanca: 'Se a questão pedir "equivalente a se... então", procure primeiro a contrapositiva nas alternativas!'
      },
      {
        id: 'esq-top8-3',
        titulo: 'Negação de Quantificadores Lógicos',
        tipo: 'MNEMONICO',
        mnemonicoBadge: 'PEA + NÃO',
        descricao: 'Como negar o quantificador "TODO"',
        itens: [
          { chave: 'P', significado: 'Pelo menos um' },
          { chave: 'E', significado: 'Existe' },
          { chave: 'A', significado: 'Algum' },
          { chave: '+ NÃO', significado: '...NÃO é! Ex: "Todo político mente" -> "Algum político NÃO mente".' }
        ],
        dicaBanca: 'Pegadinha garantida: a banca coloca "Nenhum político mente" como negação de "Todo". É falso!'
      }
    ],
    comparacoes: [
      {
        id: 'comp-top8-1',
        titulo: 'Equivalência versus Negação de p → q',
        descricao: 'O erro mais comum cometido por candidatos cansados.',
        colunas: ['Operação', 'Fórmula', 'Exemplo ("Se corro, canso")'],
        linhas: [
          { criterio: 'Equivalência 1 (Contrapositiva)', itemA: '¬q → ¬p', itemB: '"Se não canso, não corro"' },
          { criterio: 'Equivalência 2 (Ne.. ou.. Ma)', itemA: '¬p ∨ q', itemB: '"Não corro OU canso"' },
          { criterio: 'Negação (MANÉ)', itemA: 'p ∧ ¬q', itemB: '"Corro E não canso" (Perdeu o "se")' }
        ]
      }
    ],
    jurisprudencia: [],
    flashcardTemplates: [
      {
        front: 'Qual a negação lógica da proposição "Se o candidato treinar, ele será aprovado"?',
        back: 'Regra do MANÉ (Mantém a 1ª E Nega a 2ª):\n"O candidato treina E ele NÃO é aprovado".\n\n⚠️ Atenção: A negação de uma condicional perde o "se" e ganha um "e"!',
        category: 'MNEMONICO'
      },
      {
        front: 'Como se obtém a contrapositiva equivalente de "Se beber, não dirija"?',
        back: 'Inverte tudo e nega tudo:\n"Se dirigir, não beba" (ou "Se você dirige, então não bebeu").',
        category: 'LOGICA'
      }
    ]
  }
};

export function getTheoryForTopic(topicId: string): TopicTheory | null {
  return TOPIC_THEORY_DATABASE[topicId] || null;
}
