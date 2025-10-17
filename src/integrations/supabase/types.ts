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
      assessment_data_sources: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_json: Json
          data_type: string
          farmer_id: string | null
          id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_json: Json
          data_type: string
          farmer_id?: string | null
          id?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_json?: Json
          data_type?: string
          farmer_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_data_sources_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          average_order_size: number | null
          buyer_type: string
          company_name: string
          created_at: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          max_distance_km: number | null
          min_quality_score: number | null
          preferred_certifications: string[] | null
          preferred_crops: string[] | null
          preferred_delivery_method: string | null
          purchase_frequency: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_order_size?: number | null
          buyer_type: string
          company_name: string
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_distance_km?: number | null
          min_quality_score?: number | null
          preferred_certifications?: string[] | null
          preferred_crops?: string[] | null
          preferred_delivery_method?: string | null
          purchase_frequency?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_order_size?: number | null
          buyer_type?: string
          company_name?: string
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          max_distance_km?: number | null
          min_quality_score?: number | null
          preferred_certifications?: string[] | null
          preferred_crops?: string[] | null
          preferred_delivery_method?: string | null
          purchase_frequency?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crop_alerts: {
        Row: {
          action_required: string | null
          alert_type: string
          created_at: string | null
          crop_id: string | null
          farmer_id: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          severity: string
          title: string
        }
        Insert: {
          action_required?: string | null
          alert_type: string
          created_at?: string | null
          crop_id?: string | null
          farmer_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          severity: string
          title: string
        }
        Update: {
          action_required?: string | null
          alert_type?: string
          created_at?: string | null
          crop_id?: string | null
          farmer_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_alerts_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_alerts_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          crop_id: string | null
          forecast_date: string
          forecast_type: string
          id: string
          predicted_value: Json
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          crop_id?: string | null
          forecast_date: string
          forecast_type: string
          id?: string
          predicted_value: Json
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          crop_id?: string | null
          forecast_date?: string
          forecast_type?: string
          id?: string
          predicted_value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "crop_forecasts_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_health_analysis: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          crop_id: string | null
          disease_detected: boolean | null
          disease_severity: string | null
          disease_type: string | null
          growth_stage: string | null
          health_score: number | null
          id: string
          image_id: string | null
          nutrient_deficiency: string[] | null
          pest_detected: boolean | null
          pest_severity: string | null
          pest_type: string | null
          recommendations: string[] | null
          vegetation_index: number | null
          water_stress_level: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          crop_id?: string | null
          disease_detected?: boolean | null
          disease_severity?: string | null
          disease_type?: string | null
          growth_stage?: string | null
          health_score?: number | null
          id?: string
          image_id?: string | null
          nutrient_deficiency?: string[] | null
          pest_detected?: boolean | null
          pest_severity?: string | null
          pest_type?: string | null
          recommendations?: string[] | null
          vegetation_index?: number | null
          water_stress_level?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          crop_id?: string | null
          disease_detected?: boolean | null
          disease_severity?: string | null
          disease_type?: string | null
          growth_stage?: string | null
          health_score?: number | null
          id?: string
          image_id?: string | null
          nutrient_deficiency?: string[] | null
          pest_detected?: boolean | null
          pest_severity?: string | null
          pest_type?: string | null
          recommendations?: string[] | null
          vegetation_index?: number | null
          water_stress_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_health_analysis_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_health_analysis_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "crop_images"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_images: {
        Row: {
          analysis_status: string | null
          captured_at: string | null
          created_at: string | null
          crop_id: string | null
          farmer_id: string | null
          id: string
          image_type: string
          image_url: string
        }
        Insert: {
          analysis_status?: string | null
          captured_at?: string | null
          created_at?: string | null
          crop_id?: string | null
          farmer_id?: string | null
          id?: string
          image_type: string
          image_url: string
        }
        Update: {
          analysis_status?: string | null
          captured_at?: string | null
          created_at?: string | null
          crop_id?: string | null
          farmer_id?: string | null
          id?: string
          image_type?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_images_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_images_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string | null
          crop_name: string
          crop_type: string
          expected_harvest_date: string | null
          farmer_id: string | null
          id: string
          land_area_acres: number | null
          planting_date: string
          predicted_harvest_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          crop_type: string
          expected_harvest_date?: string | null
          farmer_id?: string | null
          id?: string
          land_area_acres?: number | null
          planting_date: string
          predicted_harvest_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          crop_type?: string
          expected_harvest_date?: string | null
          farmer_id?: string | null
          id?: string
          land_area_acres?: number | null
          planting_date?: string
          predicted_harvest_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_buyer_matches: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          crop_id: string | null
          delivery_date: string | null
          distance_km: number | null
          farmer_id: string | null
          id: string
          match_reasons: Json | null
          match_score: number
          potential_revenue: number | null
          recommended_price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          crop_id?: string | null
          delivery_date?: string | null
          distance_km?: number | null
          farmer_id?: string | null
          id?: string
          match_reasons?: Json | null
          match_score: number
          potential_revenue?: number | null
          recommended_price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          crop_id?: string | null
          delivery_date?: string | null
          distance_km?: number | null
          farmer_id?: string | null
          id?: string
          match_reasons?: Json | null
          match_score?: number
          potential_revenue?: number | null
          recommended_price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_buyer_matches_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_buyer_matches_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_buyer_matches_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          community_network_size: number | null
          created_at: string | null
          farm_location: string | null
          farm_size_acres: number | null
          full_name: string
          id: string
          phone_number: string | null
          primary_crops: string[] | null
          updated_at: string | null
          user_id: string | null
          years_farming: number | null
        }
        Insert: {
          community_network_size?: number | null
          created_at?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          full_name: string
          id?: string
          phone_number?: string | null
          primary_crops?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_farming?: number | null
        }
        Update: {
          community_network_size?: number | null
          created_at?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          full_name?: string
          id?: string
          phone_number?: string | null
          primary_crops?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_farming?: number | null
        }
        Relationships: []
      }
      farmer_trust_scores: {
        Row: {
          ai_analysis: string | null
          confidence_percentage: number | null
          created_at: string | null
          farmer_id: string | null
          id: string
          loan_recommendation: string | null
          overall_score: number
          risk_level: string | null
          satellite_score: number | null
          social_score: number | null
          soil_score: number | null
          transaction_score: number | null
          weather_score: number | null
          yield_prediction_score: number | null
        }
        Insert: {
          ai_analysis?: string | null
          confidence_percentage?: number | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          loan_recommendation?: string | null
          overall_score: number
          risk_level?: string | null
          satellite_score?: number | null
          social_score?: number | null
          soil_score?: number | null
          transaction_score?: number | null
          weather_score?: number | null
          yield_prediction_score?: number | null
        }
        Update: {
          ai_analysis?: string | null
          confidence_percentage?: number | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          loan_recommendation?: string | null
          overall_score?: number
          risk_level?: string | null
          satellite_score?: number | null
          social_score?: number | null
          soil_score?: number | null
          transaction_score?: number | null
          weather_score?: number | null
          yield_prediction_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_trust_scores_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          ai_recommendation: string | null
          created_at: string | null
          farmer_id: string | null
          id: string
          loan_amount: number
          purpose: string
          status: string | null
          trust_score_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_recommendation?: string | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          loan_amount: number
          purpose: string
          status?: string | null
          trust_score_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_recommendation?: string | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          loan_amount?: number
          purpose?: string
          status?: string | null
          trust_score_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_trust_score_id_fkey"
            columns: ["trust_score_id"]
            isOneToOne: false
            referencedRelation: "farmer_trust_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      market_demand_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          crop_type: string
          demand_trend: string | null
          forecast_date: string
          id: string
          market_conditions: Json | null
          predicted_demand_kg: number
          predicted_price_per_kg: number
          price_trend: string | null
          seasonal_factor: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          crop_type: string
          demand_trend?: string | null
          forecast_date: string
          id?: string
          market_conditions?: Json | null
          predicted_demand_kg: number
          predicted_price_per_kg: number
          price_trend?: string | null
          seasonal_factor?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          crop_type?: string
          demand_trend?: string | null
          forecast_date?: string
          id?: string
          market_conditions?: Json | null
          predicted_demand_kg?: number
          predicted_price_per_kg?: number
          price_trend?: string | null
          seasonal_factor?: number | null
        }
        Relationships: []
      }
      planting_recommendations: {
        Row: {
          competition_level: string | null
          confidence_score: number | null
          created_at: string | null
          crop_type: string
          expected_harvest_date: string
          expected_profit_per_acre: number | null
          farmer_id: string | null
          id: string
          market_forecast: Json | null
          predicted_demand_level: string | null
          predicted_market_price: number | null
          reasoning: Json | null
          recommended_planting_date: string
          status: string | null
          weather_factors: Json | null
        }
        Insert: {
          competition_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_type: string
          expected_harvest_date: string
          expected_profit_per_acre?: number | null
          farmer_id?: string | null
          id?: string
          market_forecast?: Json | null
          predicted_demand_level?: string | null
          predicted_market_price?: number | null
          reasoning?: Json | null
          recommended_planting_date: string
          status?: string | null
          weather_factors?: Json | null
        }
        Update: {
          competition_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_type?: string
          expected_harvest_date?: string
          expected_profit_per_acre?: number | null
          farmer_id?: string | null
          id?: string
          market_forecast?: Json | null
          predicted_demand_level?: string | null
          predicted_market_price?: number | null
          reasoning?: Json | null
          recommended_planting_date?: string
          status?: string | null
          weather_factors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "planting_recommendations_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_history: {
        Row: {
          buyer_id: string | null
          certifications: string[] | null
          created_at: string | null
          crop_type: string
          delivery_rating: number | null
          farmer_id: string | null
          id: string
          price_per_kg: number
          purchase_date: string
          quality_rating: number | null
          quantity_kg: number
          season: string | null
          total_amount: number
        }
        Insert: {
          buyer_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          crop_type: string
          delivery_rating?: number | null
          farmer_id?: string | null
          id?: string
          price_per_kg: number
          purchase_date: string
          quality_rating?: number | null
          quantity_kg: number
          season?: string | null
          total_amount: number
        }
        Update: {
          buyer_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          crop_type?: string
          delivery_rating?: number | null
          farmer_id?: string | null
          id?: string
          price_per_kg?: number
          purchase_date?: string
          quality_rating?: number | null
          quantity_kg?: number
          season?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_history_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
