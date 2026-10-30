export type UserRole = 'buyer' | 'seller' | 'courier' | 'admin';
export type KycStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  kyc_status: KycStatus;
  is_active: boolean;
  created_at: string;
}

export type TransactionStatus = 
  | 'draft'
  | 'pending_payment'
  | 'payment_held'
  | 'order_prepared'
  | 'in_transit'
  | 'delivered'
  | 'in_inspection'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export type DealCategory =
  | 'goods_electronics'
  | 'parcels'
  | 'vehicles'
  | 'freelance_services'
  | 'digital_products'
  | 'wholesale_orders'
  | 'milestone_work';

export type DeliveryType = 'courier' | 'in_person' | 'collection_point' | 'digital_service';

export interface TransactionTerms {
  id: number;
  transaction_id: number;
  delivery_method: string;
  inspection_period_days: number;
  acceptance_conditions: string;
  refund_conditions: string;
  release_requirements: string;
  buyer_accepted: boolean;
  seller_accepted: boolean;
  buyer_accepted_at?: string;
  seller_accepted_at?: string;
  fully_accepted: boolean;
}

export interface DeliveryAssignment {
  id: number;
  transaction_id: number;
  courier_id?: number;
  pickup_address: string;
  dropoff_address: string;
  recipient_name: string;
  recipient_phone: string;
  current_status: 'assigned' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickup_time?: string;
  delivery_time?: string;
  notes?: string;
}

export interface DeliveryEvent {
  id: number;
  transaction_id: number;
  event_type: string;
  description: string;
  actor_id?: number;
  actor_name: string;
  metadata?: any;
  created_at: string;
}

export interface DealMessage {
  id: number;
  transaction_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface Dispute {
  id: number;
  transaction_id: number;
  initiator_id: number;
  initiator_name?: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: 'open' | 'under_review' | 'resolved_buyer_refund' | 'resolved_seller_payout' | 'resolved_split' | 'rejected';
  resolution?: string;
  resolution_notes?: string;
  resolved_by_admin_id?: number;
  resolved_by_admin_name?: string;
  created_at: string;
  resolved_at?: string;
  transaction?: Transaction;
}

export interface TransactionPermissions {
  can_accept_terms: boolean;
  can_pay: boolean;
  can_mark_ready: boolean;
  can_view_pickup_code: boolean;
  can_view_handover_code: boolean;
  can_accept_and_release: boolean;
  can_raise_dispute: boolean;
  is_buyer: boolean;
  is_seller: boolean;
  is_courier: boolean;
  is_admin: boolean;
}

export interface Transaction {
  id: number;
  reference: string;
  title: string;
  description: string;
  category: DealCategory;
  buyer_id: number;
  seller_id: number;
  courier_id?: number;
  buyer?: User;
  seller?: User;
  courier?: User;
  amount: number;
  platform_fee: number;
  delivery_fee: number;
  total_amount: number;
  delivery_type: DeliveryType;
  status: TransactionStatus;
  inspection_period_days: number;
  inspection_deadline?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  terms?: TransactionTerms;
  has_active_dispute: boolean;
  dispute_count: number;
  events?: DeliveryEvent[];
  messages?: DealMessage[];
  disputes?: Dispute[];
  delivery_assignment?: DeliveryAssignment;
  permissions?: TransactionPermissions;
}

export interface Payment {
  id: number;
  transaction_id: number;
  user_id: number;
  amount: number;
  currency: string;
  provider: string;
  checkout_request_id?: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  failure_reason?: string;
  created_at: string;
  completed_at?: string;
  transaction_ref?: string;
}

export interface LedgerEntry {
  id: number;
  user_id: number;
  transaction_id?: number;
  entry_type: string;
  amount: number;
  direction: 'credit' | 'debit';
  balance_after: number;
  description: string;
  reference: string;
  provider: string;
  status: string;
  created_at: string;
}

export interface WalletSummary {
  settled_balance: number;
  buyer_escrow_holding: number;
  seller_pending_settlement: number;
  total_completed_sales: number;
  currency: string;
  withdrawal_notice: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_volume: number;
  active_escrow_holding: number;
  platform_revenue: number;
  open_disputes: number;
  dispute_rate: number;
  reconciliation_rate: number;
  active_couriers: number;
}
