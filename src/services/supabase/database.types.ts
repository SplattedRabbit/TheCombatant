/**
 * @module    database.types
 * @summary   TypeScript definitions for the Supabase PostgreSQL database schema (Profiles, Characters, Campaigns, CampaignMembers).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          class_summary: string | null;
          level: number;
          character_data: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          class_summary?: string | null;
          level?: number;
          character_data?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          class_summary?: string | null;
          level?: number;
          character_data?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          dm_user_id: string;
          name: string;
          description: string | null;
          invite_code: string;
          active_encounter_state: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dm_user_id: string;
          name: string;
          description?: string | null;
          invite_code: string;
          active_encounter_state?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dm_user_id?: string;
          name?: string;
          description?: string | null;
          invite_code?: string;
          active_encounter_state?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_members: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          character_id: string | null;
          role: 'DM' | 'PLAYER' | 'SPECTATOR';
          joined_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          user_id: string;
          character_id?: string | null;
          role?: 'DM' | 'PLAYER' | 'SPECTATOR';
          joined_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          user_id?: string;
          character_id?: string | null;
          role?: 'DM' | 'PLAYER' | 'SPECTATOR';
          joined_at?: string;
        };
      };
    };
  };
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type CharacterRow = Database['public']['Tables']['characters']['Row'];
export type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
export type CampaignMemberRow = Database['public']['Tables']['campaign_members']['Row'];
