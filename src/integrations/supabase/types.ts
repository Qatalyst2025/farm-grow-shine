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
      alert_subscriptions: {
        Row: {
          alert_type: string
          created_at: string
          delivery_method: string
          farmer_id: string | null
          id: string
          is_active: boolean | null
          preferences: Json | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          delivery_method: string
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          delivery_method?: string
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_subscriptions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      behavioral_biometrics: {
        Row: {
          anomaly_details: Json | null
          anomaly_detected: boolean | null
          biometric_data: Json
          biometric_type: string
          created_at: string | null
          device_fingerprint: Json | null
          id: string
          location_data: Json | null
          risk_score: number | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          anomaly_details?: Json | null
          anomaly_detected?: boolean | null
          biometric_data: Json
          biometric_type: string
          created_at?: string | null
          device_fingerprint?: Json | null
          id?: string
          location_data?: Json | null
          risk_score?: number | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          anomaly_details?: Json | null
          anomaly_detected?: boolean | null
          biometric_data?: Json
          biometric_type?: string
          created_at?: string | null
          device_fingerprint?: Json | null
          id?: string
          location_data?: Json | null
          risk_score?: number | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      buyer_profiles: {
        Row: {
          average_order_size: number | null
          average_response_time: number | null
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
          successful_deals: number | null
          total_deals: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          verified: boolean | null
        }
        Insert: {
          average_order_size?: number | null
          average_response_time?: number | null
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
          successful_deals?: number | null
          total_deals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
        }
        Update: {
          average_order_size?: number | null
          average_response_time?: number | null
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
          successful_deals?: number | null
          total_deals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      buyer_ratings: {
        Row: {
          buyer_id: string
          communication_rating: number | null
          created_at: string
          farmer_id: string
          id: string
          match_id: string | null
          payment_speed_rating: number | null
          rating: number
          reliability_rating: number | null
          review_text: string | null
        }
        Insert: {
          buyer_id: string
          communication_rating?: number | null
          created_at?: string
          farmer_id: string
          id?: string
          match_id?: string | null
          payment_speed_rating?: number | null
          rating: number
          reliability_rating?: number | null
          review_text?: string | null
        }
        Update: {
          buyer_id?: string
          communication_rating?: number | null
          created_at?: string
          farmer_id?: string
          id?: string
          match_id?: string | null
          payment_speed_rating?: number | null
          rating?: number
          reliability_rating?: number | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_ratings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ratings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "farmer_buyer_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: Database["public"]["Enums"]["chat_member_role"] | null
          room_id: string
          user_id: string
          wisdom_points: number | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["chat_member_role"] | null
          room_id: string
          user_id: string
          wisdom_points?: number | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["chat_member_role"] | null
          room_id?: string
          user_id?: string
          wisdom_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          ai_analysis: Json | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_alert: boolean | null
          is_pinned: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          metadata: Json | null
          reply_to: string | null
          room_id: string
          updated_at: string | null
          user_id: string
          voice_url: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_alert?: boolean | null
          is_pinned?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          reply_to?: string | null
          room_id: string
          updated_at?: string | null
          user_id: string
          voice_url?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_alert?: boolean | null
          is_pinned?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          reply_to?: string | null
          room_id?: string
          updated_at?: string | null
          user_id?: string
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_polls: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          created_by: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          message_id: string | null
          options: Json
          poll_type: string | null
          question: string
          room_id: string
          total_votes: number | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          created_by: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          message_id?: string | null
          options: Json
          poll_type?: string | null
          question: string
          room_id: string
          total_votes?: number | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          created_by?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          message_id?: string | null
          options?: Json
          poll_type?: string | null
          question?: string
          room_id?: string
          total_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_polls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_polls_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          crop_type: string | null
          description: string | null
          id: string
          is_active: boolean | null
          language: string | null
          member_count: number | null
          metadata: Json | null
          name: string
          region: string | null
          room_type: Database["public"]["Enums"]["chat_room_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          crop_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          member_count?: number | null
          metadata?: Json | null
          name: string
          region?: string | null
          room_type: Database["public"]["Enums"]["chat_room_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          crop_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          member_count?: number | null
          metadata?: Json | null
          name?: string
          region?: string | null
          room_type?: Database["public"]["Enums"]["chat_room_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_assessment_dimensions: {
        Row: {
          assessment_date: string
          business_longevity_score: number | null
          climate_risk_score: number | null
          community_verification_score: number | null
          created_at: string
          crop_health_score: number | null
          data_completeness: number | null
          drought_exposure: number | null
          farm_area_verified: boolean | null
          farmer_id: string | null
          financial_data: Json | null
          flood_risk: number | null
          historical_yield_score: number | null
          id: string
          land_use_efficiency: number | null
          last_updated: string | null
          mobile_money_score: number | null
          network_strength: number | null
          peer_endorsements: number | null
          performance_data: Json | null
          repayment_history_score: number | null
          satellite_data: Json | null
          savings_pattern: number | null
          social_data: Json | null
          transaction_consistency: number | null
          weather_data: Json | null
        }
        Insert: {
          assessment_date?: string
          business_longevity_score?: number | null
          climate_risk_score?: number | null
          community_verification_score?: number | null
          created_at?: string
          crop_health_score?: number | null
          data_completeness?: number | null
          drought_exposure?: number | null
          farm_area_verified?: boolean | null
          farmer_id?: string | null
          financial_data?: Json | null
          flood_risk?: number | null
          historical_yield_score?: number | null
          id?: string
          land_use_efficiency?: number | null
          last_updated?: string | null
          mobile_money_score?: number | null
          network_strength?: number | null
          peer_endorsements?: number | null
          performance_data?: Json | null
          repayment_history_score?: number | null
          satellite_data?: Json | null
          savings_pattern?: number | null
          social_data?: Json | null
          transaction_consistency?: number | null
          weather_data?: Json | null
        }
        Update: {
          assessment_date?: string
          business_longevity_score?: number | null
          climate_risk_score?: number | null
          community_verification_score?: number | null
          created_at?: string
          crop_health_score?: number | null
          data_completeness?: number | null
          drought_exposure?: number | null
          farm_area_verified?: boolean | null
          farmer_id?: string | null
          financial_data?: Json | null
          flood_risk?: number | null
          historical_yield_score?: number | null
          id?: string
          land_use_efficiency?: number | null
          last_updated?: string | null
          mobile_money_score?: number | null
          network_strength?: number | null
          peer_endorsements?: number | null
          performance_data?: Json | null
          repayment_history_score?: number | null
          satellite_data?: Json | null
          savings_pattern?: number | null
          social_data?: Json | null
          transaction_consistency?: number | null
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_assessment_dimensions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_score_alerts: {
        Row: {
          action_required: string | null
          affected_dimensions: Json | null
          alert_type: string
          created_at: string
          farmer_id: string | null
          id: string
          is_read: boolean | null
          message: string
          score_id: string | null
          severity: string
          title: string
        }
        Insert: {
          action_required?: string | null
          affected_dimensions?: Json | null
          alert_type: string
          created_at?: string
          farmer_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          score_id?: string | null
          severity: string
          title: string
        }
        Update: {
          action_required?: string | null
          affected_dimensions?: Json | null
          alert_type?: string
          created_at?: string
          farmer_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          score_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_score_alerts_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_score_alerts_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "credit_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_score_history: {
        Row: {
          change_reason: string | null
          created_at: string
          farmer_id: string | null
          id: string
          overall_score: number
          risk_category: string
          score_id: string | null
          triggered_by: string | null
        }
        Insert: {
          change_reason?: string | null
          created_at?: string
          farmer_id?: string | null
          id?: string
          overall_score: number
          risk_category: string
          score_id?: string | null
          triggered_by?: string | null
        }
        Update: {
          change_reason?: string | null
          created_at?: string
          farmer_id?: string | null
          id?: string
          overall_score?: number
          risk_category?: string
          score_id?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_score_history_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_score_history_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "credit_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_scores: {
        Row: {
          assessment_id: string | null
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          confidence_score: number | null
          created_at: string
          expires_at: string | null
          farmer_id: string | null
          financial_weight: number | null
          historical_weight: number | null
          id: string
          improvement_recommendations: Json | null
          is_active: boolean | null
          loan_term_months: number | null
          max_loan_amount: number | null
          model_confidence: string | null
          model_version: string
          overall_score: number
          peer_comparison: Json | null
          previous_score: number | null
          recommended_interest_rate: number | null
          risk_category: string
          satellite_weight: number | null
          score_change: number | null
          score_factors: Json
          score_trend: string | null
          social_weight: number | null
          weather_weight: number | null
        }
        Insert: {
          assessment_id?: string | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          farmer_id?: string | null
          financial_weight?: number | null
          historical_weight?: number | null
          id?: string
          improvement_recommendations?: Json | null
          is_active?: boolean | null
          loan_term_months?: number | null
          max_loan_amount?: number | null
          model_confidence?: string | null
          model_version: string
          overall_score: number
          peer_comparison?: Json | null
          previous_score?: number | null
          recommended_interest_rate?: number | null
          risk_category: string
          satellite_weight?: number | null
          score_change?: number | null
          score_factors: Json
          score_trend?: string | null
          social_weight?: number | null
          weather_weight?: number | null
        }
        Update: {
          assessment_id?: string | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          farmer_id?: string | null
          financial_weight?: number | null
          historical_weight?: number | null
          id?: string
          improvement_recommendations?: Json | null
          is_active?: boolean | null
          loan_term_months?: number | null
          max_loan_amount?: number | null
          model_confidence?: string | null
          model_version?: string
          overall_score?: number
          peer_comparison?: Json | null
          previous_score?: number | null
          recommended_interest_rate?: number | null
          risk_category?: string
          satellite_weight?: number | null
          score_change?: number | null
          score_factors?: Json
          score_trend?: string | null
          social_weight?: number | null
          weather_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "credit_assessment_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_scores_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      crop_price_history: {
        Row: {
          created_at: string
          crop_type: string
          id: string
          price_per_kg: number
          quality_grade: string | null
          recorded_date: string
          region: string | null
          source: string
          volume_kg: number | null
        }
        Insert: {
          created_at?: string
          crop_type: string
          id?: string
          price_per_kg: number
          quality_grade?: string | null
          recorded_date?: string
          region?: string | null
          source: string
          volume_kg?: number | null
        }
        Update: {
          created_at?: string
          crop_type?: string
          id?: string
          price_per_kg?: number
          quality_grade?: string | null
          recorded_date?: string
          region?: string | null
          source?: string
          volume_kg?: number | null
        }
        Relationships: []
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
      expert_profiles: {
        Row: {
          average_rating: number | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          credentials: Json
          expertise_areas: string[]
          helpful_responses: number | null
          id: string
          total_responses: number | null
          updated_at: string | null
          user_id: string
          verification_level: string | null
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          credentials?: Json
          expertise_areas?: string[]
          helpful_responses?: number | null
          id?: string
          total_responses?: number | null
          updated_at?: string | null
          user_id: string
          verification_level?: string | null
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          credentials?: Json
          expertise_areas?: string[]
          helpful_responses?: number | null
          id?: string
          total_responses?: number | null
          updated_at?: string | null
          user_id?: string
          verification_level?: string | null
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: []
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
      farmer_knowledge_base: {
        Row: {
          contributed_at: string
          crop_type: string
          farm_conditions: Json
          farmer_id: string | null
          id: string
          outcomes: Json
          practices_used: Json
          success_score: number | null
          verification_source: string | null
          verified: boolean | null
        }
        Insert: {
          contributed_at?: string
          crop_type: string
          farm_conditions: Json
          farmer_id?: string | null
          id?: string
          outcomes: Json
          practices_used: Json
          success_score?: number | null
          verification_source?: string | null
          verified?: boolean | null
        }
        Update: {
          contributed_at?: string
          crop_type?: string
          farm_conditions?: Json
          farmer_id?: string | null
          id?: string
          outcomes?: Json
          practices_used?: Json
          success_score?: number | null
          verification_source?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_knowledge_base_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          average_response_time: number | null
          community_network_size: number | null
          created_at: string | null
          farm_location: string | null
          farm_size_acres: number | null
          full_name: string
          id: string
          phone_number: string | null
          primary_crops: string[] | null
          successful_deals: number | null
          total_deals: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          verified: boolean | null
          years_farming: number | null
        }
        Insert: {
          average_response_time?: number | null
          community_network_size?: number | null
          created_at?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          full_name: string
          id?: string
          phone_number?: string | null
          primary_crops?: string[] | null
          successful_deals?: number | null
          total_deals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
          years_farming?: number | null
        }
        Update: {
          average_response_time?: number | null
          community_network_size?: number | null
          created_at?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          full_name?: string
          id?: string
          phone_number?: string | null
          primary_crops?: string[] | null
          successful_deals?: number | null
          total_deals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
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
      farming_advice_sessions: {
        Row: {
          context_data: Json | null
          created_at: string
          ended_at: string | null
          farmer_id: string | null
          id: string
          language: string
          messages: Json
          session_type: string
          updated_at: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          ended_at?: string | null
          farmer_id?: string | null
          id?: string
          language?: string
          messages?: Json
          session_type: string
          updated_at?: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          ended_at?: string | null
          farmer_id?: string | null
          id?: string
          language?: string
          messages?: Json
          session_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farming_advice_sessions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farming_plans: {
        Row: {
          climate_data: Json | null
          created_at: string
          crop_type: string
          estimated_revenue: number | null
          estimated_yield: number | null
          farmer_id: string | null
          id: string
          learning_source: Json | null
          plan_data: Json
          recommendations: Json
          resource_assessment: Json | null
          soil_analysis: Json | null
          status: string | null
          success_probability: number | null
          updated_at: string
        }
        Insert: {
          climate_data?: Json | null
          created_at?: string
          crop_type: string
          estimated_revenue?: number | null
          estimated_yield?: number | null
          farmer_id?: string | null
          id?: string
          learning_source?: Json | null
          plan_data: Json
          recommendations: Json
          resource_assessment?: Json | null
          soil_analysis?: Json | null
          status?: string | null
          success_probability?: number | null
          updated_at?: string
        }
        Update: {
          climate_data?: Json | null
          created_at?: string
          crop_type?: string
          estimated_revenue?: number | null
          estimated_yield?: number | null
          farmer_id?: string | null
          id?: string
          learning_source?: Json | null
          plan_data?: Json
          recommendations?: Json
          resource_assessment?: Json | null
          soil_analysis?: Json | null
          status?: string | null
          success_probability?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farming_plans_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_logs: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          detection_method: string
          entity_id: string
          entity_type: string
          fraud_indicators: Json
          fraud_score: number
          id: string
          investigated_by: string | null
          investigation_notes: string | null
          resolved_at: string | null
          risk_level: string
          status: string | null
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          detection_method: string
          entity_id: string
          entity_type: string
          fraud_indicators: Json
          fraud_score: number
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          resolved_at?: string | null
          risk_level: string
          status?: string | null
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          detection_method?: string
          entity_id?: string
          entity_type?: string
          fraud_indicators?: Json
          fraud_score?: number
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          resolved_at?: string | null
          risk_level?: string
          status?: string | null
        }
        Relationships: []
      }
      learning_materials: {
        Row: {
          content_data: Json | null
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          downloads: number | null
          id: string
          material_type: string
          room_id: string | null
          title: string
          topic_tags: string[] | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          content_data?: Json | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          downloads?: number | null
          id?: string
          material_type: string
          room_id?: string | null
          title: string
          topic_tags?: string[] | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          content_data?: Json | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          downloads?: number | null
          id?: string
          material_type?: string
          room_id?: string | null
          title?: string
          topic_tags?: string[] | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_materials_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_accessed: string | null
          material_id: string | null
          progress_percentage: number | null
          quiz_scores: Json | null
          room_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          material_id?: string | null
          progress_percentage?: number | null
          quiz_scores?: Json | null
          room_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          material_id?: string | null
          progress_percentage?: number | null
          quiz_scores?: Json | null
          room_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "learning_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
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
      market_alerts: {
        Row: {
          action_recommended: string | null
          alert_type: string
          created_at: string
          crop_type: string
          current_price: number | null
          id: string
          opportunity_details: Json
          predicted_price: number | null
          region: string | null
          valid_until: string | null
        }
        Insert: {
          action_recommended?: string | null
          alert_type: string
          created_at?: string
          crop_type: string
          current_price?: number | null
          id?: string
          opportunity_details: Json
          predicted_price?: number | null
          region?: string | null
          valid_until?: string | null
        }
        Update: {
          action_recommended?: string | null
          alert_type?: string
          created_at?: string
          crop_type?: string
          current_price?: number | null
          id?: string
          opportunity_details?: Json
          predicted_price?: number | null
          region?: string | null
          valid_until?: string | null
        }
        Relationships: []
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
      market_trends: {
        Row: {
          analysis_date: string
          confidence_score: number | null
          created_at: string
          crop_type: string
          forecast_period: string | null
          id: string
          region: string | null
          trend_data: Json
          trend_direction: string
          trend_type: string
        }
        Insert: {
          analysis_date?: string
          confidence_score?: number | null
          created_at?: string
          crop_type: string
          forecast_period?: string | null
          id?: string
          region?: string | null
          trend_data: Json
          trend_direction: string
          trend_type: string
        }
        Update: {
          analysis_date?: string
          confidence_score?: number | null
          created_at?: string
          crop_type?: string
          forecast_period?: string | null
          id?: string
          region?: string | null
          trend_data?: Json
          trend_direction?: string
          trend_type?: string
        }
        Relationships: []
      }
      message_ratings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          is_helpful: boolean | null
          message_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          message_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          message_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_ratings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_contracts: {
        Row: {
          blockchain_contract_address: string | null
          blockchain_tx_hash: string | null
          buyer_signature: string | null
          buyer_signed_at: string | null
          contract_status: string | null
          contract_terms: Json
          created_at: string | null
          deployed_at: string | null
          farmer_signature: string | null
          farmer_signed_at: string | null
          id: string
          room_id: string
          updated_at: string | null
        }
        Insert: {
          blockchain_contract_address?: string | null
          blockchain_tx_hash?: string | null
          buyer_signature?: string | null
          buyer_signed_at?: string | null
          contract_status?: string | null
          contract_terms: Json
          created_at?: string | null
          deployed_at?: string | null
          farmer_signature?: string | null
          farmer_signed_at?: string | null
          id?: string
          room_id: string
          updated_at?: string | null
        }
        Update: {
          blockchain_contract_address?: string | null
          blockchain_tx_hash?: string | null
          buyer_signature?: string | null
          buyer_signed_at?: string | null
          contract_status?: string | null
          contract_terms?: Json
          created_at?: string | null
          deployed_at?: string | null
          farmer_signature?: string | null
          farmer_signed_at?: string | null
          id?: string
          room_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_contracts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "negotiation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_documents: {
        Row: {
          blockchain_hash: string | null
          created_at: string | null
          document_type: string
          document_url: string
          file_name: string
          file_size: number | null
          id: string
          room_id: string
          uploaded_by: string
          verification_notes: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string | null
          document_type: string
          document_url: string
          file_name: string
          file_size?: number | null
          id?: string
          room_id: string
          uploaded_by: string
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          file_name?: string
          file_size?: number | null
          id?: string
          room_id?: string
          uploaded_by?: string
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_documents_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "negotiation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_messages: {
        Row: {
          blockchain_hash: string | null
          blockchain_timestamp: string | null
          content: string | null
          created_at: string | null
          document_type: string | null
          document_url: string | null
          document_verified: boolean | null
          id: string
          is_read: boolean | null
          location_description: string | null
          location_lat: number | null
          location_lng: number | null
          message_type: Database["public"]["Enums"]["negotiation_message_type"]
          metadata: Json | null
          offer_amount: number | null
          offer_expires_at: string | null
          offer_terms: Json | null
          quality_notes: string | null
          quality_photo_url: string | null
          quality_score: number | null
          response_time_seconds: number | null
          room_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_timestamp?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          document_verified?: boolean | null
          id?: string
          is_read?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message_type: Database["public"]["Enums"]["negotiation_message_type"]
          metadata?: Json | null
          offer_amount?: number | null
          offer_expires_at?: string | null
          offer_terms?: Json | null
          quality_notes?: string | null
          quality_photo_url?: string | null
          quality_score?: number | null
          response_time_seconds?: number | null
          room_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_timestamp?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          document_verified?: boolean | null
          id?: string
          is_read?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message_type?: Database["public"]["Enums"]["negotiation_message_type"]
          metadata?: Json | null
          offer_amount?: number | null
          offer_expires_at?: string | null
          offer_terms?: Json | null
          quality_notes?: string | null
          quality_photo_url?: string | null
          quality_score?: number | null
          response_time_seconds?: number | null
          room_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "negotiation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_participants: {
        Row: {
          can_accept_offers: boolean | null
          can_make_offers: boolean | null
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          can_accept_offers?: boolean | null
          can_make_offers?: boolean | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role: string
          room_id: string
          user_id: string
        }
        Update: {
          can_accept_offers?: boolean | null
          can_make_offers?: boolean | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "negotiation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_rooms: {
        Row: {
          accepted_amount: number | null
          blockchain_hash: string | null
          buyer_id: string | null
          completed_at: string | null
          contract_signed_at: string | null
          created_at: string | null
          crop_listing_id: string | null
          current_offer_amount: number | null
          delivery_terms: Json | null
          farmer_id: string
          id: string
          loan_application_id: string | null
          loan_officer_id: string | null
          metadata: Json | null
          payment_terms: Json | null
          room_type: Database["public"]["Enums"]["negotiation_room_type"]
          status: Database["public"]["Enums"]["negotiation_status"] | null
          subject: string
          supply_batch_id: string | null
          transporter_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_amount?: number | null
          blockchain_hash?: string | null
          buyer_id?: string | null
          completed_at?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          crop_listing_id?: string | null
          current_offer_amount?: number | null
          delivery_terms?: Json | null
          farmer_id: string
          id?: string
          loan_application_id?: string | null
          loan_officer_id?: string | null
          metadata?: Json | null
          payment_terms?: Json | null
          room_type: Database["public"]["Enums"]["negotiation_room_type"]
          status?: Database["public"]["Enums"]["negotiation_status"] | null
          subject: string
          supply_batch_id?: string | null
          transporter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_amount?: number | null
          blockchain_hash?: string | null
          buyer_id?: string | null
          completed_at?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          crop_listing_id?: string | null
          current_offer_amount?: number | null
          delivery_terms?: Json | null
          farmer_id?: string
          id?: string
          loan_application_id?: string | null
          loan_officer_id?: string | null
          metadata?: Json | null
          payment_terms?: Json | null
          room_type?: Database["public"]["Enums"]["negotiation_room_type"]
          status?: Database["public"]["Enums"]["negotiation_status"] | null
          subject?: string
          supply_batch_id?: string | null
          transporter_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_milestones: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          milestone_number: number
          paid_at: string | null
          room_id: string
          status: string | null
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          milestone_number: number
          paid_at?: string | null
          room_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          milestone_number?: number
          paid_at?: string | null
          room_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestones_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "negotiation_rooms"
            referencedColumns: ["id"]
          },
        ]
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
      poll_responses: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          poll_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          poll_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          poll_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "chat_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_condition: string
          created_at: string
          crop_type: string
          farmer_id: string
          id: string
          is_active: boolean | null
          target_price: number
          triggered_at: string | null
        }
        Insert: {
          alert_condition: string
          created_at?: string
          crop_type: string
          farmer_id: string
          id?: string
          is_active?: boolean | null
          target_price: number
          triggered_at?: string | null
        }
        Update: {
          alert_condition?: string
          created_at?: string
          crop_type?: string
          farmer_id?: string
          id?: string
          is_active?: boolean | null
          target_price?: number
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_farmer_id_fkey"
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
      scheduled_sessions: {
        Row: {
          ai_summary: Json | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          expert_id: string | null
          id: string
          max_participants: number | null
          recording_url: string | null
          room_id: string
          scheduled_end: string
          scheduled_start: string
          session_type: string
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_summary?: Json | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          expert_id?: string | null
          id?: string
          max_participants?: number | null
          recording_url?: string | null
          room_id: string
          scheduled_end: string
          scheduled_start: string
          session_type: string
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_summary?: Json | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          expert_id?: string | null
          id?: string
          max_participants?: number | null
          recording_url?: string | null
          room_id?: string
          scheduled_end?: string
          scheduled_start?: string
          session_type?: string
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      score_improvement_goals: {
        Row: {
          action_items: Json
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          dimension: string
          farmer_id: string | null
          id: string
          progress_percentage: number | null
          status: string | null
          target_value: number
          updated_at: string
        }
        Insert: {
          action_items: Json
          completed_at?: string | null
          created_at?: string
          current_value: number
          deadline?: string | null
          dimension: string
          farmer_id?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          target_value: number
          updated_at?: string
        }
        Update: {
          action_items?: Json
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          dimension?: string
          farmer_id?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_improvement_goals_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_questions: {
        Row: {
          answer_message_id: string | null
          answered: boolean | null
          created_at: string | null
          id: string
          question: string
          session_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer_message_id?: string | null
          answered?: boolean | null
          created_at?: string | null
          id?: string
          question: string
          session_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer_message_id?: string | null
          answered?: boolean | null
          created_at?: string | null
          id?: string
          question?: string
          session_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_questions_answer_message_id_fkey"
            columns: ["answer_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_batches: {
        Row: {
          actual_delivery_date: string | null
          batch_number: string
          blockchain_topic_id: string | null
          blockchain_transaction_id: string | null
          buyer_id: string | null
          created_at: string
          crop_id: string | null
          current_location_lat: number | null
          current_location_lng: number | null
          current_status: string
          destination_lat: number | null
          destination_lng: number | null
          estimated_delivery_date: string | null
          farmer_id: string | null
          harvest_date: string
          id: string
          initial_quality_grade: string | null
          quantity_kg: number
          spoilage_risk_score: number | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          batch_number: string
          blockchain_topic_id?: string | null
          blockchain_transaction_id?: string | null
          buyer_id?: string | null
          created_at?: string
          crop_id?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          current_status?: string
          destination_lat?: number | null
          destination_lng?: number | null
          estimated_delivery_date?: string | null
          farmer_id?: string | null
          harvest_date: string
          id?: string
          initial_quality_grade?: string | null
          quantity_kg: number
          spoilage_risk_score?: number | null
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          batch_number?: string
          blockchain_topic_id?: string | null
          blockchain_transaction_id?: string | null
          buyer_id?: string | null
          created_at?: string
          crop_id?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          current_status?: string
          destination_lat?: number | null
          destination_lng?: number | null
          estimated_delivery_date?: string | null
          farmer_id?: string | null
          harvest_date?: string
          id?: string
          initial_quality_grade?: string | null
          quantity_kg?: number
          spoilage_risk_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_batches_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_batches_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_batches_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_checkpoints: {
        Row: {
          batch_id: string
          checkpoint_type: string
          created_at: string
          id: string
          image_urls: string[] | null
          location_accuracy: number | null
          location_lat: number
          location_lng: number
          metadata: Json | null
          notes: string | null
          tampering_detected: boolean | null
          tampering_indicators: Json | null
          timestamp: string
          verification_method: string
          verification_score: number | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          batch_id: string
          checkpoint_type: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          location_accuracy?: number | null
          location_lat: number
          location_lng: number
          metadata?: Json | null
          notes?: string | null
          tampering_detected?: boolean | null
          tampering_indicators?: Json | null
          timestamp?: string
          verification_method: string
          verification_score?: number | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          batch_id?: string
          checkpoint_type?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          location_accuracy?: number | null
          location_lat?: number
          location_lng?: number
          metadata?: Json | null
          notes?: string | null
          tampering_detected?: boolean | null
          tampering_indicators?: Json | null
          timestamp?: string
          verification_method?: string
          verification_score?: number | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_checkpoints_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_documents: {
        Row: {
          ai_analysis: Json | null
          batch_id: string
          compliance_issues: string[] | null
          compliance_status: string | null
          created_at: string
          document_number: string | null
          document_type: string
          document_url: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          metadata: Json | null
          verification_method: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          batch_id: string
          compliance_issues?: string[] | null
          compliance_status?: string | null
          created_at?: string
          document_number?: string | null
          document_type: string
          document_url: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          metadata?: Json | null
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          batch_id?: string
          compliance_issues?: string[] | null
          compliance_status?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          metadata?: Json | null
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_documents_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_logistics: {
        Row: {
          batch_id: string
          created_at: string
          delivery_priority: string
          estimated_cost: number | null
          estimated_duration_hours: number | null
          handling_requirements: string[] | null
          id: string
          optimization_score: number | null
          optimized_route: Json | null
          route_plan: Json
          spoilage_risk_factors: Json | null
          temperature_requirements: Json | null
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          delivery_priority?: string
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          handling_requirements?: string[] | null
          id?: string
          optimization_score?: number | null
          optimized_route?: Json | null
          route_plan: Json
          spoilage_risk_factors?: Json | null
          temperature_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          delivery_priority?: string
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          handling_requirements?: string[] | null
          id?: string
          optimization_score?: number | null
          optimized_route?: Json | null
          route_plan?: Json
          spoilage_risk_factors?: Json | null
          temperature_requirements?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_logistics_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_quality_checks: {
        Row: {
          ai_confidence: number | null
          batch_id: string
          check_type: string
          checkpoint_id: string | null
          contamination_detected: boolean | null
          contamination_type: string | null
          created_at: string
          freshness_score: number | null
          id: string
          image_analysis: Json | null
          quality_grade: string
          quality_score: number
          recommendations: string[] | null
          storage_conditions: Json | null
          visual_indicators: Json | null
        }
        Insert: {
          ai_confidence?: number | null
          batch_id: string
          check_type: string
          checkpoint_id?: string | null
          contamination_detected?: boolean | null
          contamination_type?: string | null
          created_at?: string
          freshness_score?: number | null
          id?: string
          image_analysis?: Json | null
          quality_grade: string
          quality_score: number
          recommendations?: string[] | null
          storage_conditions?: Json | null
          visual_indicators?: Json | null
        }
        Update: {
          ai_confidence?: number | null
          batch_id?: string
          check_type?: string
          checkpoint_id?: string | null
          contamination_detected?: boolean | null
          contamination_type?: string | null
          created_at?: string
          freshness_score?: number | null
          id?: string
          image_analysis?: Json | null
          quality_grade?: string
          quality_score?: number
          recommendations?: string[] | null
          storage_conditions?: Json | null
          visual_indicators?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_quality_checks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_quality_checks_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_checkpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_monitoring: {
        Row: {
          amount: number
          anomaly_reasons: Json | null
          anomaly_score: number | null
          behavioral_patterns: Json | null
          created_at: string | null
          currency: string | null
          from_user_id: string | null
          id: string
          network_analysis: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          to_user_id: string | null
          transaction_data: Json | null
          transaction_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          anomaly_reasons?: Json | null
          anomaly_score?: number | null
          behavioral_patterns?: Json | null
          created_at?: string | null
          currency?: string | null
          from_user_id?: string | null
          id?: string
          network_analysis?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_data?: Json | null
          transaction_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          anomaly_reasons?: Json | null
          anomaly_score?: number | null
          behavioral_patterns?: Json | null
          created_at?: string | null
          currency?: string | null
          from_user_id?: string | null
          id?: string
          network_analysis?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_data?: Json | null
          transaction_id?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      trust_network_edges: {
        Row: {
          created_at: string | null
          from_node_id: string | null
          id: string
          interaction_count: number | null
          last_interaction: string | null
          relationship_type: string
          successful_interactions: number | null
          to_node_id: string | null
          trust_weight: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_node_id?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          relationship_type: string
          successful_interactions?: number | null
          to_node_id?: string | null
          trust_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_node_id?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          relationship_type?: string
          successful_interactions?: number | null
          to_node_id?: string | null
          trust_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_network_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "trust_network_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_network_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "trust_network_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_network_nodes: {
        Row: {
          created_at: string | null
          current_trust_score: number | null
          failed_transactions: number | null
          fraud_reports: number | null
          historical_behavior: Json | null
          id: string
          initial_trust_score: number | null
          last_activity: string | null
          network_connections: number | null
          peer_ratings: Json | null
          successful_transactions: number | null
          trust_level: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string
          verification_count: number | null
        }
        Insert: {
          created_at?: string | null
          current_trust_score?: number | null
          failed_transactions?: number | null
          fraud_reports?: number | null
          historical_behavior?: Json | null
          id?: string
          initial_trust_score?: number | null
          last_activity?: string | null
          network_connections?: number | null
          peer_ratings?: Json | null
          successful_transactions?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
          verification_count?: number | null
        }
        Update: {
          created_at?: string | null
          current_trust_score?: number | null
          failed_transactions?: number | null
          fraud_reports?: number | null
          historical_behavior?: Json | null
          id?: string
          initial_trust_score?: number | null
          last_activity?: string | null
          network_connections?: number | null
          peer_ratings?: Json | null
          successful_transactions?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
          verification_count?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          badge_icon: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          badge_icon?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          badge_icon?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      verification_quality_checks: {
        Row: {
          ai_analysis: Json | null
          check_result: string
          check_type: string
          created_at: string | null
          id: string
          issues_found: Json | null
          quality_score: number | null
          recommendations: Json | null
          submission_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          check_result: string
          check_type: string
          created_at?: string | null
          id?: string
          issues_found?: Json | null
          quality_score?: number | null
          recommendations?: Json | null
          submission_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          check_result?: string
          check_type?: string
          created_at?: string | null
          id?: string
          issues_found?: Json | null
          quality_score?: number | null
          recommendations?: Json | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_quality_checks_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "verification_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_submissions: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          farmer_id: string | null
          fraud_flags: Json | null
          geolocation: Json | null
          id: string
          image_urls: string[] | null
          metadata: Json | null
          submission_type: string
          updated_at: string | null
          verification_score: number | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          farmer_id?: string | null
          fraud_flags?: Json | null
          geolocation?: Json | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          submission_type: string
          updated_at?: string | null
          verification_score?: number | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          farmer_id?: string | null
          fraud_flags?: Json | null
          geolocation?: Json | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          submission_type?: string
          updated_at?: string | null
          verification_score?: number | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_submissions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          recommendations: Json | null
          region: string
          severity: string
          title: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          recommendations?: Json | null
          region: string
          severity: string
          title: string
          valid_from: string
          valid_until: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          recommendations?: Json | null
          region?: string
          severity?: string
          title?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      wisdom_points_log: {
        Row: {
          created_at: string | null
          giver_id: string
          id: string
          message_id: string | null
          points: number
          reason: string | null
          recipient_id: string
          room_id: string
        }
        Insert: {
          created_at?: string | null
          giver_id: string
          id?: string
          message_id?: string | null
          points: number
          reason?: string | null
          recipient_id: string
          room_id: string
        }
        Update: {
          created_at?: string | null
          giver_id?: string
          id?: string
          message_id?: string | null
          points?: number
          reason?: string | null
          recipient_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wisdom_points_log_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wisdom_points_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
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
      chat_member_role: "member" | "moderator" | "admin"
      chat_room_type: "regional" | "crop_specific" | "cooperative" | "emergency"
      message_type: "text" | "voice" | "image" | "poll" | "alert"
      negotiation_message_type:
        | "offer"
        | "counter_offer"
        | "accept"
        | "reject"
        | "question"
        | "document"
        | "payment_proposal"
        | "location_update"
        | "quality_check"
      negotiation_room_type:
        | "farmer_buyer"
        | "loan_application"
        | "supply_chain"
      negotiation_status:
        | "active"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
        | "pending_verification"
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
      chat_member_role: ["member", "moderator", "admin"],
      chat_room_type: ["regional", "crop_specific", "cooperative", "emergency"],
      message_type: ["text", "voice", "image", "poll", "alert"],
      negotiation_message_type: [
        "offer",
        "counter_offer",
        "accept",
        "reject",
        "question",
        "document",
        "payment_proposal",
        "location_update",
        "quality_check",
      ],
      negotiation_room_type: [
        "farmer_buyer",
        "loan_application",
        "supply_chain",
      ],
      negotiation_status: [
        "active",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
        "pending_verification",
      ],
    },
  },
} as const
