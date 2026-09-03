// =========================================================
// IASIS AGENDA - FINANCIAL, PACKAGES, LOYALTY & PROMOTIONS
// =========================================================

import { PaymentMethod } from './index';

export interface Package {
  id: string;
  name: string;
  description?: string;
  service_id?: string;
  service_name?: string;
  total_sessions: number;
  price: number;
  validity_days: number;
  active: boolean;
  created_at: string;
}

export interface ClientPackage {
  id: string;
  client_id: string;
  client_name?: string;
  package_id: string;
  package_name: string;
  total_sessions: number;
  used_sessions: number;
  price_paid: number;
  purchased_at: string;
  expires_at: string;
  status: 'active' | 'completed' | 'expired';
}

export interface PackageUsage {
  id: string;
  client_package_id: string;
  appointment_id?: string;
  session_number: number;
  used_at: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  service_id?: string;
  min_spend?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  active: boolean;
  created_at: string;
}

export type LoyaltyModel = 'points' | 'cashback';

export interface LoyaltyAccount {
  id: string;
  client_id: string;
  client_name?: string;
  points_balance: number;
  cashback_balance: number;
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'VIP';
  total_earned_points: number;
  total_cashback_earned: number;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  client_id: string;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  cashback_amount: number;
  description: string;
  appointment_id?: string;
  created_at: string;
}

export interface CashRegister {
  id: string;
  opened_at: string;
  closed_at?: string;
  opened_by_name: string;
  closed_by_name?: string;
  initial_amount: number;
  closing_expected_amount?: number;
  closing_reported_amount?: number;
  difference_amount?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface CashMovement {
  id: string;
  cash_register_id: string;
  type: 'income' | 'expense' | 'sangria' | 'reforco';
  amount: number;
  description: string;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface CommissionRecord {
  id: string;
  professional_id: string;
  professional_name: string;
  appointment_id?: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  paid_at?: string;
  notes?: string;
  created_at?: string;
}
