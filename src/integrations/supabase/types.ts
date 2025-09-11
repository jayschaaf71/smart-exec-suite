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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
          points: number | null
          rarity: string | null
        }
        Insert: {
          category: string
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id?: string
          name: string
          points?: number | null
          rarity?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number | null
          rarity?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_guides: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_time: string | null
          id: string
          prerequisites: string[] | null
          steps: Json
          success_metrics: string[] | null
          target_roles: string[] | null
          title: string
          tool_id: string | null
          troubleshooting: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: string | null
          id?: string
          prerequisites?: string[] | null
          steps: Json
          success_metrics?: string[] | null
          target_roles?: string[] | null
          title: string
          tool_id?: string | null
          troubleshooting?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: string | null
          id?: string
          prerequisites?: string[] | null
          steps?: Json
          success_metrics?: string[] | null
          target_roles?: string[] | null
          title?: string
          tool_id?: string | null
          troubleshooting?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "implementation_guides_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          content_preview: string | null
          content_url: string | null
          created_at: string
          description: string
          duration_minutes: number
          id: string
          learning_objectives: string[] | null
          module_type: string
          order_in_path: number
          path_id: string | null
          prerequisites: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_preview?: string | null
          content_url?: string | null
          created_at?: string
          description: string
          duration_minutes: number
          id?: string
          learning_objectives?: string[] | null
          module_type: string
          order_in_path: number
          path_id?: string | null
          prerequisites?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_preview?: string | null
          content_url?: string | null
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          learning_objectives?: string[] | null
          module_type?: string
          order_in_path?: number
          path_id?: string | null
          prerequisites?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string
          estimated_duration_hours: number
          id: string
          learning_objectives: string[] | null
          path_order: number | null
          prerequisites: string[] | null
          status: string | null
          target_role: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level: string
          estimated_duration_hours: number
          id?: string
          learning_objectives?: string[] | null
          path_order?: number | null
          prerequisites?: string[] | null
          status?: string | null
          target_role: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string
          estimated_duration_hours?: number
          id?: string
          learning_objectives?: string[] | null
          path_order?: number | null
          prerequisites?: string[] | null
          status?: string | null
          target_role?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          level_number: number
          points_required: number
          rewards: Json | null
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level_number: number
          points_required: number
          rewards?: Json | null
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level_number?: number
          points_required?: number
          rewards?: Json | null
          title?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          notification_types: Json | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_experience: string | null
          avatar_url: string | null
          company_size: string | null
          created_at: string
          display_name: string | null
          goals: string[] | null
          id: string
          implementation_timeline: string | null
          industry: string | null
          primary_focus_areas: string[] | null
          role: string | null
          time_availability: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_experience?: string | null
          avatar_url?: string | null
          company_size?: string | null
          created_at?: string
          display_name?: string | null
          goals?: string[] | null
          id?: string
          implementation_timeline?: string | null
          industry?: string | null
          primary_focus_areas?: string[] | null
          role?: string | null
          time_availability?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_experience?: string | null
          avatar_url?: string | null
          company_size?: string | null
          created_at?: string
          display_name?: string | null
          goals?: string[] | null
          id?: string
          implementation_timeline?: string | null
          industry?: string | null
          primary_focus_areas?: string[] | null
          role?: string | null
          time_availability?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_effectiveness_metrics: {
        Row: {
          calculated_at: string
          created_at: string
          id: string
          metric_type: string
          metric_value: number
          sample_size: number
          time_period: string
          tool_id: string | null
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          id?: string
          metric_type: string
          metric_value: number
          sample_size?: number
          time_period: string
          tool_id?: string | null
        }
        Update: {
          calculated_at?: string
          created_at?: string
          id?: string
          metric_type?: string
          metric_value?: number
          sample_size?: number
          time_period?: string
          tool_id?: string | null
        }
        Relationships: []
      }
      tool_recommendations: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          recommendation_score: number
          status: string | null
          tool_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          recommendation_score: number
          status?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          recommendation_score?: number
          status?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_recommendations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category_id: string | null
          cons: string[] | null
          created_at: string
          description: string
          expert_rating: number | null
          features: string[] | null
          id: string
          implementation_guide: string | null
          integrations: string[] | null
          logo_url: string | null
          name: string
          popularity_score: number | null
          pricing_amount: number | null
          pricing_model: string | null
          pros: string[] | null
          setup_difficulty: string | null
          status: string | null
          target_company_sizes: string[] | null
          target_industries: string[] | null
          target_roles: string[] | null
          time_to_value: string | null
          updated_at: string
          user_rating: number | null
          video_tutorial_url: string | null
          website_url: string | null
        }
        Insert: {
          category_id?: string | null
          cons?: string[] | null
          created_at?: string
          description: string
          expert_rating?: number | null
          features?: string[] | null
          id?: string
          implementation_guide?: string | null
          integrations?: string[] | null
          logo_url?: string | null
          name: string
          popularity_score?: number | null
          pricing_amount?: number | null
          pricing_model?: string | null
          pros?: string[] | null
          setup_difficulty?: string | null
          status?: string | null
          target_company_sizes?: string[] | null
          target_industries?: string[] | null
          target_roles?: string[] | null
          time_to_value?: string | null
          updated_at?: string
          user_rating?: number | null
          video_tutorial_url?: string | null
          website_url?: string | null
        }
        Update: {
          category_id?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string
          expert_rating?: number | null
          features?: string[] | null
          id?: string
          implementation_guide?: string | null
          integrations?: string[] | null
          logo_url?: string | null
          name?: string
          popularity_score?: number | null
          pricing_amount?: number | null
          pricing_model?: string | null
          pros?: string[] | null
          setup_difficulty?: string | null
          status?: string | null
          target_company_sizes?: string[] | null
          target_industries?: string[] | null
          target_roles?: string[] | null
          time_to_value?: string | null
          updated_at?: string
          user_rating?: number | null
          video_tutorial_url?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string
          id: string
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_analytics_summary: {
        Row: {
          avg_session_duration_minutes: number
          created_at: string
          engagement_score: number
          id: string
          last_calculated_at: string
          most_active_day_of_week: number | null
          most_active_hour_of_day: number | null
          preferred_tool_categories: string[] | null
          total_page_views: number
          total_sessions: number
          total_tool_interactions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_session_duration_minutes?: number
          created_at?: string
          engagement_score?: number
          id?: string
          last_calculated_at?: string
          most_active_day_of_week?: number | null
          most_active_hour_of_day?: number | null
          preferred_tool_categories?: string[] | null
          total_page_views?: number
          total_sessions?: number
          total_tool_interactions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_session_duration_minutes?: number
          created_at?: string
          engagement_score?: number
          id?: string
          last_calculated_at?: string
          most_active_day_of_week?: number | null
          most_active_hour_of_day?: number | null
          preferred_tool_categories?: string[] | null
          total_page_views?: number
          total_sessions?: number
          total_tool_interactions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_insights: {
        Row: {
          confidence_score: number
          created_at: string
          expires_at: string | null
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_implementation_progress: {
        Row: {
          completed_at: string | null
          completed_steps: number[] | null
          created_at: string
          current_step: number | null
          guide_id: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_implementation_progress_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "implementation_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          bookmarked: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_accessed: string | null
          module_id: string | null
          notes: string | null
          path_id: string | null
          score: number | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          notes?: string | null
          path_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          notes?: string | null
          path_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          achievements_earned: number | null
          created_at: string
          guides_completed: number | null
          id: string
          last_activity_date: string | null
          level_title: string | null
          modules_completed: number | null
          streak_days: number | null
          tools_implemented: number | null
          total_points: number | null
          total_time_invested_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_earned?: number | null
          created_at?: string
          guides_completed?: number | null
          id?: string
          last_activity_date?: string | null
          level_title?: string | null
          modules_completed?: number | null
          streak_days?: number | null
          tools_implemented?: number | null
          total_points?: number | null
          total_time_invested_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_earned?: number | null
          created_at?: string
          guides_completed?: number | null
          id?: string
          last_activity_date?: string | null
          level_title?: string | null
          modules_completed?: number | null
          streak_days?: number | null
          tools_implemented?: number | null
          total_points?: number | null
          total_time_invested_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tool_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          notes: string | null
          tool_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          notes?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          notes?: string | null
          tool_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tool_interactions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_recommendation_score: {
        Args: { p_score_change: number; p_tool_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
