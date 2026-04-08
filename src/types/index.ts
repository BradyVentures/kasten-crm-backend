import { Request } from 'express';

export type UserRole = 'admin' | 'employee';
export type OfferStatus = 'entwurf' | 'gesendet' | 'angenommen' | 'abgelehnt';
export type TodoStatus = 'offen' | 'erledigt';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  customer_number: string | null;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  due_date: string | null;
  customer_id: string | null;
  offer_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductAttribute {
  id: string;
  category_id: string;
  slug: string;
  label: string;
  attribute_type: 'select' | 'number' | 'boolean' | 'text';
  unit: string | null;
  is_required: boolean;
  sort_order: number;
}

export interface ProductAttributeOption {
  id: string;
  attribute_id: string;
  value: string;
  label: string;
  price_modifier: number;
  is_default: boolean;
  sort_order: number;
}

export interface PricingRule {
  id: string;
  category_id: string;
  rule_type: 'base_sqm' | 'base_unit' | 'size_surcharge' | 'attribute_surcharge' | 'min_price';
  attribute_slug: string | null;
  option_value: string | null;
  min_width: number | null;
  max_width: number | null;
  min_height: number | null;
  max_height: number | null;
  price: number;
  is_active: boolean;
}

export interface Offer {
  id: string;
  offer_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OfferStatus;
  notes: string | null;
  valid_until: string | null;
  net_total: number;
  vat_rate: number;
  vat_amount: number;
  gross_total: number;
  discount_amount: number;
  discount_note: string | null;
  created_by: string;
  sent_at: Date | null;
  accepted_at: Date | null;
  declined_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OfferItem {
  id: string;
  offer_id: string;
  category_slug: string;
  product_name: string;
  description: string | null;
  configuration: Record<string, unknown>;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
