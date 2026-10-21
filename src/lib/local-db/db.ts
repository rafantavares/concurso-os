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
  `);

  // Auto-seed if exams table is empty
  seedLocalDatabaseIfEmpty(db);

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
  const questionsData = [
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
    // Língua Portuguesa
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
    // RLM
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
    }
  ];

  const insertQ = db.prepare(`
    INSERT INTO questions (id, exam_id, subject_id, topic_id, statement, options, correct_option, explanation, difficulty, source_type, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of questionsData) {
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
  `).run('att-1', userId, 'q-const-01', 'top-1', questionsData[0].correct_option, 1, 45);

  db.prepare(`
    INSERT INTO user_attempts (id, user_id, question_id, topic_id, selected_option, is_correct, time_spent_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('att-2', userId, 'q-admin-01', 'top-3', questionsData[2].correct_option, 1, 35);

  console.log('[LocalDB] Banco de dados local inicializado com sucesso.');
}
