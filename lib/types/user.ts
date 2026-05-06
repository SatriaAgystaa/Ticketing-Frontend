import type { KycStatus, UserRole } from "@/lib/utils/constants";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffEvent {
  event_id: string;
  role: string;
  permissions: string[];
  accepted_at: string | null;
  invitation_token: string | null;
  event: {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    banner_url: string | null;
  };
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  brand_name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  kyc_status: KycStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizerPublic {
  id: string;
  brand_name: string;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  follower_count: number;
  event_count: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
