export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          exam_preference: Database["public"]["Enums"]["exam_type"] | null
          id: string
          language_preference:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name: string
          exam_preference?: Database["public"]["Enums"]["exam_type"] | null
          id?: string
          language_preference?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string
          exam_preference?: Database["public"]["Enums"]["exam_type"] | null
          id?: string
          language_preference?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempt_status: Database["public"]["Enums"]["attempt_status"] | null
          id: string
          is_correct: boolean | null
          marks_awarded: number | null
          question_id: string
          selected_answer: string | null
          test_attempt_id: string
          time_spent: number | null
        }
        Insert: {
          attempt_status?: Database["public"]["Enums"]["attempt_status"] | null
          id?: string
          is_correct?: boolean | null
          marks_awarded?: number | null
          question_id: string
          selected_answer?: string | null
          test_attempt_id: string
          time_spent?: number | null
        }
        Update: {
          attempt_status?: Database["public"]["Enums"]["attempt_status"] | null
          id?: string
          is_correct?: boolean | null
          marks_awarded?: number | null
          question_id?: string
          selected_answer?: string | null
          test_attempt_id?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_test_attempt_id_fkey"
            columns: ["test_attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          explanation_english: string | null
          explanation_hindi: string | null
          id: string
          image_url: string | null
          marks: number | null
          negative_marks: number | null
          option_a_english: string | null
          option_a_hindi: string | null
          option_b_english: string | null
          option_b_hindi: string | null
          option_c_english: string | null
          option_c_hindi: string | null
          option_d_english: string | null
          option_d_hindi: string | null
          question_text_english: string
          question_text_hindi: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          section: Database["public"]["Enums"]["section_type"]
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation_english?: string | null
          explanation_hindi?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          negative_marks?: number | null
          option_a_english?: string | null
          option_a_hindi?: string | null
          option_b_english?: string | null
          option_b_hindi?: string | null
          option_c_english?: string | null
          option_c_hindi?: string | null
          option_d_english?: string | null
          option_d_hindi?: string | null
          question_text_english: string
          question_text_hindi?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          section: Database["public"]["Enums"]["section_type"]
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation_english?: string | null
          explanation_hindi?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          negative_marks?: number | null
          option_a_english?: string | null
          option_a_hindi?: string | null
          option_b_english?: string | null
          option_b_hindi?: string | null
          option_c_english?: string | null
          option_c_hindi?: string | null
          option_d_english?: string | null
          option_d_hindi?: string | null
          question_text_english?: string
          question_text_hindi?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          section?: Database["public"]["Enums"]["section_type"]
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          duration_taken: number | null
          id: string
          is_completed: boolean | null
          language_used:
            | Database["public"]["Enums"]["language_preference"]
            | null
          percentage: number | null
          percentile: number | null
          started_at: string | null
          submitted_at: string | null
          test_id: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          duration_taken?: number | null
          id?: string
          is_completed?: boolean | null
          language_used?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          percentage?: number | null
          percentile?: number | null
          started_at?: string | null
          submitted_at?: string | null
          test_id: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          duration_taken?: number | null
          id?: string
          is_completed?: boolean | null
          language_used?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          percentage?: number | null
          percentile?: number | null
          started_at?: string | null
          submitted_at?: string | null
          test_id?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          id: string
          question_id: string
          question_order: number
          test_id: string
        }
        Insert: {
          id?: string
          question_id: string
          question_order: number
          test_id: string
        }
        Update: {
          id?: string
          question_id?: string
          question_order?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_active: boolean | null
          section: Database["public"]["Enums"]["section_type"] | null
          test_type: Database["public"]["Enums"]["test_type"]
          title: string
          topic_id: string | null
          total_marks: number
          total_questions: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_active?: boolean | null
          section?: Database["public"]["Enums"]["section_type"] | null
          test_type: Database["public"]["Enums"]["test_type"]
          title: string
          topic_id?: string | null
          total_marks: number
          total_questions: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_active?: boolean | null
          section?: Database["public"]["Enums"]["section_type"] | null
          test_type?: Database["public"]["Enums"]["test_type"]
          title?: string
          topic_id?: string | null
          total_marks?: number
          total_questions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string | null
          id: string
          name: string
          section: Database["public"]["Enums"]["section_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          section: Database["public"]["Enums"]["section_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          section?: Database["public"]["Enums"]["section_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attempt_status:
        | "NOT_ATTEMPTED"
        | "ANSWERED"
        | "MARKED_FOR_REVIEW"
        | "ANSWERED_AND_MARKED"
      difficulty_level: "EASY" | "MEDIUM" | "HARD"
      exam_type: "SSC_CGL" | "SSC_CHSL" | "SSC_MTS"
      language_preference: "ENGLISH" | "HINDI"
      question_type: "MCQ_SINGLE" | "MCQ_MULTI" | "NUMERICAL"
      section_type:
        | "QUANTITATIVE_APTITUDE"
        | "REASONING"
        | "GENERAL_AWARENESS"
        | "ENGLISH"
      test_type:
        | "FULL_LENGTH"
        | "SECTIONAL"
        | "CHAPTER_WISE"
        | "PREVIOUS_YEAR"
        | "MINI_QUIZ"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attempt_status: [
        "NOT_ATTEMPTED",
        "ANSWERED",
        "MARKED_FOR_REVIEW",
        "ANSWERED_AND_MARKED",
      ],
      difficulty_level: ["EASY", "MEDIUM", "HARD"],
      exam_type: ["SSC_CGL", "SSC_CHSL", "SSC_MTS"],
      language_preference: ["ENGLISH", "HINDI"],
      question_type: ["MCQ_SINGLE", "MCQ_MULTI", "NUMERICAL"],
      section_type: [
        "QUANTITATIVE_APTITUDE",
        "REASONING",
        "GENERAL_AWARENESS",
        "ENGLISH",
      ],
      test_type: [
        "FULL_LENGTH",
        "SECTIONAL",
        "CHAPTER_WISE",
        "PREVIOUS_YEAR",
        "MINI_QUIZ",
      ],
    },
  },
} as const
