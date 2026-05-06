import type {
  DiscountType,
  EventStatus,
  EventType,
  EventVisibility,
  FieldType,
  StaffPermission,
  StaffRole,
} from "@/lib/utils/constants";
import type { OrganizerPublic } from "./user";

export interface Event {
  id: string;
  organizer_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  banner_url: string | null;
  event_type: EventType;
  venue_name: string | null;
  venue_address: string | null;
  venue_province: string | null;
  venue_city: string | null;
  venue_district: string | null;
  venue_subdistrict: string | null;
  venue_maps_url: string | null;
  online_url: string | null;
  starts_at: string;
  ends_at: string;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  status: EventStatus;
  visibility: EventVisibility;
  is_high_demand: boolean;
  allow_attendance_list: boolean;
  total_capacity: number;
  refund_policy: string | null;
  platform_fee_flat: number;
  platform_fee_percent: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Event card shown in listing / discovery */
export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  banner_url: string | null;
  organizer: {
    id: string;
    brand_name: string;
    is_verified: boolean;
  };
  venue_city: string | null;
  starts_at: string;
  status: EventStatus;
  min_price: number;
  max_price: number;
  is_sold_out: boolean;
}

/** Full event detail page data */
export interface EventDetail extends Event {
  organizer: OrganizerPublic;
  category: EventCategory;
  ticket_types: TicketType[];
  custom_form_fields: CustomFormField[];
  is_following: boolean;
  is_wishlisted: boolean;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  quota: number;
  sold_count: number;
  max_per_user: number;
  is_early_bird: boolean;
  early_bird_ends_at: string | null;
  early_bird_quota: number | null;
  is_visible: boolean;
  sort_order: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
}

export interface CustomFormField {
  id: string;
  event_id: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
}

export interface PromoCode {
  id: string;
  event_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount: number | null;
  usage_limit: number;
  used_count: number;
  max_per_user: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface EventStaff {
  id: string;
  event_id: string;
  user_id: string;
  role: StaffRole;
  permissions: StaffPermission[];
  invited_by: string;
  accepted_at: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface EventStats {
  total_revenue: number;
  total_orders: number;
  total_tickets_sold: number;
  total_checkins: number;
  ticket_type_breakdown: {
    name: string;
    sold: number;
    quota: number;
    revenue: number;
  }[];
}

export interface Attendee {
  order_id: string;
  ticket_code: string;
  holder_name: string;
  email: string;
  ticket_type: string;
  status: string;
  checked_in_at: string | null;
  purchased_at: string;
}
