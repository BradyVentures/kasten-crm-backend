import { Request } from 'express';

export type UserRole = 'admin' | 'employee';
export type LeadStatus = 'neu' | 'kontaktiert' | 'qualifiziert' | 'angebot' | 'gewonnen' | 'verloren';
export type ServiceType = 'paket' | 'addon';
export type ActivityType = 'anruf' | 'email' | 'status_aenderung' | 'notiz' | 'zuweisung' | 'erstellt' | 'import' | 'konvertiert';

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

export interface Lead {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  source: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  lead_id: string | null;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  assigned_to: string | null;
  converted_at: Date;
  converted_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  price_model: string;
  type: ServiceType;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerService {
  id: string;
  customer_id: string;
  service_id: string;
  sold_price: number;
  price_model: string;
  sold_date: string;
  sold_by: string | null;
  notes: string | null;
  created_at: Date;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface LeadLock {
  id: string;
  lead_id: string;
  user_id: string;
  locked_at: Date;
  expires_at: Date;
}

export type TodoStatus = 'offen' | 'erledigt';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  due_date: string | null;
  customer_id: string | null;
  customer_service_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
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
