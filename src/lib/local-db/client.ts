import { getLocalDatabase } from './db';

interface QueryFilter {
  column: string;
  op: '=' | '!=' | 'IN' | '>=' | '<=' | 'LIKE';
  value: any;
}

interface QueryOrder {
  column: string;
  ascending: boolean;
}

export class LocalQueryBuilder {
  private table: string;
  private selectCols: string = '*';
  private filters: QueryFilter[] = [];
  private orderList: QueryOrder[] = [];
  private limitCount: number | null = null;
  private isSingleResult: boolean = false;
  private isInsertOp: boolean = false;
  private isUpdateOp: boolean = false;
  private isUpsertOp: boolean = false;
  private mutationPayload: any = null;

  private offsetCount: number | null = null;
  private countMode: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: any) {
    this.selectCols = columns;
    if (options?.count) {
      this.countMode = options.count;
    }
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = Math.max(1, to - from + 1);
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, op: '=', value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, op: '!=', value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ column, op: '>=', value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ column, op: '<=', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, op: 'IN', value: values });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ column, op: 'LIKE', value: pattern.replace(/%/g, '%') });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = { ascending: true }) {
    this.orderList.push({ column, ascending: options.ascending ?? true });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingleResult = true;
    this.limitCount = 1;
    return this;
  }

  insert(data: any) {
    this.isInsertOp = true;
    this.mutationPayload = data;
    return this;
  }

  update(data: any) {
    this.isUpdateOp = true;
    this.mutationPayload = data;
    return this;
  }

  upsert(data: any) {
    this.isUpsertOp = true;
    this.mutationPayload = data;
    return this;
  }

  // Promise-like then for async/await execution
  then(onfulfilled?: (value: { data: any; error: any; count?: number }) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const db = getLocalDatabase();

      // Handle Insert
      if (this.isInsertOp || this.isUpsertOp) {
        const records = Array.isArray(this.mutationPayload) ? this.mutationPayload : [this.mutationPayload];
        const insertedRows: any[] = [];

        for (const item of records) {
          const rowData = { ...item };
          if (!rowData.id) {
            rowData.id = `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          }

          // Serialize JSON fields
          if (rowData.options && typeof rowData.options !== 'string') {
            rowData.options = JSON.stringify(rowData.options);
          }
          if (rowData.available_days && typeof rowData.available_days !== 'string') {
            rowData.available_days = JSON.stringify(rowData.available_days);
          }
          if (rowData.question_ids && typeof rowData.question_ids !== 'string') {
            rowData.question_ids = JSON.stringify(rowData.question_ids);
          }
          if (rowData.answers_payload && typeof rowData.answers_payload !== 'string') {
            rowData.answers_payload = JSON.stringify(rowData.answers_payload);
          }
          if (typeof rowData.is_correct === 'boolean') {
            rowData.is_correct = rowData.is_correct ? 1 : 0;
          }

          const cols = Object.keys(rowData);
          const placeholders = cols.map(() => '?').join(', ');
          const values = Object.values(rowData);

          const sql = this.isUpsertOp
            ? `INSERT OR REPLACE INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders})`
            : `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders})`;

          db.prepare(sql).run(...values);

          // Deserialize back
          const inserted = { ...rowData };
          if (inserted.options && typeof inserted.options === 'string') {
            try { inserted.options = JSON.parse(inserted.options); } catch {}
          }
          if (inserted.available_days && typeof inserted.available_days === 'string') {
            try { inserted.available_days = JSON.parse(inserted.available_days); } catch {}
          }
          if (inserted.question_ids && typeof inserted.question_ids === 'string') {
            try { inserted.question_ids = JSON.parse(inserted.question_ids); } catch {}
          }
          if (inserted.answers_payload && typeof inserted.answers_payload === 'string') {
            try { inserted.answers_payload = JSON.parse(inserted.answers_payload); } catch {}
          }
          if (inserted.is_correct !== undefined) {
            inserted.is_correct = Boolean(inserted.is_correct);
          }
          insertedRows.push(inserted);
        }

        const resData = Array.isArray(this.mutationPayload) 
          ? insertedRows 
          : (this.isSingleResult ? (insertedRows[0] || null) : (insertedRows[0] || null));
        return { data: resData, error: null };
      }

      // Handle Update
      if (this.isUpdateOp) {
        const payload = { ...this.mutationPayload };
        if (payload.options && typeof payload.options !== 'string') {
          payload.options = JSON.stringify(payload.options);
        }
        if (payload.available_days && typeof payload.available_days !== 'string') {
          payload.available_days = JSON.stringify(payload.available_days);
        }
        if (payload.question_ids && typeof payload.question_ids !== 'string') {
          payload.question_ids = JSON.stringify(payload.question_ids);
        }
        if (payload.answers_payload && typeof payload.answers_payload !== 'string') {
          payload.answers_payload = JSON.stringify(payload.answers_payload);
        }
        if (typeof payload.is_correct === 'boolean') {
          payload.is_correct = payload.is_correct ? 1 : 0;
        }

        const updateCols = Object.keys(payload);
        const setClauses = updateCols.map(c => `${c} = ?`).join(', ');
        const updateValues = Object.values(payload);

        const whereParts: string[] = [];
        const whereValues: any[] = [];

        for (const f of this.filters) {
          whereParts.push(`${f.column} ${f.op} ?`);
          whereValues.push(f.value);
        }

        const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
        const sql = `UPDATE ${this.table} SET ${setClauses} ${whereSql}`;

        db.prepare(sql).run(...updateValues, ...whereValues);
        return { data: this.mutationPayload, error: null };
      }

      // Handle Select
      return this.executeSelect(db);
    } catch (err: any) {
      console.error(`[LocalDB Error] query on ${this.table}:`, err);
      return { data: null, error: { message: err?.message || 'Database error' } };
    }
  }

  private executeSelect(db: any): { data: any; error: any; count?: number } {
    let sql = `SELECT * FROM ${this.table}`;
    const params: any[] = [];

    // Check for joins based on table & selectCols
    const isTopicSubjectsJoin = this.table === 'topics' && (this.selectCols.includes('subjects') || this.selectCols.includes('subjects!inner'));
    const isUserExamsJoin = this.table === 'user_exams' && this.selectCols.includes('exams');
    const isPlanItemsTopicsJoin = this.table === 'study_plan_items' && this.selectCols.includes('topics');
    const isAttemptsQuestionsJoin = this.table === 'user_attempts' && this.selectCols.includes('questions');
    const isQuestionsTopicsJoin = this.table === 'questions' && this.selectCols.includes('topics');

    if (isTopicSubjectsJoin) {
      sql = `
        SELECT 
          topics.id as id,
          topics.name as name,
          topics.subject_id as subject_id,
          subjects.id as subj_id,
          subjects.name as subj_name,
          subjects.weight as subj_weight,
          subjects.exam_id as subj_exam_id
        FROM topics
        INNER JOIN subjects ON subjects.id = topics.subject_id
      `;
    } else if (isUserExamsJoin) {
      sql = `
        SELECT 
          user_exams.*,
          exams.title as exam_title,
          exams.institution as exam_institution,
          exams.board as exam_board
        FROM user_exams
        LEFT JOIN exams ON exams.id = user_exams.exam_id
      `;
    } else if (isPlanItemsTopicsJoin) {
      sql = `
        SELECT 
          study_plan_items.*,
          topics.name as topic_name
        FROM study_plan_items
        LEFT JOIN topics ON topics.id = study_plan_items.topic_id
      `;
    } else if (isAttemptsQuestionsJoin) {
      sql = `
        SELECT 
          user_attempts.*,
          questions.source_type as q_source_type
        FROM user_attempts
        LEFT JOIN questions ON questions.id = user_attempts.question_id
      `;
    } else if (isQuestionsTopicsJoin) {
      sql = `
        SELECT 
          questions.*,
          topics.name as topic_name
        FROM questions
        LEFT JOIN topics ON topics.id = questions.topic_id
      `;
    }

    // Build WHERE clauses
    const whereClauses: string[] = [];

    for (const f of this.filters) {
      let colName = f.column;
      if (isTopicSubjectsJoin && colName === 'subjects.exam_id') {
        colName = 'subjects.exam_id';
      } else if (!colName.includes('.')) {
        colName = `${this.table}.${colName}`;
      }

      if (f.op === 'IN') {
        const list = Array.isArray(f.value) ? f.value : [f.value];
        if (list.length === 0) {
          whereClauses.push('1 = 0'); // empty IN matches nothing
        } else {
          const inPlaceholders = list.map(() => '?').join(', ');
          whereClauses.push(`${colName} IN (${inPlaceholders})`);
          params.push(...list);
        }
      } else {
        whereClauses.push(`${colName} ${f.op} ?`);
        params.push(f.value);
      }
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // ORDER BY
    if (this.orderList.length > 0) {
      const orderSql = this.orderList.map(o => {
        const col = o.column.includes('.') ? o.column : `${this.table}.${o.column}`;
        return `${col} ${o.ascending ? 'ASC' : 'DESC'}`;
      }).join(', ');
      sql += ` ORDER BY ${orderSql}`;
    }

    // LIMIT & OFFSET
    if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
      if (this.offsetCount !== null) {
        sql += ` OFFSET ${this.offsetCount}`;
      }
    }

    const rows = db.prepare(sql).all(...params) as any[];

    // Transform and map rows
    const mapped = rows.map(r => {
      const item: any = { ...r };

      // Parse JSON fields
      if (item.options && typeof item.options === 'string') {
        try { item.options = JSON.parse(item.options); } catch {}
      }
      if (item.available_days && typeof item.available_days === 'string') {
        try { item.available_days = JSON.parse(item.available_days); } catch {}
      }
      if (item.question_ids && typeof item.question_ids === 'string') {
        try { item.question_ids = JSON.parse(item.question_ids); } catch {}
      }
      if (item.answers_payload && typeof item.answers_payload === 'string') {
        try { item.answers_payload = JSON.parse(item.answers_payload); } catch {}
      }
      if (item.is_correct !== undefined) {
        item.is_correct = Boolean(item.is_correct);
      }

      // Restructure Joins
      if (isTopicSubjectsJoin) {
        return {
          id: item.id,
          name: item.name,
          subject_id: item.subject_id,
          subjects: {
            id: item.subj_id,
            name: item.subj_name,
            weight: item.subj_weight,
            exam_id: item.subj_exam_id
          }
        };
      }

      if (isUserExamsJoin) {
        item.exams = {
          title: item.exam_title,
          institution: item.exam_institution,
          board: item.exam_board
        };
        delete item.exam_title;
        delete item.exam_institution;
        delete item.exam_board;
        return item;
      }

      if (isPlanItemsTopicsJoin) {
        item.topics = {
          name: item.topic_name
        };
        delete item.topic_name;
        return item;
      }

      if (isAttemptsQuestionsJoin) {
        item.questions = {
          source_type: item.q_source_type
        };
        delete item.q_source_type;
        return item;
      }

      if (isQuestionsTopicsJoin) {
        item.topics = {
          name: item.topic_name
        };
        delete item.topic_name;
        return item;
      }

      return item;
    });

    const countVal = mapped.length;

    if (this.isSingleResult) {
      return { data: mapped[0] || null, error: null, count: countVal };
    }

    return { data: mapped, error: null, count: countVal };
  }
}

export function createLocalClient(cookieStore?: any) {
  // Pre-initialize DB and seeds
  getLocalDatabase();

  const localUserId = 'local-user-id';

  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: localUserId,
              email: 'aluno@concurso.local',
              user_metadata: { name: 'Estudante Concurseiro' }
            }
          },
          error: null
        };
      },
      async signInWithPassword({ email }: { email: string }) {
        if (cookieStore) {
          cookieStore.set('concurso_local_session', 'active', { path: '/' });
        }
        return {
          data: {
            user: { id: localUserId, email }
          },
          error: null
        };
      },
      async signUp({ email }: { email: string }) {
        if (cookieStore) {
          cookieStore.set('concurso_local_session', 'active', { path: '/' });
        }
        return {
          data: {
            user: { id: localUserId, email }
          },
          error: null
        };
      },
      async signOut() {
        if (cookieStore) {
          try {
            cookieStore.delete('concurso_local_session');
          } catch {}
        }
        return { error: null };
      }
    },
    from(tableName: string) {
      return new LocalQueryBuilder(tableName);
    }
  };
}
