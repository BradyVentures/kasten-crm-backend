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

export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  category: string;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

// ─── Projects ─────────────────────────────────────────────

export type ProjectStatus = 'entwurf' | 'angebot' | 'beauftragt' | 'in_arbeit' | 'abgeschlossen' | 'storniert';
export type ModuleCategory = 'design' | 'entwicklung' | 'marketing' | 'beratung' | 'hosting' | 'wartung' | 'sonstiges';
export type ComplexityLevel = 'einfach' | 'mittel' | 'komplex' | 'sehr_komplex';
export type ModuleStatus = 'geplant' | 'in_arbeit' | 'abgeschlossen' | 'pausiert';
export type ProjectDocumentType = 'briefing' | 'angebot' | 'kalkulation' | 'protokoll' | 'sonstiges';
export type ProjectActivityType = 'notiz' | 'anruf' | 'email' | 'meeting' | 'status_aenderung' | 'erstellt' | 'dokument';

export interface Project {
  id: string;
  title: string;
  customer_id: string | null;
  prospect_name: string | null;
  prospect_contact: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  description: string | null;
  status: ProjectStatus;
  estimated_start: string | null;
  estimated_end: string | null;
  assigned_to: string | null;
  total_internal_cost: number;
  total_external_cost: number;
  total_price: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectModule {
  id: string;
  project_id: string;
  name: string;
  category: ModuleCategory;
  description: string | null;
  internal_cost: number | null;
  external_cost: number | null;
  price: number | null;
  hourly_rate: number | null;
  estimated_hours: number | null;
  complexity: ComplexityLevel | null;
  status: ModuleStatus;
  phase: string | null;
  estimated_weeks: number | null;
  tech_stack: string | null;
  dependencies: string | null;
  risks: string | null;
  dsgvo_notes: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  type: ProjectDocumentType;
  title: string;
  content: string;
  template_data: Record<string, unknown> | null;
  created_by: string;
  created_at: Date;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  type: ProjectActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
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
