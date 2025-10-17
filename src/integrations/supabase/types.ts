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
