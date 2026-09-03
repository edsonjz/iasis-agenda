// =========================================================
// IASIS AGENDA - ANAMNESIS, EVOLUTION, PHOTOS & PRODUCTS
// =========================================================

export type AnamnesisFieldType =
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'single_choice'
  | 'multiple_choice'
  | 'scale'
  | 'signature'
  | 'photo'
  | 'notice';

export interface AnamnesisField {
  id: string;
  type: AnamnesisFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[]; // For single_choice and multiple_choice
  min?: number;
  max?: number;
  defaultValue?: any;
}

export interface AnamnesisTemplate {
  id: string;
  title: string;
  description?: string;
  category: 'cilios' | 'labios' | 'sobrancelhas' | 'remocao' | 'facial' | 'corporal' | 'personalizado';
  fields: AnamnesisField[];
  terms_text?: string;
  requires_signature: boolean;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AnamnesisAnswer {
  field_id: string;
  label: string;
  type: AnamnesisFieldType;
  value: any;
}

export interface AnamnesisRecord {
  id: string;
  client_id: string;
  template_id: string;
  template_title: string;
  appointment_id?: string;
  professional_id?: string;
  fields_snapshot: AnamnesisField[]; // Immutable snapshot
  answers: Record<string, any>; // field_id -> value
  signature_data_url?: string;
  signed_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface TreatmentEvolution {
  id: string;
  client_id: string;
  appointment_id?: string;
  professional_id: string;
  procedure_name: string;
  session_number?: number;
  date: string; // YYYY-MM-DD or ISO
  description: string;
  products_used: string[]; // Product names or IDs
  reaction_result?: string;
  client_feedback?: string;
  recommendations?: string;
  next_session_date?: string;
  created_at: string;
}

export type PhotoType = 'before' | 'after' | 'during' | 'reference';

export interface TreatmentPhoto {
  id: string;
  client_id: string;
  appointment_id?: string;
  evolution_id?: string;
  procedure_name: string;
  photo_type: PhotoType;
  image_url: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  cost_price: number;
  sale_price?: number;
  stock_quantity: number;
  min_stock_alert?: number;
  unit: 'un' | 'ml' | 'g' | 'kit' | 'par';
  expiration_date?: string;
  batch_number?: string; // Lote
  active: boolean;
  created_at: string;
}
