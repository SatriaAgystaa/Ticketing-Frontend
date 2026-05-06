// ============================================================
// User Roles
// ============================================================
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ORGANIZER: "organizer",
  BUYER: "buyer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================
// Event Staff Roles (event-scoped)
// ============================================================
export const STAFF_ROLES = {
  CO_ORGANIZER: "co_organizer",
  GATE_SCANNER: "gate_scanner",
} as const;

export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES];

// ============================================================
// Event Staff Permissions
// ============================================================
export const STAFF_PERMISSIONS = {
  EDIT_EVENT: "edit_event",
  VIEW_REVENUE: "view_revenue",
  VIEW_ATTENDEE: "view_attendee",
  SEND_BLAST: "send_blast",
  MANAGE_PROMO: "manage_promo",
} as const;

export type StaffPermission =
  (typeof STAFF_PERMISSIONS)[keyof typeof STAFF_PERMISSIONS];

// ============================================================
// Event Status
// ============================================================
export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ON_SALE: "on_sale",
  SOLD_OUT: "sold_out",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

// ============================================================
// Event Visibility
// ============================================================
export const EVENT_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  UNLISTED: "unlisted",
} as const;

export type EventVisibility =
  (typeof EVENT_VISIBILITY)[keyof typeof EVENT_VISIBILITY];

// ============================================================
// Event Type
// ============================================================
export const EVENT_TYPE = {
  OFFLINE: "offline",
  ONLINE: "online",
  HYBRID: "hybrid",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

// ============================================================
// Order Status
// ============================================================
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  EXPIRED: "expired",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// ============================================================
// Payment Status
// ============================================================
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SETTLEMENT: "settlement",
  DENY: "deny",
  CANCEL: "cancel",
  EXPIRE: "expire",
  FRAUD: "fraud",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ============================================================
// Ticket Status
// ============================================================
export const TICKET_STATUS = {
  ACTIVE: "active",
  USED: "used",
  CANCELLED: "cancelled",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// ============================================================
// Payout Status
// ============================================================
export const PAYOUT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

// ============================================================
// Waiting Room Status
// ============================================================
export const WAITING_ROOM_STATUS = {
  WAITING: "waiting",
  CALLED: "called",
  CHECKOUT: "checkout",
  EXPIRED: "expired",
} as const;

export type WaitingRoomStatus =
  (typeof WAITING_ROOM_STATUS)[keyof typeof WAITING_ROOM_STATUS];

// ============================================================
// KYC Status
// ============================================================
export const KYC_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

// ============================================================
// Custom Form Field Types
// ============================================================
export const FIELD_TYPES = {
  TEXT: "text",
  TEXTAREA: "textarea",
  SELECT: "select",
  CHECKBOX: "checkbox",
  RADIO: "radio",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

// ============================================================
// Discount Type
// ============================================================
export const DISCOUNT_TYPE = {
  FLAT: "flat",
  PERCENT: "percent",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

// ============================================================
// API Error Codes (from backend)
// ============================================================
export const ERROR_CODES = {
  // Auth
  ERR_INVALID_CREDENTIALS: "ERR_INVALID_CREDENTIALS",
  ERR_EMAIL_NOT_VERIFIED: "ERR_EMAIL_NOT_VERIFIED",
  ERR_TOKEN_EXPIRED: "ERR_TOKEN_EXPIRED",

  // Events
  ERR_EVENT_NOT_FOUND: "ERR_EVENT_NOT_FOUND",
  ERR_EVENT_NOT_ON_SALE: "ERR_EVENT_NOT_ON_SALE",
  ERR_ORGANIZER_NOT_VERIFIED: "ERR_ORGANIZER_NOT_VERIFIED",

  // Tickets
  ERR_TICKET_SOLD_OUT: "ERR_TICKET_SOLD_OUT",
  ERR_PURCHASE_LIMIT_EXCEEDED: "ERR_PURCHASE_LIMIT_EXCEEDED",
  ERR_TICKET_NOT_FOUND: "ERR_TICKET_NOT_FOUND",
  ERR_TICKET_ALREADY_USED: "ERR_TICKET_ALREADY_USED",
  ERR_TICKET_CANCELLED: "ERR_TICKET_CANCELLED",
  ERR_TICKET_WRONG_EVENT: "ERR_TICKET_WRONG_EVENT",

  // Orders
  ERR_ORDER_EXPIRED: "ERR_ORDER_EXPIRED",

  // Promo
  ERR_PROMO_NOT_FOUND: "ERR_PROMO_NOT_FOUND",
  ERR_PROMO_EXPIRED: "ERR_PROMO_EXPIRED",
  ERR_PROMO_LIMIT_REACHED: "ERR_PROMO_LIMIT_REACHED",

  // Waiting Room
  ERR_CHECKOUT_TOKEN_INVALID: "ERR_CHECKOUT_TOKEN_INVALID",
  ERR_BLAST_RATE_LIMIT: "ERR_BLAST_RATE_LIMIT",

  // Payout
  ERR_INSUFFICIENT_BALANCE: "ERR_INSUFFICIENT_BALANCE",
  ERR_PAYOUT_ALREADY_PENDING: "ERR_PAYOUT_ALREADY_PENDING",

  // Payment
  ERR_WEBHOOK_INVALID_SIGNATURE: "ERR_WEBHOOK_INVALID_SIGNATURE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================
// Polling Intervals
// ============================================================
export const POLLING = {
  WAITING_ROOM: 5_000, // 5 seconds
  STOCK_COUNTER: 30_000, // 30 seconds
  PAYMENT_STATUS: 5_000, // 5 seconds
} as const;

// ============================================================
// Limits
// ============================================================
export const LIMITS = {
  ORDER_EXPIRY_MINUTES: 15,
  CHECKOUT_TOKEN_MINUTES: 10,
  BLAST_COOLDOWN_MINUTES: 60,
  RESEND_TICKET_PER_HOUR: 3,
} as const;
