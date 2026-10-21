export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          hours_per_week: number | null
          available_days: string[] | null
          session_duration_preference: number | null
          routine_restrictions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          hours_per_week?: number | null
          available_days?: string[] | null
          session_duration_preference?: number | null
          routine_restrictions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          hours_per_week?: number | null
          available_days?: string[] | null
          session_duration_preference?: number | null
          routine_restrictions?: string | null
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          institution: string | null
          board: string | null
          status: string | null
          exam_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          institution?: string | null
          board?: string | null
          status?: string | null
          exam_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          institution?: string | null
          board?: string | null
          status?: string | null
          exam_date?: string | null
        }
      }
      // ... Add other types (user_exams, subjects, topics, study_sessions, user_answers) following same pattern if needed.
    }
  }
}
